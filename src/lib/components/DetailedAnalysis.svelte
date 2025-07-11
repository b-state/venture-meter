<script lang="ts">
    import { getStoredData } from '$lib/utils/questionnaire';
    import * as Card from '$lib/components/ui/card';
    import { onMount } from 'svelte';

    interface Question {
        id: number;
        category: string;
        question: string;
        selectedScore: number | null;
    }

    interface CategoryAnalysis {
        category: string;
        lowScores: Question[];
        highScores: Question[];
    }

    let analysis: CategoryAnalysis[] = [];

    onMount(() => {
        const storedData = getStoredData();
        if (!storedData) return;

        // Group questions by category and score range
        const categoryMap = new Map<string, CategoryAnalysis>();
        
        storedData.questions.forEach(question => {
            if (question.selectedScore === null) return;
            
            let categoryAnalysis = categoryMap.get(question.category);
            if (!categoryAnalysis) {
                categoryAnalysis = {
                    category: question.category,
                    lowScores: [],
                    highScores: []
                };
                categoryMap.set(question.category, categoryAnalysis);
            }

            if (question.selectedScore <= 3) {
                categoryAnalysis.lowScores.push(question);
            } else {
                categoryAnalysis.highScores.push(question);
            }
        });

        analysis = Array.from(categoryMap.values());
    });
</script>

<div class="space-y-6">
    {#each analysis as category}
        <Card.Root>
            <Card.Header>
                <Card.Title>{category.category}</Card.Title>
            </Card.Header>
            <Card.Content>
                <div class="grid gap-6 md:grid-cols-2">
                    <!-- Low Scores (1-3) -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-blue-500">Verbesserungspotenzial (Stufen 1 & 2)</h3>
                        {#if category.lowScores.length === 0}
                            <p class="text-sm text-muted-foreground">Keine Fragen in diesem Bereich</p>
                        {:else}
                            <ul class="space-y-2">
                                {#each category.lowScores as question}
                                    <li class="rounded-lg border p-3">
                                        <p class="text-sm">{question.question}</p>
                                        <p class="mt-1 text-xs text-muted-foreground">Bewertung: {question.selectedScore}/4</p>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </div>

                    <!-- High Scores (4) -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-green-500">Stärken (Stufen 3 & 4)</h3>
                        {#if category.highScores.length === 0}
                            <p class="text-sm text-muted-foreground">Keine Fragen in diesem Bereich</p>
                        {:else}
                            <ul class="space-y-2">
                                {#each category.highScores as question}
                                    <li class="rounded-lg border p-3">
                                        <p class="text-sm">{question.question}</p>
                                        <p class="mt-1 text-xs text-muted-foreground">Bewertung: {question.selectedScore}/4</p>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    {/each}
</div> 