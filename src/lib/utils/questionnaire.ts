import { STORAGE_KEY } from "$lib/constants";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

async function loadQuestionsFromCSV(fetch: fetch): Promise<Question[]> {
    try {
        const response = await fetch('/questionnaire.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const questions: Question[] = [];

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const [questionId, category, question, ...options] = line.split(';');
            questions.push({
                id: parseInt(questionId),
                category,
                question,
                options: options.slice(0, 5),
                followUpId: options[5] || null
            });
        }
        return questions;
    } catch (error) {
        console.error('Error loading questions from CSV:', error);
        return [];
    }
}

function getStoredData(): { questions: Question[], version: string } | null {
    if (!isBrowser) return null;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

function storeData(questions: Question[], version: string): void {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ questions, version }));
}

export async function initializeQuestionnaire(): Promise<void> {
    if (!isBrowser) return;

    const stored = getStoredData();
    if (!stored) {
        // First time load - get from CSV and store
        const questions = await loadQuestionsFromCSV(fetch);
        storeData(questions, '1.0');
    }
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

export async function saveProgress(questionId: number, score: number): Promise<void> {
    if (!isBrowser) return;

    const stored = getStoredData();
    if (!stored) return;

    const questions = stored.questions;
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.selectedScore = score;
        storeData(questions, stored.version);
    }
}

export function exportProgress(): string {
    if (!isBrowser) return '{}';

    const stored = getStoredData();
    if (!stored) return '{}';
    return JSON.stringify(stored);
}

export function importProgress(data: string): void {
    if (!isBrowser) return;

    try {
        const parsed = JSON.parse(data);
        if (parsed.questions && parsed.version) {
            storeData(parsed.questions, parsed.version);
        }
    } catch (error) {
        console.error('Error importing progress:', error);
    }
}

export function getNextUnansweredQuestion(): number | null {
    if (!isBrowser) return null;

    const stored = getStoredData();
    if (!stored) return null;

    const unansweredQuestion = stored.questions.find(q => q.selectedScore === undefined);
    return unansweredQuestion ? unansweredQuestion.id : null;
}

export async function updateQuestionnaire(): Promise<void> {
    if (!isBrowser) return;

    const stored = getStoredData();
    if (!stored) {
        await initializeQuestionnaire();
        return;
    }

    const newQuestions = await loadQuestionsFromCSV(fetch);
    const oldQuestions = stored.questions;

    // Preserve scores for questions that still exist
    newQuestions.forEach(newQ => {
        const oldQ = oldQuestions.find(q => q.id === newQ.id);
        if (oldQ) {
            newQ.selectedScore = oldQ.selectedScore;
        }
    });

    storeData(newQuestions, '1.1'); // Increment version number
}

export async function getCategoryStats(): Promise<CategoryStats[]> {
    if (!isBrowser) {
        const questions = await loadQuestionsFromCSV(fetch);
        return calculateCategoryStats(questions);
    }

    const stored = getStoredData();
    if (!stored) {
        await initializeQuestionnaire();
        return getCategoryStats();
    }
    return calculateCategoryStats(stored.questions);
}

function calculateCategoryStats(questions: Question[]): CategoryStats[] {
    const categoryMap = new Map<string, { total: number; answered: number }>();

    questions.forEach(question => {
        const current = categoryMap.get(question.category) || { total: 0, answered: 0 };
        current.total += 1;
        if (question.selectedScore !== undefined) {
            current.answered += 1;
        }
        categoryMap.set(question.category, current);
    });

    return Array.from(categoryMap.entries()).map(([title, stats]) => ({
        title,
        questionCount: stats.total,
        answeredCount: stats.answered
    }));
}

