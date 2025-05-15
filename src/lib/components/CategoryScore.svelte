<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';

	export let category: string;
	export let score: number;

	$: percentage = (score / 100) * 100;
	$: colorClass = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<span class="font-medium">{category}</span>
		<span class="text-sm text-muted-foreground">{score}%</span>
	</div>
	<Progress value={percentage} class={colorClass} />
</div> 