<script lang="ts">
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import { Progress } from '$lib/components/ui/progress';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import { CircleCheckBig } from 'lucide-svelte';
	import {
		goToNextQuestion,
		goToPreviousQuestion,
		getFirstRelevantQuestionIdForCategory
	} from '$lib/utils/questionHelpers.js';
	import { getCategoryStats, exportProgress } from '$lib/utils/questionnaire';
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { goto } from '$app/navigation';
	import { STORAGE_KEY } from '$lib/constants';

	let { data } = $props();
	let currentQuestion = $derived(data.question);
	let totalQuestions = $derived(data.totalQuestions);
	let currentId = $derived(parseInt(page.params.id));
	let progress = $derived((currentId / totalQuestions) * 100);
	let categories: { title: string; questionCount: number; answeredCount: number }[] = $state([]);

	let isAfterLastQuestion = $derived(currentId === totalQuestions + 1);

	onMount(async () => {
		updateCategories();
	});

	async function updateCategories() {
		categories = await getCategoryStats();
	}

	function downloadProgress() {
		const progressData = exportProgress();
		const blob = new Blob([progressData], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'venture-meter-progress.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function jumpToCategory(categoryTitle: string) {
		const questionId = getFirstRelevantQuestionIdForCategory(categoryTitle);
		if (questionId) {
			goto(`/questionnaire/question/${questionId}`);
		}
	}
</script>

<div class="flex">
	<aside class="flex min-h-[calc(100vh-64px)] w-1/4 flex-col justify-start ring-1 ring-muted">
		{#each categories as category, index}
			<div
				class="flex h-full flex-col justify-center gap-2 px-5 py-5 ring-1 ring-muted transition hover:bg-muted-foreground/10 {currentQuestion?.category ===
				category.title
					? 'bg-muted'
					: ''}"
			>
				<button
					class="cursor-pointer text-left text-xl font-bold hover:underline"
					onclick={() => jumpToCategory(category.title)}>{category.title}</button
				>
				<div class="flex items-center gap-1 text-muted-foreground">
					<p class="text-sm">
						{category.answeredCount} von {category.questionCount} Fragen beantwortet
					</p>
					{#if category.answeredCount === category.questionCount}
						<CircleCheckBig size="18" color="#32CD32" />
					{/if}
				</div>
			</div>
		{/each}

		<div class="mt-auto flex flex-col justify-center gap-2 px-5 py-10 ring-1 ring-muted transition">
			<div class="flex flex-col items-center gap-2 text-muted-foreground">
				<Dialog.Root>
					<Dialog.Trigger class="w-full">
						<div><Button variant="outline" class="w-full ">Fortschritt speichern</Button></div>
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Fortschritt speichern</Dialog.Title>
							<Dialog.Description>
								<p class="my-5">
									Du kannst den Fortschritt des Fragebogens als Datei herunterladen und ihn somit
									speichern. Wenn Du den Fragebogen zu einem späteren Zeitpunkt fortsetzen möchtest,
									kannst Du ihn unter dem Menüpunkt "Fragebogen" jederzeit hochladen.
								</p>
								<Button class="w-full text-sm" onclick={downloadProgress}
									>Fortschritt herunterladen</Button
								>
							</Dialog.Description>
						</Dialog.Header>
					</Dialog.Content>
				</Dialog.Root>
			</div>
		</div>
	</aside>
	<main class="my-10 flex w-screen flex-col items-center justify-center px-10">
		<div class="my-auto flex w-full flex-col justify-center">
			{#if currentQuestion}
				{#key currentQuestion.id}
					<QuestionCard
						question={currentQuestion.question}
						options={currentQuestion.options}
						questionId={currentQuestion.id}
						selectedScore={currentQuestion.selectedScore ?? null}
						onAnswer={updateCategories}
					/>
				{/key}
			{:else if isAfterLastQuestion}
				<div class="flex flex-col items-center justify-center">
					{#if categories.every((c) => c.answeredCount === c.questionCount)}
						<p>Alle Fragen wurden beantwortet. Unten geht es zur Auswertung.</p>
					{:else}
						<p class="">
							Nicht alle Fragen wurden beantwortet. Bitte beantworte alle Fragen, um zur Auswertung zu kommen.
						</p>
					{/if}
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center">
					<p>Frage nicht gefunden.</p>
				</div>
			{/if}
		</div>
		<div class="flex w-full flex-col gap-2">
			<div class="w-full gap-2 flex flex-col">
				<p>Fortschritt</p>
				<Progress value={progress} class="h-2" />
			</div>
			<div class="flex justify-between gap-2">
				{#if currentId > 1}
					<Button variant="outline" onclick={() => goToPreviousQuestion(currentId)}>Zurück</Button>
				{/if}
				{#if currentId < totalQuestions + 1}
					<Button
						variant="outline"
						onclick={() => goToNextQuestion(currentId, totalQuestions)}
						class="ml-auto"
					>
						Weiter
					</Button>
				{/if}
				{#if categories.every((c) => c.answeredCount === c.questionCount)}
					<Button
						onclick={() => goto('/questionnaire/results')}
						variant="outline"
						class="bg-[#32CD32] text-sm text-background hover:bg-[#37E637] hover:text-background"
						>Zur Auswertung</Button
					>
				{/if}
			</div>
		</div>
	</main>
</div>
