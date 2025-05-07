<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight, Play } from 'lucide-svelte';
	import VentureMeterLogo from '$lib/assets/VentureMeterLogo.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-gradient-to-b from-background to-muted">
	<div class="container mx-auto px-4 py-20">
		<div class="flex flex-col items-center">
			<!-- Options Container -->
			<div class="flex w-full max-w-2xl flex-col gap-6 space-y-6">
				<h1 class="text-center text-3xl font-bold">Wie möchten Sie fortfahren?</h1>

				<!-- Start New Option -->
				<div class="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="mb-2 text-xl font-semibold">Von vorne starten</h2>
							<p class="text-muted-foreground">
								Beginnen Sie einen neuen Fragebogen.
							</p>
						</div>
						<Button size="lg" class="gap-2">
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
								Laden Sie Ihren Speicherstand hoch und setzen Sie Ihren bereits begonnenen Fragebogen fort.
							</p>
						</div>
						<Button size="lg" class="gap-2" variant="outline">
							Fortsetzen
							<ArrowRight size="20" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
