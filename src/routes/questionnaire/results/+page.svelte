<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Share2, Download, ArrowLeft, Sparkles } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { CATEGORY_ORDER, STORAGE_KEY } from '$lib/constants';
	import CategoryScore from '$lib/components/CategoryScore.svelte';
	import RadarChart from '$lib/components/RadarChart.svelte';
	import DetailedAnalysis from '$lib/components/DetailedAnalysis.svelte';
	import { generatePDF } from '$lib/utils/pdfGenerator';
	import { getStoredData, getStartupInfo } from '$lib/utils/questionnaire';
	import { Progress } from '$lib/components/ui/progress';

	let loading = true;
	let results: Record<string, number> = {};
	let totalScore: number = 0;
	let startupInfo: StartupInfo | null = null;

	let unlockedCategories: string[] = [];
	let totalUnlocked: number = 0;

	onMount(() => {
		const storedData = getStoredData();
		startupInfo = getStartupInfo();
		
		if (storedData) {
			// Group questions by category
			const categoryQuestions = new Map<string, Question[]>();
			
			storedData.questions.forEach((question) => {
				if (!categoryQuestions.has(question.category)) {
					categoryQuestions.set(question.category, []);
				}
				categoryQuestions.get(question.category)!.push(question);
			});

			// Check which categories are unlocked (all questions answered with 3 or 4)
			unlockedCategories = [];
			results = {};

			CATEGORY_ORDER.forEach((category) => {
				const questions = categoryQuestions.get(category) || [];
				const answeredQuestions = questions.filter(q => q.selectedScore !== null);
				const highScoreQuestions = answeredQuestions.filter(q => q.selectedScore === 3 || q.selectedScore === 4);
				const isUnlocked = answeredQuestions.length > 0 && 
					answeredQuestions.length === questions.length && 
					highScoreQuestions.length === answeredQuestions.length;
				if (isUnlocked) {
					unlockedCategories.push(category);
				}
				const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.selectedScore || 0), 0);
				const avgScore = answeredQuestions.length > 0 ? totalScore / answeredQuestions.length : 0;
				results[category] = Math.round(avgScore * 10) / 10;
			});

			totalUnlocked = unlockedCategories.length;
		}
		loading = false;
	});

	const handleDownloadPDF = async () => {
		await generatePDF();
	};

	$: scoreColor =
		totalScore >= 3 ? 'text-green-500' : totalScore >= 2 ? 'text-lime-500' : 'text-blue-700';
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
										class="relative z-10 flex w-full flex-col items-center justify-center rounded-t-md bg-background p-4 text-foreground ring-1 {i +
											1 <=
										totalScore
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
							{#if totalScore >= 4}
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

			<!-- Startup Information -->
			{#if startupInfo}
				<Card.Root class="mb-8">
					<Card.Header>
						<Card.Title>Über dein Startup</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div class="space-y-2">
								<p class="text-sm font-medium text-muted-foreground">Branche</p>
								<p class="text-sm">{startupInfo.industry}</p>
							</div>
							<div class="space-y-2">
								<p class="text-sm font-medium text-muted-foreground">Technologie</p>
								<p class="text-sm">{startupInfo.productCategory}</p>
							</div>
							<div class="space-y-2">
								<p class="text-sm font-medium text-muted-foreground">Zielkunden</p>
								<p class="text-sm">{startupInfo.targetCustomers}</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

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
									{#if totalScore >= 3.5}
										Eure Antworten zeigen: Ihr arbeitet datenbasiert, nutzerzentriert und mit einem
										klaren Lernansatz. Ihr lebt kontinuierliche Verbesserung und passt euch aktiv an
										neue Erkenntnisse und Entwicklungen an – stark!
									{:else if totalScore >= 3}
										Ihr habt klare Prozesse, überprüft eure Annahmen regelmäßig und optimiert aktiv.
										Nutzerfeedback, Daten und Reflexion fließen systematisch in eure Entscheidungen
										ein – das ist ein starkes Fundament für Wachstum.
									{:else if totalScore >= 2}
										Euer Startup verfolgt einen klareren Plan – Prozesse, Ziele und Modelle sind
										ausgearbeitet. Jetzt geht es darum, eure Methoden zu überprüfen und belastbarer
										zu machen, z. B. durch Nutzerfeedback oder Marktvalidierung.
									{:else}
										Ihr habt euch bereits Gedanken gemacht und erste Abläufe oder Annahmen
										entwickelt. Um auf das nächste Level zu kommen, solltet ihr diese nun
										systematisieren, dokumentieren und im Team abstimmen.
									{/if}
								</p>
								<p class="text-sm text-muted-foreground mt-6">
									Aktuell befindet sich das Startup auf der Stufe:
								</p>
								<div class="my-3 text-center text-8xl font-bold {scoreColor}">
									{totalUnlocked}
								</div>
							</div>
							{#if totalUnlocked > 0}
							<div class="space-y-4">
								<div class="rounded-2xl p-2">
									<h3 class="font-semibold {unlockedCategories.includes('Ideen- und Teamfindung') ? 'text-white' : 'text-muted'}">1. Ideen- und Teamfindung</h3>
									<p class="text-sm {unlockedCategories.includes('Ideen- und Teamfindung') ? 'text-white' : 'text-muted'}">
										Team, Motivation, Zielgruppe, Marktsegmentierung.
									</p>
								</div>
								<div class="rounded-2xl p-2">
									<h3 class="font-semibold {unlockedCategories.includes('Chancen Validierung') ? 'text-white' : 'text-muted'}">2. Chancen Validierung</h3>
									<p class="text-sm {unlockedCategories.includes('Chancen Validierung') ? 'text-white' : 'text-muted'}">
										Value Proposition, Problem-Solution-Fit, Geschäftsmodell.
									</p>
								</div>
								<div class="rounded-2xl p-2">
									<h3 class="font-semibold {unlockedCategories.includes('Marktgerechte Lösungsfindung') ? 'text-white' : 'text-muted'}">3. Marktgerechte Lösungsfindung</h3>
									<p class="text-sm {unlockedCategories.includes('Marktgerechte Lösungsfindung') ? 'text-white' : 'text-muted'}">
										Nutzerfeedback, Marktvalidierung, Wettbewerbsanalyse.
									</p>
								</div>
								<div class="rounded-2xl p-2">
									<h3 class="font-semibold {unlockedCategories.includes('Übergang zum Markt-Start') ? 'text-white' : 'text-muted'}">4. Übergang zum Markt-Start</h3>
									<p class="text-sm {unlockedCategories.includes('Übergang zum Markt-Start') ? 'text-white' : 'text-muted'}">
										Markteintrittsstrategie, Ressourcenplanung, Teamentwicklung.
									</p>
								</div>
								<div class="rounded-2xl p-2">
									<h3 class="font-semibold {unlockedCategories.includes('Markteintritt und Wachstum') ? 'text-white' : 'text-muted'}">5. Markteintritt und Wachstum</h3>
									<p class="text-sm {unlockedCategories.includes('Markteintritt und Wachstum') ? 'text-white' : 'text-muted'}">
										Skalierung, Wachstum, Qualitätssicherung.
									</p>
								</div>
							</div>
							{:else}
								<p class="text-sm text-muted-foreground">
									Es wurden zu wenig Fragen auf den Antwortstufen 3 und 4 beantwortet. Nur so wird eine Kategorie als erreicht gewertet.
								</p>
							{/if}
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Header>
							<Card.Title>Kategoriebewertungen</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="pb-6 text-sm text-muted-foreground">
								Hier kannst du deine Gesamtbewertung sehen. Je höher die Bewertung, desto besser ist
								die Kategorie für dich. Ein Score von unter 2,5 bedeutet, dass du in dieser Kategorie
								noch Verbesserungspotenzial hast. 3-4 bedeutet, dass du in dieser Kategorie sehr gut
								abschneidest.
							</p>
							<div class="aspect-square">
								<RadarChart data={results} />
							</div>
						</Card.Content>
					</Card.Root>
				</div>
				<!-- AI Recommendations -->
				<Card.Root class="col-span-2">
					<Card.Header>
						<Card.Title
							><div class="flex items-center gap-2">
								Dynamische Empfehlung für dein Startup
								<Sparkles size="20" />
							</div>
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="">
							Diese Empfehlung wurde mit KI erstellt. Sie ist möglicherweise nicht
							immer vollständig korrekt oder passend für Deine individuelle Situation.
						</p>
						<p class="text-xs text-muted-foreground text-center">
							Diese Empfehlung wurde mit KI erstellt. Sie ist möglicherweise nicht
							immer vollständig korrekt oder passend für Deine individuelle Situation.
						</p>
					</Card.Content>
				</Card.Root>
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
