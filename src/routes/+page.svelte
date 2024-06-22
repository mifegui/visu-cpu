<script>
	import { browser } from '$app/environment';
	import Visualizer from '$lib/Visualizer.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
</script>

<div class="h-screen">
	{#if browser}
		<SvelteFlowProvider><Visualizer></Visualizer></SvelteFlowProvider>
	{/if}
</div>
