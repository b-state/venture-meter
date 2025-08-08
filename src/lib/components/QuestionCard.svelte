<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { HELP_VISIBILITY_KEY } from '$lib/constants';
	import { saveProgress } from '$lib/utils/questionnaire';
	import { streamHelpText } from '$lib/utils/fetchingHelpers';
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
			fetchHelpText(questionId);
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
		if (!helpText && !isLoadingHelp) {
			await fetchHelpText(questionId);
		}
	}

	async function fetchHelpText(questionId: number) {
		helpText = '';
		isLoadingHelp = true;
		try {
			for await (const partial of streamHelpText(questionId)) {
				helpText = partial; // This will update as new chunks arrive
			}
		} catch (error) {
			console.error('Error fetching help text:', error);
			helpText = null;
		} finally {
			isLoadingHelp = false;
		}
	}
</script>

<div class="flex h-[500px] w-full gap-5">
	<div class="flex h-full w-2/3 grow flex-col gap-2">
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
		<div class="relative flex h-full w-1/3 items-start gap-2 rounded-md bg-background p-4">
			<div
				class="absolute inset-0 rounded-md bg-gradient-to-r from-pink-400/60 via-violet-400/60 to-pink-400/60 p-[1px]"
			>
				<div class="h-full w-full rounded-md bg-background"></div>
			</div>
			<div class="relative z-10 h-full">
				{#if isLoadingHelp && (!helpText || helpText.length === 0)}
					<div class="flex items-center gap-2">
						<Loader2 size="16" class="animate-spin" />
						<p class="">{loadingMessages[loadingMessageIndex]}</p>
					</div>
				{:else if helpText && helpText.length > 0}
					<div class="flex h-full flex-col justify-between">
						<div class="flex gap-2">
							<Sparkles size="16" class="mt-0.5 min-w-4" />
							<div class="relative w-full">
								<p class="max-h-[450px] overflow-y-auto whitespace-pre-wrap pb-8">{helpText}</p>
								<div
									class="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent"
								></div>
							</div>
						</div>
						<p class="w-full text-center text-xs text-muted-foreground">
							Von KI erstellt – Irrtümer möglich.
						</p>
					</div>
				{:else}
					<div class="flex items-center gap-2">
						<Sparkles size="16" class="mt-0.5 min-w-4" />
						<p class=" ">Kein Spickzettel verfügbar.</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
