import { read } from '$app/server';
import { get, readable, writable, type Writable } from 'svelte/store';
import { Instruction, InstructionType } from './instruction';
import { EscalarSimulator, Pentium1Simulator, type Component } from './component';
import { configToArchitectureMatrix, copyArchitecture, type Configuration } from './configuration';

export class ProcessorManager {
	// construtor da classe pra receber a variável config
	// e atribuir ela a uma variável privada
	//private config: Writable<Configuration>;
	private clock = 0;
	public components: Writable<Component[]> = writable(EscalarSimulator);
	private paused = false;
	private config: Configuration;

	constructor(config: Writable<Configuration>) {
		// on condifg change
		this.changeConfig(get(config));
		this.config = get(config);
		config.subscribe((newConfig) => {
			if (newConfig.pause == this.config.pause) {
				this.changeConfig(newConfig);
			}
			this.paused = newConfig.pause;
			this.config = newConfig;
		});
	}

	private changeConfig(config: Configuration) {
		this.clock = 0;
		this.components.set(
			copyArchitecture(configToArchitectureMatrix[config.multithreading][config.scalar])
		);
	}

	private processEachComponent(components: Component[]) {
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
	}
	async run() {
		const executeCycle = () => {
			if (!this.paused) {
				this.clock++;
				this.components.update((components) => {
					return this.processEachComponent(components);
				});
			}
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
