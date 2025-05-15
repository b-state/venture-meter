import { getQuestion, getTotalQuestions, getAllQuestions } from '$lib/utils/questionHelpers';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
    
    const questionId = parseInt(params.id);
    const question = await getQuestion(fetch, questionId);
    const totalQuestions = await getTotalQuestions(fetch);
    const allQuestions = await getAllQuestions(fetch);

    return {
        question,
        totalQuestions,
        allQuestions
    };
}; 