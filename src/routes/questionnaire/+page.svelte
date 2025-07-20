<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, Play, Upload, LogOut } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { logout } from '$lib/utils/auth';
	import { HELP_VISIBILITY_KEY, STORAGE_KEY } from '$lib/constants';
	import { getNextUnansweredQuestion } from '$lib/utils/questionHelpers';
	import { importProgress } from '$lib/utils/questionnaire';

	let { data }: { data: PageData } = $props();
	let fileInput: HTMLInputElement;

	const handleStart = () => {
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem(HELP_VISIBILITY_KEY);

		goto('/questionnaire/info');
	};

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				importProgress(content);

				// Get the next unanswered question and navigate to it
				const nextQuestionId = getNextUnansweredQuestion();
				if (nextQuestionId) {
					goto(`/questionnaire/question/${nextQuestionId}`);
				} else {
					// If all questions are answered, go to results
					goto('/questionnaire/results');
				}
			};
			reader.readAsText(file);
		}
	}
</script>

<div class="flex h-screen justify-center bg-gradient-to-b from-background to-muted">
	<!-- Logout Button -->
	<div class="absolute right-4 top-4">
		<Button variant="outline" size="sm" onclick={() => { logout(); goto('/login'); }}>
			<LogOut size="16" class="mr-2" />
			Logout
		</Button>
	</div>
	
	<div class="flex w-screen max-w-2xl flex-col justify-center gap-6">
		<h1 class="text-center text-3xl font-bold">Wie möchtest Du fortfahren?</h1>

		<!-- Start New Option -->
		<div class="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="mb-2 text-xl font-semibold">Von vorne starten</h2>
					<p class="text-muted-foreground">Beginne einen neuen Fragebogen.</p>
				</div>
				<Button size="lg" class="gap-2" onclick={handleStart}>
					Jetzt starten
					<Play size="20" />
				</Button>
			</div>
		</div>

		<!-- Continue Option -->
		<div class="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="mb-2 text-xl font-semibold">Fragebogen fortsetzen</h2>
					<p class="text-muted-foreground">
						Lade deinen Speicherstand hoch und setze deinen bereits begonnenen Fragebogen fort.
					</p>
				</div>
				<div class="flex flex-col items-center gap-4">
					<input
						type="file"
						accept=".json"
						class="hidden"
						bind:this={fileInput}
						onchange={handleFileSelect}
					/>
					<Button size="lg" class="gap-2" variant="outline" onclick={() => fileInput.click()}>
						Zum Upload
						<Upload size="20" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
