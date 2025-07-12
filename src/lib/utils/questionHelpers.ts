import { goto } from "$app/navigation";
import { CATEGORY_ORDER } from "$lib/constants";
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

export function isCategoryUnlocked(category: string): boolean {
    if (!isBrowser) return false;

    try {
        const stored = getStoredData();
        if (!stored) return false;

        const categoryQuestions = stored.questions.filter(q => q.category === category);
        const answeredQuestions = categoryQuestions.filter(q => q.selectedScore !== null);
        const hasHighScore = categoryQuestions.some(q => q.selectedScore === 3 || q.selectedScore === 4);

        // Category is unlocked if all questions are answered and at least one has a high score (3 or 4)
        return answeredQuestions.length === categoryQuestions.length && hasHighScore;
    } catch (error) {
        console.error('Error checking if category is unlocked:', error);
        return false;
    }
}

export function getNextAvailableQuestion(currentQuestionId: number): number | null {
    if (!isBrowser) return null;

    try {
        const stored = getStoredData();
        if (!stored) return null;

        const currentQuestion = stored.questions.find(q => q.id === currentQuestionId);
        if (!currentQuestion) return null;

        const currentCategory = currentQuestion.category;
        
        // If current category is not unlocked, stay in this category
        if (!isCategoryUnlocked(currentCategory)) {
            // Find next unanswered question in current category
            const categoryQuestions = stored.questions.filter(q => q.category === currentCategory);
            const nextUnanswered = categoryQuestions.find(q => q.selectedScore === null);
            return nextUnanswered ? nextUnanswered.id : null;
        }

        // If current category is unlocked, find next category
        const currentCategoryIndex = CATEGORY_ORDER.indexOf(currentCategory);
        
        // Look for next category that needs completion
        for (let i = currentCategoryIndex + 1; i < CATEGORY_ORDER.length; i++) {
            const nextCategory = CATEGORY_ORDER[i];
            if (!isCategoryUnlocked(nextCategory)) {
                // Find first unanswered question in next category
                const nextCategoryQuestions = stored.questions.filter(q => q.category === nextCategory);
                const firstUnanswered = nextCategoryQuestions.find(q => q.selectedScore === null);
                return firstUnanswered ? firstUnanswered.id : null;
            }
        }

        // If all categories are unlocked, return null (go to results)
        return null;
    } catch (error) {
        console.error('Error getting next available question:', error);
        return null;
    }
}