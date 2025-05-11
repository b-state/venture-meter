import { goto } from "$app/navigation";

export async function goToNextQuestion(currentQuestionId: number, totalQuestions: number, allQuestions: Question[]) {
    if (currentQuestionId < totalQuestions) {
        const nextUnanswered = getNextUnansweredQuestion(allQuestions);
        const nextId = nextUnanswered || currentQuestionId + 1;
        goto(`/questionnaire/question/${nextId}`);
    }
}

export function goToPreviousQuestion(currentQuestionId: number) {
    if (currentQuestionId > 1) {
        goto(`/questionnaire/question/${currentQuestionId - 1}`);
    }
}

export function getNextUnansweredQuestion(questions: Question[]): number | null {
    const unansweredQuestion = questions.find(q => q.selectedScore === undefined);
    return unansweredQuestion ? unansweredQuestion.id : null;
} 