import { read } from '$app/server';
import { readable, writable, type Writable } from 'svelte/store';
import { Instruction, InstructionType } from './simulator';

export interface Component {
	id: string;
	name: string;
	instructionsInside: Instruction[];
	goingTo: Component['id'][];
}

export const IMTComponents = [
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
		goingTo: ['ID']
	},
	{
		name: 'ID', // Instruction Decode
		id: 'ID',
		instructionsInside: [],
		goingTo: ['EX']
	},
	{
		name: 'EX', // Execute
		id: 'EX',
		instructionsInside: [],
		goingTo: ['MEM']
	},
	{
		name: 'MEM', // Memory
		id: 'MEM',
		instructionsInside: [],
		goingTo: ['WB']
	},
	{
		name: 'WB', // Write Back
		id: 'WB',
		instructionsInside: [],
		goingTo: []
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
				components.forEach((component) => {
					if (component.instructionsInside.length > 0) {
						const instruction = component.instructionsInside.shift();
						if (instruction) {
							const nextComponent = components.find((c) => c.id === component.goingTo[0]);
							if (nextComponent) {
								nextComponent.instructionsInside.push(instruction);
							}
						}
					}
				});
				console.log(components)
				return components;
			});
			setTimeout(() => {
				executeCycle();
			}, 2000);
		};
		// executeCycle();
	}
}
