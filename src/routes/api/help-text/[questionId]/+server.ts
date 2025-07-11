import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadQuestionsFromCSV } from '$lib/utils/questionnaire';
import { LANGFLOW_BASE_URL, LANGFLOW_API_KEY, LANGFLOW_SPICKZETTEL_FLOW_ID } from '$env/static/private';
import { LangflowClient } from "@datastax/langflow-client"

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

        const inputMessage = `
        Startup Daten:
        Industry: ${industry}
        Produkt Kategorie: ${product_category}
        Zielgruppe: ${target_customers}

        Frage: ${question.question}
        Antworten: ${question.options.join('\n ')}
        `;
        
        const client = new LangflowClient({ baseUrl: LANGFLOW_BASE_URL, apiKey: LANGFLOW_API_KEY });
        const flow = client.flow(LANGFLOW_SPICKZETTEL_FLOW_ID);

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const response = await flow.stream(inputMessage);
                    for await (const event of response) {
                        if (event.event === 'token') {
                            controller.enqueue(event.data.chunk); // Text-Chunk hinzufügen
                        }
                    }
                    controller.close(); // Stream beenden
                } catch (error) {
                    controller.error(error); // Fehler an Client weitergeben
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain',
                'Transfer-Encoding': 'chunked' // wichtig für echtes Streaming
            }
        });


    } catch (error) {
        console.error('Error fetching help text:', error);
        return json({ error: 'Failed to fetch help text' }, { status: 500 });
    }
};