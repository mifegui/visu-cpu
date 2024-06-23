import { read } from '$app/server';
import { get, readable, writable, type Writable } from 'svelte/store';
import { Instruction } from './instruction';
import {
	EscalarSimulator,
	Pentium1Simulator,
	copyArchitecture,
	numberOfInstructionsFromComponents,
	type Component
} from './component';
import { configToArchitectureMatrix, type Configuration } from './configuration';
import { Metrics } from './metrics';

export class ProcessorManager {
	//private config: Writable<Configuration>;
	private clock = 0;
	public components: Writable<Component[]> = writable(EscalarSimulator);
	private paused = false;
	private config: Configuration;
	private isOver = false;
	public metrics = new Metrics();
	public numExecutionCycles = 0;

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
		let runAgain = this.isOver == true;
		this.isOver = false;
		this.metrics.setIpc(0);
		this.metrics.setCiclos(0);
		this.numExecutionCycles = 0;
		if (runAgain) this.run();
		this.clock = 0;
		this.components.set(
			copyArchitecture(configToArchitectureMatrix[config.multithreading][config.scalar])
		);
	}
	isRegisterBankFull(components: Component[]): boolean {
		const registerBank = components.find((component) => component.id === 'BR');
		return registerBank
			? registerBank.instructionsInside.length === numberOfInstructionsFromComponents(components)
			: false;
	}
	countCycles(component: Component) {
		if (
			component.id.includes('EX') ||
			component.id.includes('ULA') ||
			component.id.includes('LU') ||
			component.id.includes('SU')
		) {
			this.numExecutionCycles++;
			console.log(this.numExecutionCycles);
		}
	}

	private processEachComponent(components: Component[]) {
		const processed: Instruction[] = [];
		let alreadyCounted = 0;
		for ( let k = 0; k < components.length; k++) {
			let component = components[k];
			if (
				component.id.includes('EX') ||
				component.id.includes('ULA') ||
				component.id.includes('LU') ||
				component.id.includes('SU')
			) {
				if(alreadyCounted == 0 && component.instructionsInside.length > 0){
					alreadyCounted++;
				this.numExecutionCycles++;
				}
			}
		}
		for (let i = components.length - 1; i >= 0; i--) {
			let component = components[i];
			if (component.instructionsInside.length == 0) continue;
			let nProcessed = 0;
			let toRemove = [];
			
			for (
				let j = 0;
				j < component.instructionsInside.length && nProcessed < component.instructionsPerCycle;
				j++
			) {
				if (!component.goingTo.length) continue;
				const instruction = component.instructionsInside[j];
				if (!instruction) continue;
				if (processed.find((i) => i.id == instruction!.id)) continue;

				const nextComponentId = !component.decideToGoWhere
					? component.goingTo[0]
					: component.decideToGoWhere!(
						instruction,
						component.goingTo.map((id) => components.find((c) => c.id === id)!)
					);
				const nextComponent = components.find((c) => c.id === nextComponentId);
				if (!nextComponent) continue;
				if (
					nextComponent.maxInside &&
					nextComponent.instructionsInside.length >= nextComponent.maxInside
				) {
					continue;
				}

				toRemove.push(component.instructionsInside[j]);
				nextComponent.instructionsInside.push(instruction);
				processed.push(instruction);
				nProcessed++;
			}
			toRemove.forEach((ins) => {
				component.instructionsInside = component.instructionsInside.filter((i) => i.id != ins.id);
			});
			if (this.isRegisterBankFull(components)) {
				// console.log('Banco de Registradores está cheio com  instruções.`);
				console.log(
					'IPC: ',
					numberOfInstructionsFromComponents(components) / this.numExecutionCycles
				);
				console.log('clock: ', this.clock);
				this.metrics.setIpc(
					numberOfInstructionsFromComponents(components) / this.numExecutionCycles
				);
				this.metrics.setCiclos(this.numExecutionCycles);
				this.isOver = true;
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
			if (!this.isOver) {
				setTimeout(() => {
					executeCycle();
				}, 500);
			}
		};
		await delay(500);
		executeCycle();
	}
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
