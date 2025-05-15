<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Share2, Download, ArrowLeft } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { STORAGE_KEY } from '$lib/constants';
	import CategoryScore from '$lib/components/CategoryScore.svelte';
	import RadarChart from '$lib/components/RadarChart.svelte';
	import DetailedAnalysis from '$lib/components/DetailedAnalysis.svelte';
	import { generatePDF } from '$lib/utils/pdfGenerator';
	import { getStoredData } from '$lib/utils/questionnaire';

	let loading = true;
	let results: Record<string, number> = {};

	onMount(() => {
		const storedData = getStoredData();
		if (storedData) {
			// Calculate average score per category
			const categoryScores = new Map<string, { total: number; count: number }>();
			
			storedData.questions.forEach(question => {
				if (question.selectedScore !== null) {
					const current = categoryScores.get(question.category) || { total: 0, count: 0 };
					current.total += question.selectedScore;
					current.count += 1;
					categoryScores.set(question.category, current);
				}
			});

			// Convert to 1-5 scale scores
			results = Object.fromEntries(
				Array.from(categoryScores.entries()).map(([category, { total, count }]) => [
					category,
					Math.round((total / count) * 10) / 10 // Round to 1 decimal place
				])
			);
		}
		loading = false;
	});

	const handleDownloadPDF = async () => {
		await generatePDF();
	};
</script>

<div class="min-h-screen bg-gradient-to-b from-background to-muted p-6">
	<div class="mx-auto max-w-6xl">
		<!-- Header -->
		<div class="mb-8 flex items-center justify-between">
			<Button variant="ghost" onclick={() => history.back()} class="gap-2">
				<ArrowLeft size="20" />
				Zurück
			</Button>
		</div>

		{#if loading}
			<div class="flex h-[60vh] items-center justify-center">
				<div class="text-lg">Lade Ergebnisse...</div>
			</div>
		{:else}
			<!-- Main Content -->
			<div class="grid gap-8 md:grid-cols-2">
				<!-- Overall Score -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Gesamtbewertung</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-sm text-muted-foreground pb-6">
							Hier kannst du deine Gesamtbewertung sehen. Je höher die Bewertung, desto besser ist die Kategorie für dich. Ein Score von unter 3 bedeutet, dass du in dieser Kategorie noch Verbesserungspotenzial hast. 4-5 bedeutet, dass du in dieser Kategorie sehr gut abschneidest.
						</p>
						<div class="aspect-square">
							<RadarChart data={results} />
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Category Scores -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Kategoriebewertungen</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-sm text-muted-foreground pb-6">
							Hier kannst du deine die durchschnittlichen Bewertungen für jede Kategorie sehen. Je höher die Bewertung, desto besser ist die Kategorie für dich. Ein Score von unter 3 bedeutet, dass du in dieser Kategorie noch Verbesserungspotenzial hast. 4-5 bedeutet, dass du in dieser Kategorie sehr gut abschneidest.
						</p>
						<div class="space-y-4">
							{#each Object.entries(results) as [category, score]}
								<CategoryScore {category} {score} />
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Detailed Analysis -->
				<Card.Root class="col-span-2">
					<Card.Header>
						<Card.Title>Detaillierte Analyse</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-sm text-muted-foreground pb-6">
							Hier sehen Sie eine detaillierte Aufschlüsselung Ihrer Antworten nach Kategorien. Fragen mit einer Bewertung von 1-3 zeigen Verbesserungspotenzial, während Fragen mit einer Bewertung von 4-5 Ihre Stärken darstellen.
						</p>
						<DetailedAnalysis />
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
	</div>
</div> 