<script lang="ts">
    import QuestionCard from '$lib/components/QuestionCard.svelte';
    import { Progress } from '$lib/components/ui/progress';
    import { Button } from '$lib/components/ui/button';
    import { page } from '$app/state';
    import { CircleCheckBig } from 'lucide-svelte';
	import { goToNextQuestion, goToPreviousQuestion } from '$lib/utils/questionHelpers.js';

    let { data } = $props();
    let currentQuestion = $derived(data.question);
    $inspect(currentQuestion);
    let totalQuestions = $derived(data.totalQuestions);
    let currentId = $derived(parseInt(page.params.id));
    let progress = $derived((currentId / totalQuestions) * 100);
    let allQuestions = $derived(data.allQuestions);

    const categories = [
        { title: 'Vision Opportunity Check', questionCount: 15 },
        { title: 'Viability-Analysis', questionCount: 15 },
        { title: 'Solution-Market-Fit', questionCount: 15 },
        { title: 'Transition to Launch', questionCount: 15 },
        { title: 'Launch and Scale-Up', questionCount: 15 }
    ];
</script>

<div class="flex">
    <aside class="flex min-h-[calc(100vh-64px)] w-1/4 flex-col justify-start ring-1 ring-muted">
        {#each categories as category, i}
            <div
                class="py-5 flex h-28 flex-col justify-center gap-2 px-5 ring-1 ring-muted transition hover:bg-muted"
            >
                <a class="text-xl font-bold" href="/">{category.title}</a>
                <div class="flex items-center gap-1 text-muted-foreground">
                    <p class="text-sm">1 von {category.questionCount} Fragen</p>
                    {#if i === 0}
                        <CircleCheckBig size="18" color="#32CD32" />
                    {/if}
                </div>
            </div>
        {/each}
    </aside>
    <main class="my-10 flex w-screen flex-col items-center justify-center px-40">
        <div class="flex h-full w-full flex-col justify-center max-w-4xl">
            {#if currentQuestion}
                <QuestionCard
                    question={currentQuestion.question}
                    options={currentQuestion.options}
                    questionId={currentQuestion.id}
                    selectedScore={currentQuestion.selectedScore}
                />
            {:else}
                <p>Frage nicht gefunden</p>
            {/if}
        </div>
        <div class="mt-auto flex w-full flex-col gap-2">
            <div class="w-full">
                <p>Fortschritt</p>
                <Progress value={progress} class="h-2" />
            </div>
            <div class="flex justify-between">
                {#if currentId > 1}
                    <Button variant="outline" onclick={() => goToPreviousQuestion(currentId)}>
                        Zurück
                    </Button>
                {/if}
                <Button variant="outline" onclick={() => goToNextQuestion(currentId, totalQuestions, allQuestions)} disabled={currentId >= totalQuestions} class="ml-auto">
                    Weiter
                </Button>
            </div>
        </div>
    </main>
</div> 