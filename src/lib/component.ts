import { Instruction } from './instruction';

export interface Component {
	id: string;
	name: string;
	instructionsInside: Instruction[];
	goingTo: Component['id'][];
	instructionsPerCycle: number;
	maxInside?: number;
	decideToGoWhere?: (instruction: Instruction, possiblenNexts: Component[]) => Component['id'];
}

function genericGoToMoreCapacity(i: Instruction, possiblenNexts: Component[]) {
	return possiblenNexts.sort((a, b) => a.instructionsInside.length - b.instructionsInside.length)[0]
		.id;
}

function randomInstructions(): Instruction {
	const op = ['add', 'sub', 'lw', 'sw', 'slt', 'xor', 'or'];
	const registers = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9'];
	const randomOp = op[Math.floor(Math.random() * op.length)];
	const randomRegisters = registers[Math.floor(Math.random() * registers.length)];
	const randomRegisters2 = registers[Math.floor(Math.random() * registers.length)];
	const randomRegisters3 = registers[Math.floor(Math.random() * registers.length)];
	// take in mind that syntax of lw and sw is different
	if (randomOp === 'lw' || randomOp === 'sw') {
		return new Instruction(0, `${randomOp} ${randomRegisters}, 0(${randomRegisters2})`);
	}
	return new Instruction(
		0,
		`${randomOp} ${randomRegisters}, ${randomRegisters2}, ${randomRegisters3}`
	);
}

function defaultInstructions() {
	return [
		new Instruction(0, 'add x1, x2, x3'),
		new Instruction(0, 'lw x2, 0(x1)'),
		new Instruction(0, 'slt x5, x4, x1'),
		new Instruction(0, 'xor x6, x5, x4'),
		new Instruction(0, 'sw x3, 0(x2)'),
		new Instruction(0, 'or x8, x7, x6'),
		new Instruction(0, 'sw x9, 0(x8)'),
		new Instruction(0, 'add x10, x9, x8'),
		new Instruction(0, 'add x11, x10, x9'),
		new Instruction(0, 'lw x1, 0(x2)'),
		new Instruction(0, 'add x13, x12, x11'),
		new Instruction(0, 'lw x14, 0(x13)'),
		new Instruction(0, 'lw x15, 0(x14)'),
		new Instruction(0, 'add x16, x15, x14'),
		new Instruction(0, 'sub x1, x2, x3')
	];
}
function createPentium1Simulator(numPipelines: number): Component[] {
	const components: Component[] = [
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
			goingTo: Array.from({ length: numPipelines }, (_, i) => `OF${i + 1}`),
			instructionsPerCycle: 2,
			decideToGoWhere: (ins, possiblenNexts) => possiblenNexts[Math.floor(Math.random() * possiblenNexts.length)].id
		}
	];

	for (let i = 1; i <= numPipelines; i++) {
		components.push(
			{
				name: 'OF',
				id: `OF${i}`,
				instructionsInside: [],
				goingTo: [`JI${i}`],
				instructionsPerCycle: 2
			},
			{
				name: 'Janela de instruções',
				id: `JI${i}`,
				instructionsInside: [],
				goingTo: [`ULA${i}`, `LU${i}`, `SU${i}`],
				decideToGoWhere: (ins: Instruction, _) => {
					if (ins.toString().includes('lw')) return `LU${i}`;
					if (ins.toString().includes('sw')) return `SU${i}`;
					return `ULA${i}`;
				},
				instructionsPerCycle: 2
			},
			{
				name: 'ULA',
				id: `ULA${i}`,
				instructionsInside: [],
				goingTo: [`MEM${i}`],
				instructionsPerCycle: 1,
				maxInside: 1
			},
			{
				name: 'Load Unit',
				id: `LU${i}`,
				instructionsInside: [],
				goingTo: [`MEM${i}`],
				instructionsPerCycle: 1,
				maxInside: 1
			},
			{
				name: 'Store Unit',
				id: `SU${i}`,
				instructionsInside: [],
				goingTo: [`MEM${i}`],
				instructionsPerCycle: 1,
				maxInside: 1
			},
			{
				name: 'MEM', // Memory
				id: `MEM${i}`,
				instructionsInside: [],
				goingTo: [`OS${i}`, 'MD'],
				instructionsPerCycle: 1
			},
			{
				name: 'OS',
				id: `OS${i}`,
				instructionsInside: [],
				goingTo: ['BR'],
				instructionsPerCycle: 1
			}
		);
	}

	components.push({
		name: 'Memória de dados',
		id: 'MD',
		goingTo: [],
		instructionsInside: [],
		instructionsPerCycle: 1
	});

	return components;
}

export const Pentium1Simulator = createPentium1Simulator(2); // Aqui você pode definir o número de pipelines desejado

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
		instructionsPerCycle: 2
	},
	{
		name: 'OF',
		id: 'OF',
		instructionsInside: [],
		goingTo: ['ULA', 'LU', 'SU'],
		decideToGoWhere: (ins: Instruction, _) => {
			if (ins.toString().includes('lw')) return 'LU';
			if (ins.toString().includes('sw')) return 'SU';
			return 'ULA';
		},
		instructionsPerCycle: 2
	},
	{
		name: 'ULA',
		id: 'ULA',
		instructionsInside: [],
		goingTo: ['MEM'],
		instructionsPerCycle: 1,
		maxInside: 1
	},
	{
		name: 'Load Unit',
		id: 'LU',
		instructionsInside: [],
		goingTo: ['MEM'],
		instructionsPerCycle: 1,
		maxInside: 1
	},
	{
		name: 'Store Unit',
		id: 'SU',
		instructionsInside: [],
		goingTo: ['MEM'],
		instructionsPerCycle: 1,
		maxInside: 1
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
