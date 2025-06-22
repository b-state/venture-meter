import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadQuestionsFromCSV } from '$lib/utils/questionnaire';
import { LANGFLOW_QUESTION_HELPER_API_URL } from '$env/static/private';

export const GET: RequestHandler = async ({ params, fetch, url }) => {
    const questionId = parseInt(params.questionId);

    if (isNaN(questionId)) {
        return json({ error: 'Invalid question ID' }, { status: 400 });
    }

    try {
        // Load questions from CSV dynamically
        const questions = await loadQuestionsFromCSV(fetch);

        // Find the specific question by ID
        const question = questions.find(q => q.id === questionId);

        if (!question) {
            return json({ error: 'Question not found' }, { status: 404 });
        }

        // Get startup info from query parameters
        const industry = url.searchParams.get('industry') || '';
        const product_category = url.searchParams.get('productCategory') || '';
        const target_customers = url.searchParams.get('targetCustomers') || '';

        const payload = {
            "output_type": "text",
            "input_type": "text",

            "tweaks": {
                "TextInput-ypF2F": {
                    "input_value": `Frage: ${question.question}, Antworten: ${question.options.map((opt, i) => `${i + 1}. ${opt}`).join(', ')}`
                },
                "TextInput-LlCwM": {
                    "input_value": `${industry}`
                },
                "TextInput-hv3DB": {
                    "input_value": `${product_category}`
                },
                "TextInput-7Zgtd": {
                    "input_value": `${target_customers}`
                }
            }
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        const helpText = await fetch(`${LANGFLOW_QUESTION_HELPER_API_URL}`, options)
            .then(response => response.json())
        console.log(helpText)
        return json({ helpText });
    } catch (error) {
        console.error('Error fetching help text:', error);
        return json({ error: 'Failed to fetch help text' }, { status: 500 });
    }
}; 