<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	export let data: Record<string, number>;

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const categories = Object.keys(data);
		const scores = Object.values(data);

		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: categories,
				datasets: [
					{
						label: 'Bewertung',
						data: scores,
						backgroundColor: 'rgba(99, 102, 241, 0.8)',
						borderColor: 'rgb(99, 102, 241)',
						borderWidth: 1
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					y: {
						beginAtZero: true,
						max: 5,
						ticks: {
							stepSize: 1
						}
					}
				},
				plugins: {
					legend: {
						display: false
					}
				}
			}
		});

		return () => {
			chart.destroy();
		};
	});
</script>

<canvas bind:this={canvas}></canvas> 