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
			type: 'radar',
			data: {
				labels: categories,
				datasets: [
					{
						label: 'Bewertung',
						data: scores,
						backgroundColor: 'rgba(99, 102, 241, 0.2)',
						borderColor: 'rgb(99, 102, 241)',
						borderWidth: 2,
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
						max: 100,
						ticks: {
							stepSize: 20
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
			chart.destroy();
		};
	});
</script>

<canvas bind:this={canvas}></canvas> 