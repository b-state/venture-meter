interface Question {
    id: number;
    category: string;
    question: string;
    options: string[];
    followUpId: string | null;
    selectedScore?: number;
}