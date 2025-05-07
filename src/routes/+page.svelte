<script>
	import VentureMeterLogo from '$lib/assets/VentureMeterLogo.svelte';
import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight, CheckCircle2, ChartColumn, Target, Rocket } from 'lucide-svelte';
</script>

<div class="min-h-screen bg-gradient-to-b from-background to-muted">
	<!-- Hero Section -->
	<div class="container mx-auto px-4 py-20">
		<div class="flex flex-col items-center text-center">
			<div class="w-80">
				<VentureMeterLogo></VentureMeterLogo>
			</div>
			<p class="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
				Messbarer Erfolg für Ihr Startup. Unser umfassender Reifegrad-Check hilft Ihnen, 
				den aktuellen Status Ihres Unternehmens zu bewerten und den Weg zum Erfolg zu planen.
			</p>
			<div class="mt-10 flex items-center gap-x-6">
				<a href="/questionnaire">
					<Button size="lg" class="gap-2">
						Jetzt Starten
						<ArrowRight size="20" />
					</Button>
				</a>
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
					Fünf Kategorien mit je 15 Fragen decken alle wichtigen Aspekte Ihres Startups ab.
				</p>
			</div>
			<div class="flex flex-col items-center text-center">
				<div class="rounded-full bg-primary/10 p-3">
					<Target class="h-6 w-6 text-primary" />
				</div>
				<h3 class="mt-4 text-xl font-semibold">Präzise Bewertung</h3>
				<p class="mt-2 text-muted-foreground">
					Erhalten Sie detaillierte Einblicke in Ihre Stärken und Verbesserungspotenziale.
				</p>
			</div>
			<div class="flex flex-col items-center text-center">
				<div class="rounded-full bg-primary/10 p-3">
					<Rocket class="h-6 w-6 text-primary" />
				</div>
				<h3 class="mt-4 text-xl font-semibold">Wachstumsplanung</h3>
				<p class="mt-2 text-muted-foreground">
					Entwickeln Sie eine klare Roadmap für die nächsten Schritte Ihres Unternehmens.
				</p>
			</div>
		</div>
	</div>

	<!-- Categories Preview -->
	<div class="container mx-auto px-4 py-20">
		<h2 class="text-3xl font-bold text-center mb-12">Unsere Bewertungskategorien</h2>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each [
				{ title: 'Vision & Opportunity Check', description: 'Bewertung Ihrer Geschäftsidee und Marktchancen' },
				{ title: 'Viability-Analysis', description: 'Analyse der wirtschaftlichen Tragfähigkeit' },
				{ title: 'Solution-Market-Fit', description: 'Überprüfung der Marktakzeptanz Ihrer Lösung' },
				{ title: 'Transition to Launch', description: 'Vorbereitung auf den Markteintritt' },
				{ title: 'Launch and Scale-Up', description: 'Strategien für Wachstum und Skalierung' }
			] as category}
				<div class="rounded-lg border bg-card p-6 shadow-sm">
					<h3 class="text-xl font-semibold mb-2">{category.title}</h3>
					<p class="text-muted-foreground">{category.description}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- CTA Section -->
	<div class="container mx-auto px-4 py-20">
		<div class="rounded-2xl bg-primary/5 p-8 text-center">
			<h2 class="text-3xl font-bold mb-4">Bereit für den nächsten Schritt?</h2>
			<p class="text-muted-foreground mb-8 max-w-2xl mx-auto">
				Starten Sie jetzt mit der Bewertung Ihres Startups und erhalten Sie wertvolle Einblicke für Ihre weitere Entwicklung.
			</p>
			<a href="/questionnaire">
				<Button size="lg" class="gap-2">
					Jetzt Starten
					<ArrowRight size="20" />
				</Button>
			</a>
		</div>
	</div>
</div>
