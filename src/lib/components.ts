import { read } from '$app/server';
import { readable, writable, type Writable } from 'svelte/store';
import { Instruction, InstructionType } from './instruction';

export interface Component {
	id: string;
	name: string;
	instructionsInside: Instruction[];
	goingTo: Component['id'][];
	instructionsPerCycle: number;
	decideToGoWhere?: (instruction: Instruction, possiblenNexts: Component[]) => Component['id'];
}

function genericGoToMoreCapacity(i: Instruction, possiblenNexts: Component[]) {
	return possiblenNexts.sort((a, b) => a.instructionsInside.length - b.instructionsInside.length)[0]
		.id;
}

export const IMTComponents: Component[] = [
	{
		name: 'Memória de Instruções',
		id: 'IM',
		instructionsInside: [
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x0, 1, 2, 3), // add x1, x2, x3
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x1, 4, 1, 2), // sll x4, x1, x2 (shift left logical)
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x2, 5, 4, 1), // slt x5, x4, x1 (set less than)
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x3, 6, 5, 4), // xor x6, x5, x4 (exclusive or)
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x4, 7, 6, 5), // srl x7, x6, x5 (shift right logical)
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x5, 8, 7, 6), // or x8, x7, x6 (logical OR)
			new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x6, 9, 8, 7) // and x9, x8, x7 (logical AND)
		],
		goingTo: ['IF'],
		instructionsPerCycle: 2
	},
	{
		name: 'Banco de registradores',
		id: 'BR',
		instructionsInside: [],
		goingTo: [],
		instructionsPerCycle: 1
	},
	{
		name: 'IF', // Instruction Fetch
		id: 'IF',
		instructionsInside: [],
		goingTo: ['OF', 'OF2'],
		instructionsPerCycle: 2,
		decideToGoWhere: genericGoToMoreCapacity
	},
	{
		name: 'OF',
		id: 'OF2',
		instructionsInside: [],
		goingTo: ['EX2'],
		instructionsPerCycle: 1
	},
	{
		name: 'OF',
		id: 'OF',
		instructionsInside: [],
		goingTo: ['EX'],
		instructionsPerCycle: 1
	},
	{
		name: 'EX', // Execute
		id: 'EX2',
		instructionsInside: [],
		goingTo: ['MEM2'],
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
		id: 'MEM2',
		instructionsInside: [],
		goingTo: ['OS2', 'MD'],
		instructionsPerCycle: 1
	},
	{
		name: 'MEM', // Memory
		id: 'MEM',
		instructionsInside: [],
		goingTo: ['OS', 'MD'],
		instructionsPerCycle: 1
	},
	{
		name: 'OS',
		id: 'OS2',
		instructionsInside: [],
		goingTo: ['BR'],
		instructionsPerCycle: 1
	},
	{
		name: 'OS',
		id: 'OS',
		instructionsInside: [],
		goingTo: ['BR'],
		instructionsPerCycle: 1
	},
	{
		name: 'Memória de dados',
		id: 'MD',
		goingTo: [],
		instructionsInside: [],
		instructionsPerCycle: 1
	}
];

export class ProcessorManager {
	private clock = 0;
	public components: Writable<Component[]> = writable(IMTComponents);
	constructor() {}
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
