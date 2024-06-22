<script lang="ts">
	import { browser } from '$app/environment';
	import Visualizer from '$lib/Visualizer.svelte';
	import type { Configuration } from '$lib/configuration';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import { writable } from 'svelte/store';

	// Create a writable store for the configuration
	let config = writable<Configuration>({
		multithreading: 'no',
		scalar: 'super-scalar',
		pipelines: 2,
		pause: false
	});

	// Functions to update the configuration
	function setMultithreading(value: any) {
		config.update((c) => ({ ...c, multithreading: value }));
	}

	function setScalar(value: any) {
		config.update((c) => ({ ...c, scalar: value }));
	}

	function togglePause() {
		config.update((c) => ({ ...c, pause: !c.pause }));
	}

</script>

<div class="h-screen">
	<div class="flex flex-col space-y-4 mt-2 ml-2">
		<div class="flex items-center space-x-2">
			<button
				class="btn btn-primary"
				class:selected={$config.multithreading === 'no'}
				on:click={() => setMultithreading('no')}>No Multithreading</button
			>
			<button
				class="btn btn-primary"
				class:selected={$config.multithreading === 'imt'}
				on:click={() => setMultithreading('imt')}>IMT</button
			>
			<button
				class="btn btn-primary"
				class:selected={$config.multithreading === 'bmt'}
				on:click={() => setMultithreading('bmt')}>BMT</button
			>
			<button
				class="btn btn-primary"
				class:selected={$config.multithreading === 'smt'}
				on:click={() => setMultithreading('smt')}>SMT</button
			>
			<div class="ml-40"></div>
			<button
				class="btn btn-primary"
				class:selected={$config.scalar === 'scalar'}
				on:click={() => setScalar('scalar')}>Scalar</button
			>
			<button
				class="btn btn-primary"
				class:selected={$config.scalar === 'super-scalar'}
				on:click={() => setScalar('super-scalar')}>Super-Scalar</button
			>
			<div class="ml-40"></div>
			<button class="btn btn-primary" class:paused={$config.pause} on:click={togglePause}
				>{$config.pause ? 'Resume' : 'Pause'}</button
			>
		</div>
	</div>
	<div class="h-full">
		{#if browser}
			<SvelteFlowProvider>
				<Visualizer {config}></Visualizer>
			</SvelteFlowProvider>
		{/if}
	</div>
</div>

<style>
	.btn {
		@apply bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700;
	}

	.btn-primary {
		@apply bg-blue-500 text-white;
	}

	.selected {
		@apply bg-blue-700;
	}

	.paused {
		@apply bg-red-500;
	}
</style>
