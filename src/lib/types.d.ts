interface fetch {
    (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    (input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>;
}

interface Question {
    id: number;
    category: string;
    question: string;
    options: string[];
    selectedScore: number | null;
}

interface CategoryStats {
    title: string;
    questionCount: number;
    answeredCount: number;
}

interface StartupInfo {
    industry: string;
    productCategory: string;
    targetCustomers: string;
}