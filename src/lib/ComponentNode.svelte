<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { Writable } from 'svelte/store';
	import type { Component } from './process';
	import { Instruction } from './instruction';

	type $$Props = NodeProps;

	export let data: { component: Component };

	let oldComponent: Component = { ...data.component, instructionsInside: [] };

	$: component = data.component;

	$: instructionsPerCycle = component.instructionsPerCycle;

	const threadNumberPerColor: { number: number; className: string }[] = [
		{ number: 0, className: '!bg-lime-100' },
		{ number: 1, className: '!bg-red-100' },
		{ number: 2, className: '!bg-blue-100' },
		{ number: 3, className: '!bg-yellow-100' },
		{ number: 4, className: '!bg-green-100' },
		{ number: 5, className: '!bg-purple-100' },
		{ number: 6, className: '!bg-orange-100' },
		{ number: 7, className: '!bg-gray-100' },
		{ number: 8, className: '!bg-indigo-100' },
		{ number: 9, className: '!bg-pink-100' },
		{ number: 10, className: '!bg-teal-100' },
		{ number: 11, className: '!bg-cyan-100' },
		{ number: 12, className: '!bg-amber-100' }
	];

	function getTailwindClassNameForColor(i: Instruction) {
		const threadNumber = i.thread;
		const color = threadNumberPerColor.find((t) => t.number === threadNumber);
		return color ? color.className : 'gray';
	}
</script>

<div class="component">
	<Handle type="target" id="a" position={Position.Left} />
	<div class="component-header">
		<strong>{component.name}</strong>
	</div>

	<div class="instructions">
		{#each component.instructionsInside as is}
			<div class={'instruction ' + getTailwindClassNameForColor(is)}>
				{is.toString()}
			</div>
		{/each}
	</div>
	<Handle type="source" id="b" position={Position.Right} />

	<div class="footer">
		<!-- <p>Adicionadas: {instructionsAdded}</p>
		<p>Removidas: {instructionsRemoved}</p> -->
		<p>Por ciclo: {instructionsPerCycle}</p>
		{#if component.maxInside}
			<p>Capacidade: {component.maxInside}</p>
		{/if}
	</div>
</div>

<style>
	.component {
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 0.375rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		font-size: 0.8rem;
		width: 200px;
		margin: 0.5rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.component-header {
		font-size: 1rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.instructions {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex-grow: 1;
	}

	.instruction {
		background: #fff;
		padding: 0.5rem;
		border-radius: 0.25rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.footer {
		font-size: 0.7rem;
		color: #666;
		border-top: 1px solid #ddd;
		padding-top: 0.5rem;
		margin-top: 0.5rem;
	}
</style>
