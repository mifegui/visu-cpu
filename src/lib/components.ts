import { read } from '$app/server';
import { readable, writable, type Writable } from 'svelte/store';
import { Instruction, InstructionType } from './instruction';

export interface Component {
	id: string;
	name: string;
	instructionsInside: Instruction[];
	goingTo: Component['id'][];
	instructionsPerCycle: number;
}

export const IMTComponents: Component[] = [
	{
		name: 'IF', // Instruction Fetch
		id: 'IF',
		instructionsInside: [
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x0, 1, 2, 3), // add x1, x2, x3
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x1, 4, 1, 2), // sll x4, x1, x2 (shift left logical)
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x2, 5, 4, 1), // slt x5, x4, x1 (set less than)
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x3, 6, 5, 4), // xor x6, x5, x4 (exclusive or)
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x4, 7, 6, 5), // srl x7, x6, x5 (shift right logical)
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x5, 8, 7, 6), // or x8, x7, x6 (logical OR)
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x6, 9, 8, 7) // and x9, x8, x7 (logical AND)
		],
		goingTo: ['ID'],
		instructionsPerCycle: 1
	},
	{
		name: 'ID', // Instruction Decode
		id: 'ID',
		instructionsInside: [],
		goingTo: ['EX'],
		instructionsPerCycle: 1
	},
	{
		name: 'EX', // Execute
		id: 'EX',
		instructionsInside: [],
		goingTo: ['MEM'],
		instructionsPerCycle: 1
	},
	{
		name: 'MEM', // Memory
		id: 'MEM',
		instructionsInside: [],
		goingTo: ['WB'],
		instructionsPerCycle: 1
	},
	{
		name: 'WB', // Write Back
		id: 'WB',
		instructionsInside: [],
		goingTo: [],
		instructionsPerCycle: 1
	}
];

export class ProcessorManager {
	private clock = 0;
	public components: Writable<Component[]> = writable(IMTComponents);
	constructor() {}
	run() {
		const executeCycle = () => {
			this.clock++;
			this.components.update((components) => {
				const processed: Instruction[] = [];
				for (let i = components.length - 1; i >= 0; i--) {
					let component = components[i];
					if (component.instructionsInside.length == 0) continue;
					for (let j = 0; j < component.instructionsPerCycle; j++) {
						const instruction = component.instructionsInside.shift();
						if (!instruction) continue;
						console.log(processed);
						if (processed.find((i) => i.id == instruction!.id)) continue;

						const nextComponent = components.find((c) => c.id === component.goingTo[0]);
						if (nextComponent) {
							nextComponent.instructionsInside.push(instruction);
							console.log(nextComponent);
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
		executeCycle();
	}
}
