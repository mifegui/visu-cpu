<script lang="ts">
	import { writable, get, type Writable } from 'svelte/store';
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		type Node,
		type Edge,
		useSvelteFlow,
		ConnectionMode,
		Position
	} from '@xyflow/svelte';

	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css';
	import Dagre from 'dagre';
	import { ProcessorManager} from './components';
	import { type Component } from './component';
	import { onMount } from 'svelte';
	import ComponentNode from './ComponentNode.svelte';
	import type { Configuration } from './configuration';

	export let config: Writable<Configuration>;
	// let { dm }: { dm: DataManager } = $props();

	// $: createNodesAndEdges(dm.state.analyizis);
	// onMount(() => {
	// 	createNodesAndEdges(IMTComponents);
	// });
	let pm = new ProcessorManager($config.scalar);
	$: pm.onConfigChange($config.scalar);
	$: pm.run();
	$: comps = pm.components;
	$: createNodesAndEdges($comps);

	const nodes = writable<Node[]>([]);
	const edges = writable<Edge[]>([]);

	const getLayoutedElements = (nodes: Node[], edges: Edge[], options = { direction: 'LR' }) => {
		const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
		const multiplier = 1;
		g.setGraph({
			rankdir: options.direction,
			edgesep: 125 * multiplier,
			nodesep: 50 * multiplier,
			ranksep: 300 * multiplier
		});

		edges.forEach((edge) => g.setEdge(edge.source, edge.target));
		nodes.forEach((node) => g.setNode(node.id, node));

		Dagre.layout(g);

		return {
			nodes: nodes.map((node, i) => {
				const { x, y } = g.node(node.id);

				return { ...node, position: { x: x, y: y } };
			}),
			edges
		};
	};
	let oldSize = 0;
	function createNodesAndEdges(comps: Component[]) {
		const nodeSet = new Set<Node>();
		const edgeMap = new Map<string, Edge>();

		comps.forEach((a, i) => {
			//limit to 20 charcaters
			// let label = a.csvFiles.length;
			const sourceNodeId = a.id;
			nodeSet.add({
				id: sourceNodeId,
				type: 'component',
				sourcePosition: Position.Right,
				targetPosition: Position.Left,
				data: { label: a.name, component: a },
				class: '',
				connectable: false,
				position: { x: 0, y: 0 } // Set initial position
			} as Node);
		});

		comps.forEach((a, i) => {
			a.goingTo.forEach((gt) => {
				const edgeKey = a.id + '-' + gt;
				const label = '';

				if (edgeMap.has(edgeKey)) {
					// Edge already exists, append new label to existing label
					const existingEdge = edgeMap.get(edgeKey) as Edge;
					existingEdge.label += `, ${label}`;
					edgeMap.set(edgeKey, existingEdge);
				} else {
					// Create new edge and add it to the map
					edgeMap.set(edgeKey, {
						id: edgeKey,
						type: 'default',
						source: a.id,
						target: gt,
						markerEnd: 'arrow',
						sourceHandle: 'b',
						targetHandle: 'a',
						selectable: false,
						animated: true,
						label: label
					} as Edge);
				}
			});
		});

		// Convert the edge map to a set
		const edgeSet = new Set<Edge>(edgeMap.values());
		let ns = Array.from(nodeSet);
		let es = Array.from(edgeSet);
		const res = getLayoutedElements(ns, es);
		if (oldSize != res.nodes.length) {
			oldSize = res.nodes.length;
			// useSvelteFlow().fitView();
		}

		nodes.set(res.nodes);
		edges.set(res.edges);
	}

	const snapGrid: [number, number] = [25, 25];
	const nodeTypes = {
		component: ComponentNode
	};
</script>

<!--
👇 By default, the Svelte Flow container has a height of 100%.
This means that the parent container needs a height to render the flow.
-->
<!-- on:nodeclick={(event) => console.log('on node click', event.detail.node)} -->
<div class="h-full">
	<!-- {#key $comps} -->
	 {#key $config}
	<SvelteFlow {nodeTypes} {nodes} {edges} {snapGrid} fitView proOptions={{ hideAttribution: true }}>
		<Controls />
		<Background variant={BackgroundVariant.Dots} />
		<!-- <MiniMap /> -->
	</SvelteFlow>
	{/key}
	<!-- {/key} -->
</div>

<!--  -->
<style lang="postcss">
	:global(.svelte-flow__node.red) {
		background-color: theme('colors.red.100');
	}
	:global(.svelte-flow__node.blue) {
		background-color: theme('colors.green.100');
	}
</style>
