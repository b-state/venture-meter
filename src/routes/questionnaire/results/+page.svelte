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
	import { Progress } from '$lib/components/ui/progress';

	let loading = true;
	let results: Record<string, number> = {};
	let totalScore: number = 0;

	onMount(() => {
		const storedData = getStoredData();
		if (storedData) {
			// Calculate average score per category
			const categoryScores = new Map<string, { total: number; count: number }>();
			let totalQuestions = 0;
			let totalScoreSum = 0;

			storedData.questions.forEach((question) => {
				if (question.selectedScore !== null) {
					const current = categoryScores.get(question.category) || { total: 0, count: 0 };
					current.total += question.selectedScore;
					current.count += 1;
					categoryScores.set(question.category, current);

					// Add to total score calculation
					totalScoreSum += question.selectedScore;
					totalQuestions += 1;
				}
			});

			// Calculate total average score
			totalScore = totalQuestions > 0 ? Math.round((totalScoreSum / totalQuestions) * 10) / 10 : 0;

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

	$: scoreColor =
		totalScore >= 4 ? 'text-green-500' : totalScore >= 3 ? 'text-lime-500' : 'text-blue-700';
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
			<!-- Journey Card -->
			<Card.Root class="mb-8">
				<Card.Header>
					<Card.Title>Deine Position in der Startup Journey</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="relative rounded-xl p-8">
						<div class="flex items-end">
							{#each Object.entries(results) as [category, score], i}
								<div class="relative flex w-full flex-col items-center">
									<!-- Category Box -->
									<div
										class="relative z-10 flex w-full flex-col items-center justify-center rounded-t-md bg-background p-4 text-foreground ring-1 {i + 1 <= totalScore
											? i === 0
												? 'bg-gradient-to-t from-blue-200/10 to-transparent ring-blue-200'
												: i === 1
													? 'bg-gradient-to-t from-sky-300/10 to-transparent ring-sky-300'
													: i === 2
														? 'bg-gradient-to-t from-sky-500/10 to-transparent ring-sky-500'
														: i === 3
															? 'bg-gradient-to-t from-teal-500/10 to-transparent ring-teal-500'
															: 'bg-gradient-to-t from-emerald-500/10 to-transparent ring-emerald-500'
											: 'ring-gray-400'}"
										style="height: {120 + i * 20}px;"
									>
										<span class="text-center text-sm font-semibold">{category}</span>
									</div>
								</div>
							{/each}
						</div>
						<div class="mt-8 text-center text-sm text-muted-foreground">

							{#if totalScore >= 5}
								{'Text über Kategorie 5 einfügen'}
								{:else if totalScore >= 4}
								{'Text über Kategorie 4 einfügen'}
							{:else if totalScore >= 3}
								{'Text über Kategorie 3 einfügen'}
							{:else if totalScore >= 2}
								{'Text über Kategorie 2 einfügen'}
							{:else}
								{'Text über Kategorie 1 einfügen'}
							{/if}
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Main Content -->
			<div class="flex flex-col gap-8">
				<div class="flex gap-8">
					<!-- Overall Score -->
					<Card.Root>
						<Card.Header>
							<Card.Title>Ergebnis</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="">
								<p class="text-sm text-muted-foreground">
									{#if totalScore >= 4.5}
										Eure Antworten zeigen: Ihr arbeitet datenbasiert, nutzerzentriert und mit einem
										klaren Lernansatz. Ihr lebt kontinuierliche Verbesserung und passt euch aktiv an
										neue Erkenntnisse und Entwicklungen an – stark!
									{:else if totalScore >= 4}
										Ihr habt klare Prozesse, überprüft eure Annahmen regelmäßig und optimiert aktiv.
										Nutzerfeedback, Daten und Reflexion fließen systematisch in eure Entscheidungen
										ein – das ist ein starkes Fundament für Wachstum.
									{:else if totalScore >= 3}
										Euer Startup verfolgt einen klareren Plan – Prozesse, Ziele und Modelle sind
										ausgearbeitet. Jetzt geht es darum, eure Methoden zu überprüfen und belastbarer
										zu machen, z. B. durch Nutzerfeedback oder Marktvalidierung.
									{:else if totalScore >= 2}
										Ihr habt euch bereits Gedanken gemacht und erste Abläufe oder Annahmen
										entwickelt. Um auf das nächste Level zu kommen, solltet ihr diese nun
										systematisieren, dokumentieren und im Team abstimmen.
									{:else}
										Eure Antworten zeigen, dass ihr viele Themen noch nicht strukturiert angegangen
										seid. Das ist ganz normal in einer frühen Phase. Jetzt ist ein guter Moment, um
										erste Zuständigkeiten, Zielbilder und Hypothesen zu definieren.
									{/if}
								</p>
								<p class="text-sm text-muted-foreground">
									Aktuell befindet sich euer Startup in der Stufe:
								</p>
								<div class="my-3 text-center text-8xl font-bold {scoreColor}">
									{totalScore.toFixed(1).toString().replace('.', ',')}
								</div>
							</div>
							<div class="space-y-4">
								<div class=" rounded-2xl p-2">
									<h3 class="font-semibold">Stufe 1 – Initial</h3>
									<p class="text-sm">
										Es gibt noch keine klaren Prozesse, Strukturen oder Routinen. Alles ist ad hoc
										und stark abhängig von einzelnen Personen.
									</p>
								</div>

								<div class=" rounded-2xl p-2">
									<h3 class="font-semibold">Stufe 2 – Definiert</h3>
									<p class="text-sm">
										Erste Vorstellungen, Modelle oder Zuständigkeiten sind vorhanden. Dinge sind
										teilweise dokumentiert, aber noch nicht konsequent umgesetzt.
									</p>
								</div>

								<div class=" rounded-2xl p-2">
									<h3 class="font-semibold">Stufe 3 – Systematisiert</h3>
									<p class="text-sm">
										Prozesse und Vorgehensweisen sind etabliert, regelmäßig im Einsatz und im Team
										abgestimmt.
									</p>
								</div>

								<div class=" rounded-2xl p-2">
									<h3 class="font-semibold">Stufe 4 – Validiert & Reflektiert</h3>
									<p class="text-sm">
										Das Vorgehen wird aktiv überprüft, z. B. durch Nutzerfeedback, Daten oder
										strukturierte Rückmeldeschleifen, und bei Bedarf angepasst.
									</p>
								</div>

								<div class=" rounded-2xl p-2">
									<h3 class="font-semibold">Stufe 5 – Lernend & Optimierend</h3>
									<p class="text-sm">
										Kontinuierliche Verbesserung ist fester Bestandteil der Arbeitsweise.
										Entscheidungen basieren auf fundierten Erkenntnissen, und Lernen findet aktiv
										statt – z. B. durch Co-Creation, Experimente oder datenbasierte Optimierung.
									</p>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Header>
							<Card.Title>Kategoriebewertungen</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="pb-6 text-sm text-muted-foreground">
								Hier kannst du deine Gesamtbewertung sehen. Je höher die Bewertung, desto besser ist
								die Kategorie für dich. Ein Score von unter 3 bedeutet, dass du in dieser Kategorie
								noch Verbesserungspotenzial hast. 4-5 bedeutet, dass du in dieser Kategorie sehr gut
								abschneidest.
							</p>
							<div class="aspect-square">
								<RadarChart data={results} />
							</div>
						</Card.Content>
					</Card.Root>
				</div>
				<!-- Detailed Analysis -->
				<Card.Root class="col-span-2">
					<Card.Header>
						<Card.Title>Detaillierte Analyse</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="pb-6 text-sm text-muted-foreground">
							Hier sehen Sie eine detaillierte Aufschlüsselung Ihrer Antworten nach Kategorien.
							Fragen mit einer Bewertung von 1-3 zeigen Verbesserungspotenzial, während Fragen mit
							einer Bewertung von 4-5 Ihre Stärken darstellen.
						</p>
						<DetailedAnalysis />
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
	</div>
</div>
