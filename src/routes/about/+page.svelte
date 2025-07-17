<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div
	class="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-b from-background to-muted px-6 py-20"
>
	<div class="max-w-2xl rounded-xl bg-card p-10 shadow-lg ring-1 ring-muted">
		<h1 class="mb-4 text-3xl font-bold text-primary">Über VentureMeter</h1>
		<p class="mb-4 text-lg text-muted-foreground">
			VentureMeter ist ein moderner Reifegrad-Check für Startups und Gründer. Unser Ziel ist
			es, Dir eine klare, strukturierte Einschätzung über den aktuellen Stand deines Unternehmens zu
			geben und Dir individuelle Empfehlungen für die nächsten Schritte zu liefern.
		</p>
		<ul class="mb-6 list-disc pl-6 text-muted-foreground">
			<li>Umfassende Analyse in fünf Kategorien</li>
			<li>Individuelle Handlungsempfehlungen durch KI</li>
			<li>Intuitive Bedienung & ansprechendes Design</li>
			<li>Deine Daten bleiben privat – kein Account nötig</li>
		</ul>
		<p class="mb-2 text-sm text-muted-foreground">
			Entwickelt mit ❤️ für Gründer, Teams und alle, die ihr Startup gezielt weiterentwickeln
			möchten.
		</p>
		<p class="mt-4 text-xs italic text-muted-foreground/70">
			Dieses Projekt ist im Rahmen der Masterarbeit von Philipp Benner entstanden.
		</p>
	</div>
</div>
