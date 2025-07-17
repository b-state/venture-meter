<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Info, Lightbulb, CheckCircle, Sparkles } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	function handleContinue() {
		goto('/questionnaire/startup-info');
	}
</script>

<div class="flex min-h-[calc(100vh-64px)] justify-center bg-gradient-to-b from-background to-muted">
	<div class="flex w-screen max-w-3xl flex-col justify-center gap-8">
		<div class="rounded-lg border bg-card p-8 shadow-md">
			<h1 class="mb-4 text-center text-2xl font-bold">Hinweise zum Fragebogen</h1>
			<p class="mb-8 text-muted-foreground">
				Mit dem Ausfüllen dieses Fragebogens bekommst du ein Gefühl dafür, wo du in deiner
				Startup-Journey stehst. Es ist völlig in Ordnung, wenn du nicht überall die höchste
				Antwortstufe auswählen kannst. Viel wichtiger ist, dass du ihn immer wieder machst, um
				deinen Fortschritt zu sehen. Sieh den Fragebogen als deinen Orientierungshilfe und deine
				Begleiter.
			</p>
			<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="flex flex-col items-center rounded-lg bg-muted p-4">
					<Info size="32" class="mb-2 text-primary" />
					<span class="mb-1 font-semibold">Ehrlichkeit</span>
					<span class="text-center text-sm text-muted-foreground"
						>Beantworte die Fragen so ehrlich wie möglich, um ein realistisches Bild zu erhalten.
						Coaches und Investoren werden es Dir danken.</span
					>
				</div>
				<div class="flex flex-col items-center rounded-lg bg-muted p-4">
					<Sparkles size="32" class="mb-2 text-primary" />
					<span class="mb-1 font-semibold">Spickzettel</span>
					<span class="text-center text-sm text-muted-foreground"
						>Nutze die Spickzettelfunktion, um Hilfestellungen zu den Fragen zu bekommen und dich
						selbst besser einschätzen zu können.</span
					>
				</div>
				<div class="flex flex-col items-center rounded-lg bg-muted p-4">
					<CheckCircle size="32" class="mb-2 text-primary" />
					<span class="mb-1 font-semibold">Vollständigkeit</span>
					<span class="text-center text-sm text-muted-foreground"
						>Schau Dir die Auswertung am Ende an, sie gibt Dir individuelle Verbesserungsvorschläge
						und zeigt Dir deine Stärken und Schwächen.</span
					>
				</div>
			</div>
			<div class="flex justify-center">
				<Button size="lg" onclick={handleContinue}>Weiter zum Fragebogen</Button>
			</div>
		</div>
	</div>
</div>
