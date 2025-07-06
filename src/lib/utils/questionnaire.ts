import { STORAGE_KEY } from "$lib/constants";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export async function loadQuestionsFromCSV(fetch: fetch): Promise<Question[]> {
    try {
        const response = await fetch('/questionnaire.csv');
        if (!response.ok) {
            throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.text();
        
        if (!csvText.trim()) {
            throw new Error('CSV file is empty');
        }
        
        const lines = csvText.split('\n');
        const questions: Question[] = [];
        const usedIds = new Set<number>();

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const [questionId, category, question, helpText, ...options] = line.split(';');
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
                helpText,
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
        throw error; // Re-throw to allow calling code to handle
    }
}

export function getStoredData(): { questions: Question[], version: string, startupInfo?: StartupInfo } | null {
    if (!isBrowser) return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        
        const parsed = JSON.parse(stored);
        
        // Validate stored data structure
        if (!parsed.questions || !Array.isArray(parsed.questions) || !parsed.version) {
            console.warn('Invalid stored data structure, clearing corrupted data');
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        
        return parsed;
    } catch (error) {
        console.error('Error parsing stored data:', error);
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

export function storeData(questions: Question[], version: string, startupInfo?: StartupInfo): void {
    if (!isBrowser) return;
    
    if (!questions || !Array.isArray(questions)) {
        throw new Error('Invalid questions data');
    }
    
    if (!version || typeof version !== 'string') {
        throw new Error('Invalid version data');
    }
    
    const data: { questions: Question[], version: string, startupInfo?: StartupInfo } = { questions, version };
    if (startupInfo) {
        data.startupInfo = startupInfo;
    }
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error storing data:', error);
        throw error;
    }
}

export async function saveProgress(questionId: number, score: number): Promise<void> {
    if (!isBrowser) return;
    
    if (typeof questionId !== 'number' || questionId <= 0) {
        throw new Error('Invalid question ID');
    }
    
    if (typeof score !== 'number' || score < 1 || score > 5) {
        throw new Error('Invalid score value');
    }

    const stored = getStoredData();
    if (!stored) {
        throw new Error('No questionnaire data found');
    }

    const questions = stored.questions;
    const question = questions.find(q => q.id === questionId);
    if (!question) {
        throw new Error(`Question with ID ${questionId} not found`);
    }
    
    question.selectedScore = score;
    storeData(questions, stored.version, stored.startupInfo);
}

export function exportProgress(): string {
    if (!isBrowser) return '{}';

    const stored = getStoredData();
    if (!stored) return '{}';
    
    try {
        return JSON.stringify(stored);
    } catch (error) {
        console.error('Error exporting progress:', error);
        return '{}';
    }
}

export function importProgress(data: string): void {
    if (!isBrowser) return;

    if (!data || typeof data !== 'string') {
        throw new Error('Invalid import data');
    }

    try {
        const parsed = JSON.parse(data);
        if (!parsed.questions || !Array.isArray(parsed.questions) || !parsed.version) {
            throw new Error('Invalid import data structure');
        }
        
        storeData(parsed.questions, parsed.version, parsed.startupInfo);
    } catch (error) {
        console.error('Error importing progress:', error);
        throw error;
    }
}

export async function updateQuestionnaire(): Promise<void> {
    if (!isBrowser) return;

    const stored = getStoredData();
    const newQuestions = await loadQuestionsFromCSV(fetch);
    
    if (!stored) {
        // First time initialization - store questions with default version
        storeData(newQuestions, '1.0');
        return;
    }

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
        // If no stored data, return empty stats
        return [];
    }
    return calculateCategoryStats(stored.questions);
}

function calculateCategoryStats(questions: Question[]): CategoryStats[] {
    const categoryMap = new Map<string, { total: number; answered: number }>();

    questions.forEach(question => {
        const current = categoryMap.get(question.category) || { total: 0, answered: 0 };
        current.total += 1;
        if (question.selectedScore !== null && question.selectedScore !== undefined) {
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

