import { nanoid } from 'nanoid';

export class Instruction {
	public id: string = nanoid(7);
	constructor(
		public thread: number,
		public string: string
	) {}

	toString() {
		// should return something like add R1, R2, R3
		return this.string;
	}
}
