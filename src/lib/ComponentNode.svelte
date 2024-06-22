<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { Writable } from 'svelte/store';
	import type { Component } from './components';

	type $$Props = NodeProps;

	export let data: { component: Component };

	const { component } = data;
</script>

<div class="component">
	<Handle type="target" id="a" position={Position.Left} />
	<div>
		<strong>{component.name}</strong>
	</div>

	{#each component.instructionsInside as is}
		<div>
			{is.toString()}
		</div>
	{/each}
	<Handle type="source" id="b" position={Position.Right} />
</div>

<style>
	.component {
		padding: 1rem;
		background: #eee;
		border-radius: 0.125rem;
		font-size: 0.7rem;
	}
</style>
