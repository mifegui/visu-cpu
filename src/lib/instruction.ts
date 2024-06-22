import { produce } from 'immer';
import { nanoid } from 'nanoid';

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
	public id: string = nanoid(7);
	constructor(
		public thread: number,
		public type: InstructionType,
		public opcode: number,
		public func3?: number,
		public func7?: number,
		public rd?: number,
		public rs1?: number,
		public rs2?: number,
		public imm?: number
	) {}

	toString() {
		// should return something like add R1, R2, R3
		return this.instructionToString(this);
	}
	private instructionToString(instruction: Instruction) {
		if (!instruction) return '';
		const opcodes: { [key: number]: string } = {
			0x33: 'add',
			0x3b: 'mul'
			// Adicione mais mapeamentos conforme necessário
		};

		const func3: { [key: number]: { [key: number]: string } } = {
			0x0: {
				0x0: 'add',
				0x1: 'sll',
				0x2: 'slt',
				0x3: 'xor',
				0x4: 'srl',
				0x6: 'or',
				0x7: 'and'
			}
			// Adicione mais mapeamentos conforme necessário
		};

		let instrName = opcodes[instruction.opcode] || 'unknown';
		if (
			instruction.type === InstructionType.R_TYPE &&
			instruction.func3 !== undefined &&
			instruction.func7 !== undefined
		) {
			instrName = func3[instruction.func3][instruction.func7] || instrName;
		}

		switch (instruction.type) {
			case InstructionType.R_TYPE:
				return `${instrName} x${instruction.rd}, x${instruction.rs1}, x${instruction.rs2}`;
			case InstructionType.I_TYPE:
				return `I-Type: opcode=${instruction.opcode}, func3=${instruction.func3}, rd=${instruction.rd}, rs1=${instruction.rs1}, imm=${instruction.imm}`;
			case InstructionType.S_TYPE:
				return `S-Type: opcode=${instruction.opcode}, func3=${instruction.func3}, rs1=${instruction.rs1}, rs2=${instruction.rs2}, imm=${instruction.imm}`;
			case InstructionType.B_TYPE:
				return `B-Type: opcode=${instruction.opcode}, func3=${instruction.func3}, rs1=${instruction.rs1}, rs2=${instruction.rs2}, imm=${instruction.imm}`;
			case InstructionType.U_TYPE:
				return `U-Type: opcode=${instruction.opcode}, rd=${instruction.rd}, imm=${instruction.imm}`;
			case InstructionType.J_TYPE:
				return `J-Type: opcode=${instruction.opcode}, rd=${instruction.rd}, imm=${instruction.imm}`;
		}
		return '';
	}
}
