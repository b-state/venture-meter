import { writable } from 'svelte/store';

export const scores = writable<Record<number, number>>({});

export function updateScore(questionId: number, score: number) {
    scores.update(current => ({
        ...current,
        [questionId]: score
    }));
}

export function getTotalScore() {
    let total = 0;
    scores.subscribe(current => {
        total = Object.values(current).reduce((sum, score) => sum + score, 0);
    })();
    return total;
} 