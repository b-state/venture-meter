<script>
	import VentureMeterLogo from '$lib/assets/VentureMeterLogo.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, CheckCircle2, ChartColumn, Target, Rocket, Sparkles } from 'lucide-svelte';

	const categories = [
		{
			title: 'Ideen- und Teamfindung',
			description: 'Einordnung deiner Produktidee und Teamkompetenzen'
		},
		{
			title: 'Chanchen Validierung',
			description: 'Überprüfung der Value Proposition, Zielgruppe und der Wirtschaftlichkeit'
		},
		{
			title: 'Marktgerechte Lösungsfindung',
			description: 'Analyse der Marktakzeptanz deiner Lösung'
		},
		{ title: 'Übergang zum Markt-Start', description: 'Vorbereitung auf den Markteintritt' },
		{ title: 'Markteintritt und Wachstum', description: 'Strategien für Wachstum und Skalierung' }
	];
</script>

<div class="min-h-screen bg-gradient-to-b from-background to-muted px-10">
	<!-- Hero Section -->
	<div class="container mx-auto px-4 py-20">
		<div class="flex flex-col items-center text-center">
			<div class="w-80">
				<VentureMeterLogo></VentureMeterLogo>
			</div>
			<p class="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
				Messbarer Erfolg für dein Startup. Unser umfassender Reifegrad-Check hilft Dir, den
				aktuellen Status deines Unternehmens zu bewerten und den Weg zum Erfolg zu planen.
			</p>
			<div class="mt-10 flex items-center gap-x-6">
				<Button size="lg" class="gap-2" href="/questionnaire">
					Jetzt Starten
					<ArrowRight size="20" />
				</Button>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div class="container mx-auto px-4 py-20">
		<div class="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
			<div class="flex flex-col items-center text-center">
				<div class="rounded-full bg-primary/10 p-3">
					<ChartColumn class="h-6 w-6 text-primary" />
				</div>
				<h3 class="mt-4 text-xl font-semibold">Umfassende Analyse</h3>
				<p class="mt-2 text-muted-foreground">
					Fünf Kategorien mit speziellen Fragen decken alle wichtigen Aspekte der
					Startup-Journey ab.
				</p>
			</div>

			<div class="flex flex-col items-center text-center">
				<div class="rounded-full bg-primary/10 p-3">
					<Sparkles class="h-6 w-6 text-primary" />
				</div>
				<h3 class="mt-4 text-xl font-semibold">Individuelle Handlungsempfehlungen</h3>
				<p class="mt-2 text-muted-foreground">
					Unsere KI-basierte Analyse liefert individuelle Handlungsempfehlungen für dein Startup.
				</p>
			</div>
			<div class="flex flex-col items-center text-center">
				<div class="rounded-full bg-primary/10 p-3">
					<Target class="h-6 w-6 text-primary" />
				</div>
				<h3 class="mt-4 text-xl font-semibold">Präzise Bewertung</h3>
				<p class="mt-2 text-muted-foreground">
					Erhalte detaillierte Einblicke in deine Stärken und Verbesserungspotenziale.
				</p>
			</div>
		</div>
	</div>

	<!-- Categories Preview -->
	<div class="container mx-auto px-4 py-20">
		<h2 class="mb-12 text-center text-3xl font-bold">Die Bewertungskategorien</h2>
		<div class="flex flex-wrap gap-6 justify-center">
			{#each categories as category}
				<div class="rounded-lg border bg-card p-6 shadow-sm">
					<h3 class="mb-2 text-xl font-semibold">{category.title}</h3>
					<p class="text-muted-foreground">{category.description}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- CTA Section -->
	<div class="container mx-auto px-4 py-20">
		<div class="rounded-2xl bg-primary/5 p-8 text-center">
			<h2 class="mb-4 text-3xl font-bold">Bereit für den nächsten Schritt?</h2>
			<p class="mx-auto mb-8 max-w-2xl text-muted-foreground">
				Starte jetzt mit der Bewertung deines Startups und erhalte wertvolle Einblicke für deine
				weitere Entwicklung.
			</p>
			<Button size="lg" class="gap-2" href="/questionnaire">
				Jetzt Starten
				<ArrowRight size="20" />
			</Button>
		</div>
	</div>
</div>
