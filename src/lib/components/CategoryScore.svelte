<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';

	export let category: string;
	export let score: number;

	$: percentage = (score / 4) * 100;
	$: colorClass = score >= 3 ? 'bg-green-500' : score >= 2 ? 'bg-yellow-500' : 'bg-red-500';
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<span class="font-medium">{category}</span>
		<span class="text-sm text-muted-foreground">{score.toFixed(1)}/4</span>
	</div>
	<Progress value={percentage} class={colorClass} />
</div>
