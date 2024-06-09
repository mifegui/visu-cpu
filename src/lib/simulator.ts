import { produce } from 'immer';

export enum SimulatorInstructionType {
	R_TYPE,
	I_TYPE,
	S_TYPE,
	B_TYPE,
	U_TYPE,
	J_TYPE
}

export enum InstructionType {
	R_TYPE,
	I_TYPE,
	S_TYPE,
	B_TYPE,
	U_TYPE,
	J_TYPE
}

export class Instruction {
	constructor(
		public type: InstructionType,
		public opcode: number,
		public func3?: number,
		public func7?: number,
		public rd?: number,
		public rs1?: number,
		public rs2?: number,
		public imm?: number
	) {}
}

class ScalarArchitecture {
	private registers: number[] = new Array(32).fill(0);
	private pc: number = 0;
	private cycleCount: number = 0;
	private bubbleCycles: number = 0;
	private lastExecution: { [key: number]: number } = {};

	constructor(public cycleTimeMs: number) {}

	execute(instruction: Instruction): void {
		if (this.detectDependency(instruction)) {
			this.bubbleCycles++;
			this.cycleCount++;
			return;
		}

		// Simulate execution of an instruction by waiting for the cycle time
		const start = Date.now();
		while (Date.now() - start < this.cycleTimeMs) {}

		this.updateLastExecution(instruction);
		this.cycleCount++;
	}

	private detectDependency(instruction: Instruction): boolean {
		// Detect data dependencies
		if (instruction.rs1 && this.lastExecution[instruction.rs1] >= this.cycleCount) return true;
		if (instruction.rs2 && this.lastExecution[instruction.rs2] >= this.cycleCount) return true;
		return false;
	}

	private updateLastExecution(instruction: Instruction): void {
		if (instruction.rd !== undefined) {
			this.lastExecution[instruction.rd] = this.cycleCount + 1;
		}
	}

	getMetrics() {
		return {
			cycles: this.cycleCount,
			bubbleCycles: this.bubbleCycles
		};
	}
}

class SuperscalarArchitecture extends ScalarArchitecture {
	private pipelines: any[] = [];

	execute(instruction: Instruction) {
		// Implement execution logic for superscalar architecture if necessary
		super.execute(instruction);
	}
}

class SMT extends SuperscalarArchitecture {
	// Implement Simultaneous Multithreading
}

class IMT extends ScalarArchitecture {
	// Implement Interleaved Multithreading
}

class BMT extends ScalarArchitecture {
	// Implement Blocked Multithreading
}

const initialState = {
	cycle: 0,
	decode: [] as Instruction[],
	window: [] as Instruction[],
	execute: [] as Instruction[],
	writeBack: [] as Instruction[]
};

const updateState = (state: any, instruction: Instruction, stage: string) => {
	return produce(state, (draft: any) => {
		draft.cycle += 1;

		// Remove instruction from previous stages
		if (stage === 'execute') {
			draft.decode = draft.decode.filter((instr: Instruction) => instr !== instruction);
		} else if (stage === 'writeBack') {
			draft.execute = draft.execute.filter((instr: Instruction) => instr !== instruction);
		}

		// Add instruction to the current stage
		draft[stage].push(instruction);
	}) as any;
};

class Simulator {
	private architecture: ScalarArchitecture | SuperscalarArchitecture;
	private instructions: Instruction[] = [];
	private state = initialState;
	private history: any[] = [];
	private cycleCallback: (state: any) => void;

	constructor(
		architecture: ScalarArchitecture | SuperscalarArchitecture,
		cycleCallback: (state: any) => void
	) {
		this.architecture = architecture;
		this.cycleCallback = cycleCallback;
	}

	loadProgram(program: Instruction[]) {
		this.instructions = program;
	}

	run() {
		const executeCycle = () => {
			if (this.instructions.length > 0) {
				const instruction = this.instructions.shift();
				if (instruction) {
					this.state = updateState(this.state, instruction, 'decode');
					this.history.push(this.state);
					this.cycleCallback(this.history); // Print the state after decode
					setTimeout(() => {
						this.architecture.execute(instruction);
						this.state = updateState(this.state, instruction, 'execute');
						this.history.push(this.state);
						this.cycleCallback(this.history); // Print the state after execute
						setTimeout(() => {
							this.state = updateState(this.state, instruction, 'writeBack');
							this.history.push(this.state);
							this.cycleCallback(this.history); // Print the state after writeBack
							executeCycle();
						}, this.architecture.cycleTimeMs);
					}, this.architecture.cycleTimeMs);
				}
			} else {
				console.log('Final State:', this.state);
				console.log('Performance Metrics:', this.getPerformanceMetrics());
			}
		};

		executeCycle();
	}

	getPerformanceMetrics() {
		return this.architecture.getMetrics();
	}

	getState() {
		return this.state;
	}
}

export async function run(callback: (state: any) => void) {
	const program: Instruction[] = [
		new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x0, 1, 2, 3), // add x1, x2, x3
		new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x1, 4, 1, 2), // sll x4, x1, x2 (shift left logical)
		new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x2, 5, 4, 1), // slt x5, x4, x1 (set less than)
		new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x3, 6, 5, 4), // xor x6, x5, x4 (exclusive or)
		new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x4, 7, 6, 5), // srl x7, x6, x5 (shift right logical)
		new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x5, 8, 7, 6), // or x8, x7, x6 (logical OR)
		new Instruction(InstructionType.R_TYPE, 0x33, 0x0, 0x6, 9, 8, 7) // and x9, x8, x7 (logical AND)
	];

	const scalarSim = new Simulator(new ScalarArchitecture(1000), callback);
	scalarSim.loadProgram(program);
	scalarSim.run();

	// Uncomment these lines if you want to run simulations for other architectures
	// const superscalarSim = new Simulator(new SuperscalarArchitecture(1000), callback);
	// superscalarSim.loadProgram(program);
	// superscalarSim.run();

	// const smtSim = new Simulator(new SMT(1000), callback);
	// smtSim.loadProgram(program);
	// smtSim.run();

	// Similar implementations for IMT and BMT
}
