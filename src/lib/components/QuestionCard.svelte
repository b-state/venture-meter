<script lang="ts">
	// let { question, answer } = $props();
	import { Button } from '$lib/components/ui/button';
</script>

<div class="flex w-full flex-col gap-2">
	<h2 class="rounded bg-muted py-4 mb-4 px-4 text-2xl font-bold ring-1 ring-muted">
		Wie wählen und nutzen Sie Ihre Kommunikations- und Vertriebskanäle?
	</h2>
	<Button variant="outline" class="justify-start pl-10 text-lg hover:bg-muted"
		>Wir nutzen Kanäle, die sich spontan ergeben oder leicht erreichbar sind.</Button
	>
	<Button variant="outline" class="justify-start pl-10 text-lg hover:bg-muted">
		Wir haben erste Vorstellungen davon, welche Kanäle für uns funktionieren könnten.
	</Button>
	<Button variant="outline" class="justify-start pl-10 text-lg hover:bg-muted">
		Wir setzen gezielt bestimmte Kanäle ein, die wir für unsere Zielgruppe geeignet halten.
	</Button>
	<Button variant="outline" class="justify-start pl-10 text-lg hover:bg-muted">
		Wir beobachten regelmäßig, wie gut die Kanäle funktionieren, und optimieren bei Bedarf.
	</Button>
	<Button variant="outline" class="justify-start pl-10 text-lg hover:bg-muted">
		Wir testen gezielt neue Kanäle und entwickeln unsere Strategie laufend weiter.
	</Button>
</div>
