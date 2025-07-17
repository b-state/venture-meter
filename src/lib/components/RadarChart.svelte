<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { mode } from 'mode-watcher';

	let { data }: { data: Record<string, number> } = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = $state(null);

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const categories = Object.keys(data);
		const scores = Object.values(data);

		chart = new Chart(ctx, {
			type: 'radar',
			data: {
				labels: categories,
				datasets: [
					{
						label: 'Bewertung',
						data: scores,
						backgroundColor: 'rgba(99, 102, 241, 0.2)',
						borderColor: 'rgb(99, 102, 241)',
						borderWidth: 1,
						pointBackgroundColor: 'rgb(99, 102, 241)',
						pointBorderColor: '#fff',
						pointHoverBackgroundColor: '#fff',
						pointHoverBorderColor: 'rgb(99, 102, 241)'
					}
				]
			},
			options: {
				scales: {
					r: {
						beginAtZero: true,
						max: 4,
						ticks: {
							stepSize: 1,
							font: {
								size: 14
							}
						},
						pointLabels: {
							font: {
								size: 14
							}
						},
						grid: {
							display: true,
							circular: true,
							color: '#45556C'
						}
					}
				},
				plugins: {
					legend: {
						display: false
					}
				},
				maintainAspectRatio: false
			}
		});

		return () => {
			chart?.destroy();
		};
	});
</script>

<canvas bind:this={canvas} class="max-w-3xl"></canvas>
