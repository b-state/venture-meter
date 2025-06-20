<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowRight, ArrowLeft } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { STORAGE_KEY } from '$lib/constants';

	let industry = '';
	let technology = '';
	let targetCustomers = '';
	let customIndustry = '';

	const industries = [
		'Gesundheit',
		'Tourismus',
		'Logistik',
		'Informationstechnologie',
		'Produktion',
		'Automobil',
		'Finanzen',
		'Energie',
		'Lebensmittel',
		'Medizin & Chemie',
		'Immobilien',
		'Sonstiges (selbst definieren)'
	];

	const technologies = [
		'Digitales Produkt (App, Software, Plattform)',
		'Physisches Produkt',
		'Hybrid (Digital + Physisch)',
		'Dienstleistungen'
	];

	const customers = [
		'Private Kunden (B2C)',
		'Geschäftskunden (B2B)',
		'Beide (B2B2C)',
		'Regierung/Öffentlicher Sektor'
	];

	const handleContinue = () => {
		const finalIndustry = industry === 'Sonstiges (selbst definieren)' ? customIndustry : industry;
		
		if (finalIndustry && technology && targetCustomers) {
			// Store startup info along with existing data
			const existingData = localStorage.getItem(STORAGE_KEY);
			let data = existingData ? JSON.parse(existingData) : { questions: [], version: '1.0' };
			
			// Add startup info to the data
			data.startupInfo = {
				industry: finalIndustry,
				technology,
				targetCustomers
			};
			
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			goto('/questionnaire/question/1');
		}
	};

	const handleBack = () => {
		goto('/questionnaire');
	};
</script>

<div class="min-h-screen bg-gradient-to-b from-background to-muted p-6">
	<div class="mx-auto max-w-2xl">
		<!-- Header -->
		<div class="mb-8 flex items-center justify-between">
			<Button variant="ghost" onclick={handleBack} class="gap-2">
				<ArrowLeft size="20" />
				Zurück
			</Button>
		</div>

		<!-- Main Content -->
		<Card.Root class="mb-8">
			<Card.Header>
				<Card.Title>Über dein Startup</Card.Title>
				<Card.Description>
					Erzähle uns kurz etwas über dein Startup, damit wir dir passendere Empfehlungen geben können.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<!-- Industry -->
				<div class="space-y-3">
					<label class="text-sm font-medium">In welcher Branche arbeitet dein Startup?</label>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{#each industries as industryOption}
							<Button
								variant={industry === industryOption ? 'default' : 'outline'}
								class="justify-start text-left"
								onclick={() => (industry = industryOption)}
							>
								{industryOption}
							</Button>
						{/each}
					</div>
					
					{#if industry === 'Sonstiges (selbst definieren)'}
						<div class="space-y-2">
							<label class="text-sm font-medium">Bitte definiere deine Branche:</label>
							<input
								type="text"
								bind:value={customIndustry}
								placeholder="z.B. Gaming, Fashion, etc."
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							/>
						</div>
					{/if}
				</div>

				<!-- Technology -->
				<div class="space-y-3">
					<label class="text-sm font-medium">Welche Art von Technologie/Produkt entwickelt ihr?</label>
					<div class="grid grid-cols-1 gap-3">
						{#each technologies as techOption}
							<Button
								variant={technology === techOption ? 'default' : 'outline'}
								class="justify-start text-left"
								onclick={() => (technology = techOption)}
							>
								{techOption}
							</Button>
						{/each}
					</div>
				</div>

				<!-- Target Customers -->
				<div class="space-y-3">
					<label class="text-sm font-medium">Für wen richtet sich dein Produkt?</label>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{#each customers as customerOption}
							<Button
								variant={targetCustomers === customerOption ? 'default' : 'outline'}
								class="justify-start text-left"
								onclick={() => (targetCustomers = customerOption)}
							>
								{customerOption}
							</Button>
						{/each}
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Navigation -->
		<div class="flex justify-end">
			<Button
				size="lg"
				class="gap-2"
				disabled={!industry || !technology || !targetCustomers || (industry === 'Sonstiges (selbst definieren)' && !customIndustry)}
				onclick={handleContinue}
			>
				Zum Fragebogen
				<ArrowRight size="20" />
			</Button>
		</div>
	</div>
</div> 