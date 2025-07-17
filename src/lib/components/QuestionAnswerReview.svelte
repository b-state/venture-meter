<script lang="ts">
	import { getStoredData } from '$lib/utils/questionnaire';
	import * as Card from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import { CATEGORY_ORDER } from '$lib/constants';

	interface Question {
		id: number;
		category: string;
		question: string;
		options: string[];
		selectedScore: number | null;
	}

	interface CategoryReview {
		category: string;
		questions: Question[];
	}

	let review: CategoryReview[] = [];

	onMount(() => {
		const storedData = getStoredData();
		if (!storedData) return;

		// Group questions by category
		const categoryMap = new Map<string, Question[]>();

		storedData.questions.forEach((question) => {
			if (!categoryMap.has(question.category)) {
				categoryMap.set(question.category, []);
			}
			categoryMap.get(question.category)!.push(question);
		});

		// Sort by category order and then by question ID
		review = CATEGORY_ORDER.filter((category) => categoryMap.has(category)).map((category) => ({
			category,
			questions: categoryMap.get(category)!.sort((a, b) => a.id - b.id)
		}));
	});

	function getSelectedAnswer(question: Question): string {
		if (
			question.selectedScore === null ||
			question.selectedScore < 1 ||
			question.selectedScore > question.options.length
		) {
			return 'Keine Antwort ausgewählt';
		}
		return question.options[question.selectedScore - 1];
	}

	function getScoreColor(score: number | null): string {
		if (score === null) return 'text-muted-foreground';
		if (score <= 2) return 'text-blue-500';
		return 'text-green-500';
	}

	function getScoreText(score: number | null): string {
		if (score === null) return 'Nicht beantwortet';
		if (score === 1) return 'Stufe 1';
		if (score === 2) return 'Stufe 2';
		if (score === 3) return 'Stufe 3';
		if (score === 4) return 'Stufe 4';
		return 'Unbekannt';
	}
</script>

<div class="space-y-8">
	<div class="text-center">
		<h2 class="mb-2 text-2xl font-bold">Fragen und Antworten Übersicht</h2>
		<p class="text-muted-foreground">
			Hier findest du alle Fragen und deine ausgewählten Antworten im Überblick.
		</p>
	</div>

	{#each review as category}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xl">{category.category}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each category.questions as question, index}
						<div
							class="rounded-lg border p-4 {question.selectedScore === null ? 'bg-muted/30' : ''}"
						>
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1">
									<div class="mb-2 flex items-center gap-2">
										<span class="text-sm font-medium text-muted-foreground">Frage {index + 1}</span>
										{#if question.selectedScore !== null}
											<span
												class="rounded-full bg-muted px-2 py-1 text-xs {getScoreColor(
													question.selectedScore
												)}"
											>
												{getScoreText(question.selectedScore)}
											</span>
										{/if}
									</div>
									<p class="mb-3 text-base font-medium">{question.question}</p>

									{#if question.selectedScore !== null}
										<div class="mb-3">
											<p class="mb-1 text-sm text-muted-foreground">Deine Antwort:</p>
											<p class="rounded bg-muted px-3 py-2 text-sm font-medium text-foreground">
												{getSelectedAnswer(question)}
											</p>
										</div>
									{:else}
										<p class="text-sm italic text-muted-foreground">
											Diese Frage wurde noch nicht beantwortet.
										</p>
									{/if}

									<div class="mt-3">
										<p class="mb-2 text-xs text-muted-foreground">Alle Antwortmöglichkeiten:</p>
										<div class="space-y-1">
											{#each question.options as option, optionIndex}
												<div class="flex items-center gap-2 text-xs">
													<span
														class="flex h-4 w-4 items-center justify-center rounded-full border {question.selectedScore ===
														optionIndex + 1
															? 'border-primary bg-primary text-primary-foreground'
															: 'border-muted-foreground bg-muted'}"
													>
														{#if question.selectedScore === optionIndex + 1}
															✓
														{/if}
													</span>
													<span
														class={question.selectedScore === optionIndex + 1
															? 'font-medium'
															: 'text-muted-foreground'}
													>
														{option}
													</span>
												</div>
											{/each}
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/each}
</div>
