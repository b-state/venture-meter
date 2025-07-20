<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { HELP_VISIBILITY_KEY } from '$lib/constants';
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
	let loadingMessageIndex = $state(0);
	let loadingInterval: ReturnType<typeof setInterval> | undefined;

	const loadingMessages = [
		'Lade Spickzettel...',
		'Kleinen Moment noch...',
		'Einatmen.. und Ausatmen..'
	];

	onMount(() => {
		// Load help visibility state from localStorage
		const savedHelpVisibility = localStorage.getItem(HELP_VISIBILITY_KEY);
		if (savedHelpVisibility === 'true') {
			fetchHelpText();
			showHelp = true;
		}

		return () => {
			if (loadingInterval) {
				clearInterval(loadingInterval);
			}
		};
	});

	$effect(() => {
		// Save help visibility state to localStorage whenever it changes
		localStorage.setItem(HELP_VISIBILITY_KEY, showHelp.toString());
	});

	$effect(() => {
		if (isLoadingHelp) {
			loadingInterval = setInterval(() => {
				loadingMessageIndex = (loadingMessageIndex + 1) % loadingMessages.length;
			}, 3000);
		} else {
			if (loadingInterval) {
				clearInterval(loadingInterval);
				loadingInterval = undefined;
			}
			loadingMessageIndex = 0;
		}
	});

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
				const reader = response.body!.getReader();
				helpText = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					const chunk = new TextDecoder().decode(value);
					helpText += chunk;

					// Stop loading once we have some content
					if (helpText.length > 0) {
						isLoadingHelp = false;
					}
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

<div class="flex w-full gap-5">
	<div class="flex w-2/3 grow flex-col gap-2">
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

		<div class="relative self-end">
			<div
				class="absolute inset-0 rounded-md bg-gradient-to-r from-pink-400/60 via-violet-400/60 to-pink-400/60 p-[1px]"
			>
				<div class="h-full w-full rounded-md bg-background"></div>
			</div>
			<button
				class="relative z-10 flex w-fit items-center gap-2 rounded-md p-2 text-sm text-muted-foreground transition hover:text-primary"
				onclick={toggleHelp}
			>
				<HelpCircle size="20" /> Spickzettel {showHelp ? 'ausblenden' : 'anzeigen'}
			</button>
		</div>
	</div>

	{#if showHelp}
		<div class="w-1/3">
			<Card class="relative bg-background text-foreground ">
				<div
					class="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-400/60 via-violet-400/60 to-pink-400/60 p-[1px]"
				>
					<div class="h-full w-full rounded-lg bg-background"></div>
				</div>
				<CardContent class="relative z-10 max-h-fit p-4">
					<div class="flex items-start gap-2">
						{#if isLoadingHelp}
							<div class="flex items-center gap-2">
								<Loader2 size="16" class="animate-spin" />
								<p class="">{loadingMessages[loadingMessageIndex]}</p>
							</div>
						{:else if helpText && helpText.length > 0}
							<Sparkles size="16" class="mt-0.5 min-w-4" />
							<div class="relative">
								<p class="max-h-96 overflow-y-auto whitespace-pre-wrap pb-8">{helpText}</p>
								<div
									class="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent"
								></div>
							</div>
						{:else}
							<Sparkles size="16" class="mt-0.5 min-w-4" />
							<p class=" ">Kein Spickzettel verfügbar.</p>
						{/if}
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>
