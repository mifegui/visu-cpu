<script lang="ts">
	import { onMount } from 'svelte';
	import { Instruction, InstructionType, run } from '$lib/simulator';

	let stateHistory: any[] = [];
	let addNewLinesToTop = true; // Variável para controlar a ordem das linhas

	function updateStateOnScreen(newState: any) {
		if (addNewLinesToTop) {
			stateHistory = [newState, ...stateHistory];
		} else {
			stateHistory = [...stateHistory, newState];
		}
	}

	onMount(() => {
		run((newStateHistory: any) => {
			newStateHistory.forEach((newState: any) => updateStateOnScreen(newState));
		});
	});

	function instructionToString(instruction: Instruction) {
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
</script>

<h1>Simulador de Arquitetura de CPU</h1>
<p>Estado da CPU em tempo real:</p>

<label>
	<input type="checkbox" bind:checked={addNewLinesToTop} />
	Adicionar novas linhas no topo
</label>

<table>
	<thead>
		<tr>
			<th>Ciclo</th>
			<th>Decodificação</th>
			<!-- <th>Janela</th> -->
			<th>Execução</th>
			<th>Write-Back</th>
		</tr>
	</thead>
	<tbody>
		{#each stateHistory as state}
			<tr>
				<td>{state.cycle}</td>
				<td>
					{#each state.decode as instruction}
						<p>{instructionToString(instruction)}</p>
					{/each}
				</td>
				<!-- <td>
					{#each state.window as instruction}
						<p>{instructionToString(instruction)}</p>
					{/each}
				</td> -->
				<td>
					{#each state.execute as instruction}
						<p>{instructionToString(instruction)}</p>
					{/each}
				</td>
				<td>
					{#each state.writeBack as instruction}
						<p>{instructionToString(instruction)}</p>
					{/each}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: center;
	}
	th {
		background-color: #f2f2f2;
	}
</style>
