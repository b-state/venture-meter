<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { saveProgress, getStartupInfo } from '$lib/utils/questionnaire';
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
			// Get startup info from localStorage
			const startupInfo = getStartupInfo();

			// Build query parameters
			const params = new URLSearchParams();
			if (startupInfo) {
				params.append('industry', startupInfo.industry);
				params.append('productCategory', startupInfo.productCategory);
				params.append('targetCustomers', startupInfo.targetCustomers);
			}

			const response = await fetch(`/api/help-text/${questionId}?${params.toString()}`);

			if (response.ok) {
				isLoadingHelp = false;
				const reader = response.body!.getReader();
				helpText = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					const chunk = new TextDecoder().decode(value);
					helpText += chunk;
					console.log(chunk);
				}

			} else {
				isLoadingHelp = false;
				console.error('Failed to fetch help text');
				helpText = null;
			}
		} catch (error) {
			console.error('Error fetching help text:', error);
			helpText = null;
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
		class="flex w-fit gap-2 self-end text-muted-foreground"
		onclick={toggleHelp}
	>
		<HelpCircle size="20" /> Spickzettel {showHelp ? 'ausblenden' : 'anzeigen'}
	</Button>

	{#if showHelp}
		<Card class="relative mt-10 bg-background text-foreground">
			<div
				class="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-400/60 via-violet-400/60 to-pink-400/60 p-[1px]"
			>
				<div class="h-full w-full rounded-lg bg-background"></div>
			</div>
			<CardContent class="relative z-10 p-4 ">
				<div class="flex items-start gap-2">
					{#if isLoadingHelp}
						<div class="flex items-center gap-2">
							<Loader2 size="16" class="animate-spin" />
							<p class=" ">Lade Hilfestellung...</p>
						</div>
					{:else if helpText}
						<Sparkles size="16" class="mt-0.5 min-w-4" />
						<p class=" ">{helpText}</p>
					{:else}
						<Sparkles size="16" class="mt-0.5 min-w-4" />
						<p class=" ">Keine Hilfestellung verfügbar.</p>
					{/if}
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
