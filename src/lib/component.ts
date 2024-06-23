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

function defaultInstructions() {
	return [
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0x0, 1, 2, 3), // add x1, x2, x3
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0x1, 4, 1, 2), // sll x4, x1, x2 (shift left logical)
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0x2, 5, 4, 1), // slt x5, x4, x1 (set less than)
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0x3, 6, 5, 4), // xor x6, x5, x4 (exclusive or)
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0x4, 7, 6, 5), // srl x7, x6, x5 (shift right logical)
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0x5, 8, 7, 6), // or x8, x7, x6 (logical OR)
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0x6, 9, 8, 7), // and x9, x8, x7 (logical AND)
		// make conflicts so we can test bubbles
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0x7, 10, 9, 8), // add x10, x9, x8
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0x8, 11, 10, 9), // add x11, x10, x9
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0x9, 12, 11, 10), // add x12, x11, x10
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0xa, 13, 12, 11), // add x13, x12, x11
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0xb, 14, 13, 12), // add x14, x13, x12
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0xc, 15, 14, 13), // add x15, x14, x13
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0xd, 16, 15, 14), // add x16, x15, x14
		new Instruction(0, InstructionType.R_TYPE, 0x33, 0x0, 0xe, 17, 16, 15) // add x17, x16, x15
	];
}
export const Pentium1Simulator: Component[] = [
	{
		name: 'Memória de Instruções',
		id: 'IM',
		instructionsInside: defaultInstructions(),
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

// No Multihread Superescalar
export const EscalarSimulator: Component[] = [
	{
		name: 'Memória de Instruções',
		id: 'IM',
		instructionsInside: defaultInstructions(),
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
		goingTo: ['OF'],
		instructionsPerCycle: 2,
		decideToGoWhere: genericGoToMoreCapacity
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
		id: 'EX',
		instructionsInside: [],
		goingTo: ['MEM'],
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

// IMT superescalar
export const IMTSuperScalar = copyArchitecture(Pentium1Simulator);

// same as Pentium1Simulator but different threads
IMTSuperScalar[0].instructionsInside = defaultInstructions();
IMTSuperScalar[0].instructionsInside.forEach((ins, i) => {
	if (i % 2 == 0) {
		ins.thread = 1;
	}
	if (i % 3 == 0) {
		ins.thread = 2;
	}
	if (i % 5 == 0) {
		ins.thread = 3;
	}
});

export const IMTScalar = copyArchitecture(EscalarSimulator);
IMTScalar[0].instructionsInside = defaultInstructions();
IMTScalar[0].instructionsInside.forEach((ins, i) => {
	if (i % 2 == 0) {
		ins.thread = 1;
	}
});

export const BMTScalar = copyArchitecture(EscalarSimulator);
BMTScalar[0].instructionsInside = defaultInstructions();
// 4 instructions of one thread then 4 instructions of another thread...
// 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0,0 ...
BMTScalar[0].instructionsInside.forEach((ins, i) => {
	if (i % 8 < 4) {
		ins.thread = 1;
	}
});

export const BMTSuperscalar = copyArchitecture(Pentium1Simulator);
BMTSuperscalar[0].instructionsInside = defaultInstructions();
// 4 instructions of one thread then 4 instructions of another thread...
// 0, 0, 0, 0, 1, 1, 1, 1, 2 2 2 2 3 3 3 3 0 0 0 0 ...
BMTSuperscalar[0].instructionsInside.forEach((ins, i) => {
	if (i % 16 < 4) {
		ins.thread = 1;
	}
	if (i % 16 >= 4 && i % 16 < 8) {
		ins.thread = 2;
	}
	if (i % 16 >= 8 && i % 16 < 12) {
		ins.thread = 3;
	}
});

export const SMTSuperscalar = copyArchitecture(Pentium1Simulator);
SMTSuperscalar[0].instructionsInside = defaultInstructions();
// Random between 1, 2, 3, 4
SMTSuperscalar[0].instructionsInside.forEach((ins, i) => {
	ins.thread = Math.floor(Math.random() * 4) + 1;
});

export const SMTScalar = copyArchitecture(EscalarSimulator);
SMTScalar[0].instructionsInside = defaultInstructions();
// 1, 2, 3, 4, 1, 2, 3, 4....
SMTScalar[0].instructionsInside.forEach((ins, i) => {
	ins.thread = (i % 4) + 1;
});

export function copyArchitecture(arch: Component[]) {
	return arch.map((component) => {
		return {
			...component,
			instructionsInside: [...component.instructionsInside],
			goingTo: [...component.goingTo]
		};
	});
}
