import { goto } from "$app/navigation";
import { getStoredData, initializeQuestionnaire, loadQuestionsFromCSV } from "./questionnaire";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';
export async function goToNextQuestion(currentQuestionId: number, totalQuestions: number, allQuestions: Question[]) {
    if (currentQuestionId < totalQuestions) {
        const nextUnanswered = getNextUnansweredQuestion();
        const nextId = nextUnanswered || currentQuestionId + 1;
        goto(`/questionnaire/question/${nextId}`);
    }
}

export function goToPreviousQuestion(currentQuestionId: number) {
    if (currentQuestionId > 1) {
        goto(`/questionnaire/question/${currentQuestionId - 1}`);
    }
}

export function getNextUnansweredQuestion(): number | null {
    if (!isBrowser) return null;

    const stored = getStoredData();
    if (!stored) return null;

    const unansweredQuestion = stored.questions.find(q => q.selectedScore === undefined);
    return unansweredQuestion ? unansweredQuestion.id : null;
}

export async function getQuestion(fetch: fetch, id: number): Promise<Question | null> {
    if (!isBrowser) {
        // On server, just load from CSV without storing
        const questions = await loadQuestionsFromCSV(fetch);
        return questions.find(q => q.id === id) || null;
    }

    const stored = getStoredData();
    if (!stored) {
        await initializeQuestionnaire();
        return getQuestion(fetch, id);
    }
    return stored.questions.find(q => q.id === id) || null;
}

export async function getTotalQuestions(fetch: fetch): Promise<number> {
    if (!isBrowser) {
        const questions = await loadQuestionsFromCSV(fetch);
        return questions.length;
    }

    const stored = getStoredData();
    if (!stored) {
        await initializeQuestionnaire();
        return getTotalQuestions(fetch);
    }
    return stored.questions.length;
}

export async function getAllQuestions(fetch: fetch): Promise<Question[]> {
    if (!isBrowser) {
        return loadQuestionsFromCSV(fetch);
    }

    const stored = getStoredData();
    if (!stored) {
        await initializeQuestionnaire();
        return getAllQuestions(fetch);
    }
    return stored.questions;
}