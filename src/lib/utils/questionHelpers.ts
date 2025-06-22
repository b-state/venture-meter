import { goto } from "$app/navigation";
import { getStoredData, loadQuestionsFromCSV, storeData } from "./questionnaire";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Helper function to ensure questions are loaded and stored in browser environment
 */
async function ensureQuestionsLoaded(fetch: fetch): Promise<Question[]> {
    try {
        if (!isBrowser) {
            return await loadQuestionsFromCSV(fetch);
        }

        const stored = getStoredData();
        if (stored?.questions && stored.questions.length > 0) {
            return stored.questions;
        }

        // Initialize questionnaire by loading from CSV and storing
        const questions = await loadQuestionsFromCSV(fetch);
        storeData(questions, '1.0', stored?.startupInfo);
        return questions;
    } catch (error) {
        console.error('Error ensuring questions are loaded:', error);
        throw error;
    }
}

export async function goToNextQuestion(currentQuestionId: number, totalQuestions: number) {
    if (typeof currentQuestionId !== 'number' || currentQuestionId <= 0) {
        throw new Error('Invalid current question ID');
    }
    
    if (typeof totalQuestions !== 'number' || totalQuestions <= 0) {
        throw new Error('Invalid total questions count');
    }
    
    if (currentQuestionId < totalQuestions) {
        const nextUnanswered = getNextUnansweredQuestion();
        const nextId = nextUnanswered || currentQuestionId + 1;
        goto(`/questionnaire/question/${nextId}`);
    }
}

export function goToPreviousQuestion(currentQuestionId: number) {
    if (typeof currentQuestionId !== 'number' || currentQuestionId <= 0) {
        throw new Error('Invalid current question ID');
    }
    
    if (currentQuestionId > 1) {
        goto(`/questionnaire/question/${currentQuestionId - 1}`);
    }
}

export function getNextUnansweredQuestion(): number | null {
    if (!isBrowser) return null;

    try {
        const stored = getStoredData();
        if (!stored) return null;

        const unansweredQuestion = stored.questions.find(q => q.selectedScore === null || q.selectedScore === undefined);
        return unansweredQuestion ? unansweredQuestion.id : null;
    } catch (error) {
        console.error('Error getting next unanswered question:', error);
        return null;
    }
}

export async function getQuestion(fetch: fetch, id: number): Promise<Question | null> {
    if (typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid question ID');
    }
    
    try {
        const questions = await ensureQuestionsLoaded(fetch);
        return questions.find(q => q.id === id) || null;
    } catch (error) {
        console.error(`Error getting question ${id}:`, error);
        throw error;
    }
}

export async function getTotalQuestions(fetch: fetch): Promise<number> {
    try {
        const questions = await ensureQuestionsLoaded(fetch);
        return questions.length;
    } catch (error) {
        console.error('Error getting total questions:', error);
        throw error;
    }
}

export async function getAllQuestions(fetch: fetch): Promise<Question[]> {
    try {
        return await ensureQuestionsLoaded(fetch);
    } catch (error) {
        console.error('Error getting all questions:', error);
        throw error;
    }
}