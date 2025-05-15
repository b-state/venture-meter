<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { saveProgress } from '$lib/utils/questionnaire';

	let { question, options, questionId, selectedScore } = $props<{
		question: string;
		options: string[];
		questionId: number;
		selectedScore: number | null;
	}>();

	async function handleAnswer(optionIndex: number) {
		// optionIndex is 0-based, but score is 1-based
		const score = optionIndex + 1;
		await saveProgress(questionId, score);
		selectedScore = score;
		goto(`/questionnaire/question/${questionId + 1}`);
	}
</script>

<div class="flex w-full flex-col gap-2">
	<h2 class="mb-4 text-wrap rounded bg-muted px-4 py-4 text-2xl font-bold ring-1 ring-muted">
		{question}
	</h2>
	{#each options as option, index}
		<Button
			variant={selectedScore === index + 1 ? 'default' : 'outline'}
			class="h-fit justify-start text-wrap px-10 text-left text-lg hover:bg-muted"
			onclick={() => handleAnswer(index)}
		>
			{option}
		</Button>
	{/each}
</div>
