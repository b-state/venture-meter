<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { saveProgress } from '$lib/utils/questionnaire';
	import { HelpCircle, Loader2, Sparkles } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let { question, options, questionId, selectedScore, onAnswer } = $props<{
		question: string;
		options: string[];
		questionId: number;
		selectedScore: number | null;
		onAnswer: () => void;
	}>();

	// Ensure we always use the prop value, not local state
	let currentSelectedScore = $derived(selectedScore);
	let showHelp = $state(false);
	let helpText = $state<string | null>(null);
	let isLoadingHelp = $state(false);

	async function handleAnswer(optionIndex: number) {
		// optionIndex is 0-based, but score is 1-based
		const score = optionIndex + 1;
		await saveProgress(questionId, score);
		onAnswer();
		goto(`/questionnaire/question/${questionId + 1}`);
	}

	async function toggleHelp() {
		if (showHelp) {
			showHelp = false;
			return;
		}

		showHelp = true;

		// Only fetch help text if we haven't already
		if (helpText === null && !isLoadingHelp) {
			await fetchHelpText();
		}
	}

	async function fetchHelpText() {
		isLoadingHelp = true;
		try {
			const response = await fetch(`/api/help-text/${questionId}`);
			if (response.ok) {
				const data = await response.json();
				helpText = data.helpText;
			} else {
				console.error('Failed to fetch help text');
				helpText = null;
			}
		} catch (error) {
			console.error('Error fetching help text:', error);
			helpText = null;
		} finally {
			isLoadingHelp = false;
		}
	}
</script>

<div class="flex w-full flex-col gap-2">
	<div
		class="mb-4 flex items-start justify-between gap-4 rounded bg-muted px-4 py-4 ring-1 ring-muted"
	>
		<h2 class="text-wrap text-2xl font-bold">{question}</h2>
	</div>

	{#each options as option, index}
		<Button
			variant={selectedScore === index + 1 ? 'default' : 'outline'}
			class="h-fit justify-start text-wrap px-10 text-left text-lg {selectedScore !== index + 1
				? 'hover:bg-muted'
				: ''}"
			onclick={() => handleAnswer(index)}
		>
			{option}
		</Button>
	{/each}
	
	<Button
		variant="ghost"
		size="sm"
		class="flex w-fit gap-2 text-muted-foreground self-end"
		onclick={toggleHelp}
	>
		<HelpCircle size="20" /> Spickzettel anzeigen
	</Button>

	{#if showHelp}
		<Card class="mt-10 bg-background text-foreground">
			<CardContent class="p-4">
				<div class="flex items-start gap-2">
					<Sparkles size="16" class="mt-0.5" />
					{#if isLoadingHelp}
						<div class="flex items-center gap-2">
							<Loader2 size="16" class="animate-spin" />
							<p class=" ">Lade Hilfestellung...</p>
						</div>
					{:else if helpText}
						<p class=" ">{helpText}</p>
					{:else}
						<p class=" ">Keine Hilfestellung verfügbar.</p>
					{/if}
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
