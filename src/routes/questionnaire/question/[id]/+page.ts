import { getQuestion, getTotalQuestions, getAllQuestions } from '$lib/utils/questionnaire';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    
    const questionId = parseInt(params.id);
    const question = await getQuestion(questionId);
    const totalQuestions = await getTotalQuestions();
    const allQuestions = await getAllQuestions();

    return {
        question,
        totalQuestions,
        allQuestions
    };
}; 