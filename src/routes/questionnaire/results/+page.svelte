<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Share2, Download, ArrowLeft, Sparkles, Loader2 } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { CATEGORY_ORDER, STORAGE_KEY } from '$lib/constants';
	import CategoryScore from '$lib/components/CategoryScore.svelte';
	import RadarChart from '$lib/components/RadarChart.svelte';
	import DetailedAnalysis from '$lib/components/DetailedAnalysis.svelte';
	import QuestionAnswerReview from '$lib/components/QuestionAnswerReview.svelte';
	import { generatePDF } from '$lib/utils/pdfGenerator';
	import { getStoredData, getStartupInfo } from '$lib/utils/questionnaire';
	import { isCategoryUnlocked } from '$lib/utils/questionHelpers';
	import { Progress } from '$lib/components/ui/progress';

	let loading = $state(true);
	let results: Record<string, number> = $state({});
	let totalScore: number = $state(0);
	let startupInfo: StartupInfo | null = $state(null);

	let unlockedCategories: string[] = $state([]);
	let totalUnlocked: number = $state(0);

	let recommendationLoading = $state(false);
	let recommendation = $state('');

	onMount(async () => {
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

			// Check which categories are unlocked using the sequential unlocking logic
			unlockedCategories = [];
			results = {};

			CATEGORY_ORDER.forEach((category) => {
				const questions = categoryQuestions.get(category) || [];
				const answeredQuestions = questions.filter((q) => q.selectedScore !== null);

				// Use the sequential unlocking logic
				const isUnlocked = isCategoryUnlocked(category);

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

		// Fetch AI recommendation
		await fetchRecommendation();
	});

	const fetchRecommendation = async () => {
		if (!startupInfo) return;

		recommendationLoading = true;
		try {
			// Get weak answers (stages 1 & 2)
			const storedData = getStoredData();
			let weakAnswers = [];

			if (storedData) {
				weakAnswers = storedData.questions
					.filter((q) => q.selectedScore !== null && q.selectedScore <= 2)
					.map((q) => ({
						category: q.category,
						question: q.question,
						selectedAnswer: q.options[q.selectedScore - 1],
						score: q.selectedScore
					}));
			}

			const params = new URLSearchParams({
				industry: startupInfo.industry,
				productCategory: startupInfo.productCategory,
				targetCustomers: startupInfo.targetCustomers,
				weakAnswers: JSON.stringify(weakAnswers),
				finalPhase: CATEGORY_ORDER[totalUnlocked - 1]
			});

			const response = await fetch(`/api/recommendation?${params}`);
			if (response.ok) {
				const reader = response.body?.getReader();
				if (reader) {
					const decoder = new TextDecoder();
					let result = '';

					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						const chunk = decoder.decode(value, { stream: true });
						result += chunk;
						recommendation = result;
					}
				}
			}
		} catch (error) {
			console.error('Error fetching recommendation:', error);
		} finally {
			recommendationLoading = false;
		}
	};

	const handleDownloadPDF = async () => {
		await generatePDF();
	};
	let scoreColor = $derived(
		totalScore >= 3 ? 'text-green-500' : totalScore >= 2 ? 'text-lime-500' : 'text-blue-700'
	);

	function getCategoryBoxClass(category: string, i: number) {
		if (unlockedCategories.includes(category)) {
			// Assign a color based on index or category
			switch (i) {
				case 0:
					return 'bg-gradient-to-t from-blue-200/10 to-transparent ring-blue-200';
				case 1:
					return 'bg-gradient-to-t from-sky-300/10 to-transparent ring-sky-300';
				case 2:
					return 'bg-gradient-to-t from-sky-500/10 to-transparent ring-sky-500';
				case 3:
					return 'bg-gradient-to-t from-teal-500/10 to-transparent ring-teal-500';
				default:
					return 'bg-gradient-to-t from-emerald-500/10 to-transparent ring-emerald-500';
			}
		}
		return 'ring-gray-400';
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-background to-muted p-6">
	<div class="mx-auto max-w-6xl">
		<!-- Header -->
		<div class=" mb-8 flex items-center justify-between">
			<Button variant="outline" onclick={() => history.back()} class="gap-2">
				<ArrowLeft size="20" />
				Zurück zur Fragebogen
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
										class="relative z-10 flex w-full flex-col items-center justify-center rounded-t-md bg-background p-4 text-foreground ring-1 {getCategoryBoxClass(
											category,
											i
										)}"
										style="height: {120 + i * 20}px;"
									>
										<span class="text-center text-sm font-semibold">{category}</span>
									</div>
								</div>
							{/each}
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
					<Card.Root class="w-1/3">
						<Card.Header>
							<Card.Title>Ergebnis</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="">
								<p class="text-sm text-foreground">
									{#if totalUnlocked === 5}
										Großartig – euer Produkt ist am Markt angekommen, und ihr arbeitet bereits an
										Wachstum und Skalierung. Mit klaren Zielgrößen, einer Vertriebsstrategie und
										ersten Einnahmen geht ihr den nächsten professionellen Schritt.
									{:else if totalUnlocked === 4}
										Ihr seid bereit für den nächsten Schritt: Die Markteintrittsstrategie steht,
										interne Strukturen entwickeln sich, erste Pilotkunden sind in Sicht oder schon
										an Bord. Ihr schafft gerade die Brücke vom Prototyp zur echten Anwendung, ein
										toller Fortschritt!
									{:else if totalUnlocked === 3}
										Ihr seid mitten in der aktiven Auseinandersetzung mit dem Markt. Nutzerfeedback,
										Wettbewerbsanalysen und Marktpotenziale fließen in eure Entwicklung ein, das ist
										ein großer Meilenstein auf dem Weg zu einem wirklich marktfähigen Produkt.
										Glückwunsch!
									{:else if totalUnlocked === 2}
										Ihr habt bereits viel erreicht: Eine klare Value Proposition nimmt Form an, euer
										Geschäftsmodell ist nicht mehr nur eine Idee und erste Rückmeldungen zeigen,
										dass ihr ein echtes Problem löst. Eine starke Basis für die nächsten Schritte!
									{:else if totalUnlocked === 1}
										Herzlichen Glückwunsch – ihr habt bereits die erste wichtige Hürde gemeistert:
										Ihr habt ein motiviertes Team gefunden, erste Ideen konkretisiert und begonnen,
										eure Zielgruppe und den Markt einzugrenzen. Damit legt ihr das Fundament für
										alles Weitere.
									{:else}
										Es wurden zu wenig Fragen auf den Antwortstufen 3 und 4 beantwortet. Nur so wird
										eine Kategorie als erreicht gewertet.
									{/if}
								</p>
								<p class="mt-6 text-sm text-foreground">
									Aktuell befindet sich das Startup auf der Stufe:
								</p>
								<div class="my-3 text-center text-8xl font-bold {scoreColor}">
									{totalUnlocked}
								</div>
							</div>
							{#if totalUnlocked > 0}
								<div class="space-y-4">
									<div class="rounded-2xl p-2">
										<h3
											class="font-semibold {unlockedCategories.includes('Ideen- und Teamfindung')
												? 'text-foreground'
												: 'text-muted'}"
										>
											1. Ideen- und Teamfindung
										</h3>
										<p
											class="text-sm {unlockedCategories.includes('Ideen- und Teamfindung')
												? 'text-foreground'
												: 'text-muted'}"
										>
											Team, Motivation, Zielgruppe, Marktsegmentierung.
										</p>
									</div>
									<div class="rounded-2xl p-2">
										<h3
											class="font-semibold {unlockedCategories.includes('Chancen-Validierung')
												? 'text-foreground'
												: 'text-muted'}"
										>
											2. Chancen-Validierung
										</h3>
										<p
											class="text-sm {unlockedCategories.includes('Chancen-Validierung')
												? 'text-foreground'
												: 'text-muted'}"
										>
											Value Proposition, Problem-Solution-Fit, Geschäftsmodell.
										</p>
									</div>
									<div class="rounded-2xl p-2">
										<h3
											class="font-semibold {unlockedCategories.includes(
												'Marktgerechte Lösungsfindung'
											)
												? 'text-foreground'
												: 'text-muted'}"
										>
											3. Marktgerechte Lösungsfindung
										</h3>
										<p
											class="text-sm {unlockedCategories.includes('Marktgerechte Lösungsfindung')
												? 'text-foreground'
												: 'text-muted'}"
										>
											Nutzerfeedback, Marktvalidierung, Wettbewerbsanalyse.
										</p>
									</div>
									<div class="rounded-2xl p-2">
										<h3
											class="font-semibold {unlockedCategories.includes('Übergang zum Markt-Start')
												? 'text-foreground'
												: 'text-muted'}"
										>
											4. Übergang zum Markt-Start
										</h3>
										<p
											class="text-sm {unlockedCategories.includes('Übergang zum Markt-Start')
												? 'text-foreground'
												: 'text-muted'}"
										>
											Markteintrittsstrategie, Ressourcenplanung, Teamentwicklung.
										</p>
									</div>
									<div class="rounded-2xl p-2">
										<h3
											class="font-semibold {unlockedCategories.includes(
												'Markteintritt und Wachstum'
											)
												? 'text-foreground'
												: 'text-muted'}"
										>
											5. Markteintritt und Wachstum
										</h3>
										<p
											class="text-sm {unlockedCategories.includes('Markteintritt und Wachstum')
												? 'text-foreground'
												: 'text-muted'}"
										>
											Skalierung, Wachstum, Qualitätssicherung.
										</p>
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
					<Card.Root class="w-2/3">
						<Card.Header>
							<Card.Title>Kategoriebewertungen</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="pb-6 text-sm text-foreground">
								Hier siehst du auf einen Blick, wie du in den einzelnen Bereichen abgeschnitten
								hast. Je weiter außen ein Punkt liegt, desto besser ist dein Ergebnis in dieser
								Kategorie.
							</p>
							<div class="aspect-square">
								<RadarChart data={results} />
							</div>
						</Card.Content>
					</Card.Root>
				</div>
				<!-- AI recommendation -->
				<Card.Root class="col-span-2">
					<Card.Header>
						<Card.Title
							><div class="flex items-center gap-2">
								<Sparkles size="20" />
								Verbesserungsvorschläge für dein Startup
							</div>
						</Card.Title>
					</Card.Header>
					<Card.Content>
						{#if recommendationLoading}
							<div class="flex items-center justify-center py-8">
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<Loader2 size="16" class="animate-spin" /> Erstelle Handlungsempfehlung...
								</div>
							</div>
						{:else if recommendation}
							<div class="prose prose-sm max-w-none">
								<p class="whitespace-pre-wrap text-sm text-foreground">{recommendation}</p>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">
								Keine Empfehlung verfügbar. Versuche die Seite neu zu laden.
							</p>
						{/if}
						<p class="mt-4 text-center text-xs text-muted-foreground">
							Diese Empfehlung wurde mit KI erstellt. Irrtümer sind möglich.
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
							Hier siehst Du eine detaillierte Aufschlüsselung deiner Antworten nach Kategorien.
							Fragen mit einer Bewertung von 1-2 zeigen Verbesserungspotenzial, während Fragen mit
							einer Bewertung von 3-4 deine Stärken darstellen.
						</p>
						<DetailedAnalysis />
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
	</div>
</div>
