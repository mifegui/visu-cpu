import { read } from '$app/server';
import { get, readable, writable, type Writable } from 'svelte/store';
import { Instruction, InstructionType } from './instruction';
import { EscalarSimulator, Pentium1Simulator, type Component } from './component';
import type { Configuration } from './configuration';

export class ProcessorManager {
	// construtor da classe pra receber a variável config
	// e atribuir ela a uma variável privada
	//private config: Writable<Configuration>;
	private configTmp: string;
	private clock = 0;
	public components: Writable<Component[]>;

	constructor(configTmp: string) {
		console.log('construtor');
		console.log(configTmp);
		// no
		//this.config = config;
		this.configTmp = configTmp;
		/*
		if (get(config).scalar === 'super-scalar'){
		this.components = writable(Pentium1Simulator);
		} else {
			this.components = writable(EscalarSimulator);
		}
			*/
		if (configTmp === 'super-scalar') {
			console.log('super escalar');
			this.components = writable(Pentium1Simulator);
		} else {
			console.log('escalar');
			this.components = writable(EscalarSimulator);
		}
	}

	onConfigChange(newConfig: string){
		console.log('onConfigChange');
		if (newConfig === 'super-scalar') {
			console.log('super escalar');
			this.components.set(Pentium1Simulator);
		} else {
			console.log('escalar');
			this.components.set(EscalarSimulator);
		}	
	}


	async run() {
		const executeCycle = () => {
			this.clock++;
			this.components.update((components) => {
				const processed: Instruction[] = [];
				for (let i = components.length - 1; i >= 0; i--) {
					let component = components[i];
					if (component.instructionsInside.length == 0) continue;
					for (let j = 0; j < component.instructionsPerCycle; j++) {
						if (!component.goingTo.length) continue;
						const instruction = component.instructionsInside.shift();
						if (!instruction) continue;
						if (processed.find((i) => i.id == instruction!.id)) continue;

						const nextComponentId = !component.decideToGoWhere
							? component.goingTo[0]
							: component.decideToGoWhere!(
									instruction,
									component.goingTo.map((id) => components.find((c) => c.id === id)!)
								);
						const nextComponent = components.find((c) => c.id === nextComponentId);
						if (nextComponent) {
							nextComponent.instructionsInside.push(instruction);
							processed.push(instruction);
						}
					}
				}
				return components;
			});
			setTimeout(() => {
				executeCycle();
			}, 2000);
		};
		await delay(2000);
		executeCycle();
	}
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
