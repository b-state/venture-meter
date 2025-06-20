import { STORAGE_KEY } from "$lib/constants";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export async function loadQuestionsFromCSV(fetch: fetch): Promise<Question[]> {
    try {
        const response = await fetch('/questionnaire.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const questions: Question[] = [];
        const usedIds = new Set<number>();

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const [questionId, category, question, ...options] = line.split(';');
            const id = parseInt(questionId);

            // Validate question structure
            if (isNaN(id)) {
                console.error(`Invalid question ID at line ${i + 1}: ${questionId}`);
                continue;
            }
            if (usedIds.has(id)) {
                console.error(`Duplicate question ID at line ${i + 1}: ${id}`);
                continue;
            }
            if (!question?.trim()) {
                console.error(`Missing question text at line ${i + 1}`);
                continue;
            }
            if (options.length < 5) {
                console.error(`Question ${id} has only ${options.length} answers, expected 5`);
                continue;
            }

            usedIds.add(id);
            questions.push({
                id,
                category,
                question,
                options: options.slice(0, 5),
                followUpId: options[5] || null,
                selectedScore: null
            });
        }

        if (questions.length === 0) {
            throw new Error('No valid questions found in CSV');
        }

        return questions;
    } catch (error) {
        console.error('Error loading questions from CSV:', error);
        return [];
    }
}

export function getStoredData(): { questions: Question[], version: string, startupInfo?: StartupInfo } | null {
    if (!isBrowser) return null;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

function storeData(questions: Question[], version: string, startupInfo?: StartupInfo): void {
    if (!isBrowser) return;
    const data: { questions: Question[], version: string, startupInfo?: StartupInfo } = { questions, version };
    if (startupInfo) {
        data.startupInfo = startupInfo;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

export async function saveProgress(questionId: number, score: number): Promise<void> {
    if (!isBrowser) return;

    const stored = getStoredData();
    if (!stored) return;

    const questions = stored.questions;
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.selectedScore = score;
        storeData(questions, stored.version, stored.startupInfo);
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
            storeData(parsed.questions, parsed.version, parsed.startupInfo);
        }
    } catch (error) {
        console.error('Error importing progress:', error);
    }
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

    storeData(newQuestions, '1.1', stored.startupInfo); // Increment version number
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
        if (question.selectedScore) {
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

export function getStartupInfo(): StartupInfo | null {
    if (!isBrowser) return null;
    
    const stored = getStoredData();
    return stored?.startupInfo || null;
}

