import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { LANGFLOW_BASE_URL, LANGFLOW_API_KEY, LANGFLOW_HANDLUNGSEMPFEHLUNG_FLOW_ID } from '$env/static/private';
import { LangflowClient } from "@datastax/langflow-client"

export const GET: RequestHandler = async ({ url }) => {
    try {
        // Get startup info and results from query parameters
        const industry = url.searchParams.get('industry') || '';
        const product_category = url.searchParams.get('productCategory') || '';
        const target_customers = url.searchParams.get('targetCustomers') || '';
        const weakAnswers = url.searchParams.get('weakAnswers') || '[]';

        // Parse weak answers
        let weakAnswersData: Array<{
            category: string;
            question: string;
            selectedAnswer: string;
            score: number;
        }> = [];
        try {
            weakAnswersData = JSON.parse(weakAnswers);
        } catch (error) {
            console.error('Error parsing weak answers:', error);
        }

        // Format weak answers for the prompt
        let weakAnswersText = '';
        if (weakAnswersData.length > 0) {
            weakAnswersText = '\n\nSchwache Bereiche (Antwortstufen 1 & 2):\n';
            weakAnswersData.forEach((answer, index: number) => {
                weakAnswersText += `${index + 1}. Kategorie: ${answer.category}\n`;
                weakAnswersText += `   Frage: ${answer.question}\n`;
                weakAnswersText += `   Antwort: ${answer.selectedAnswer} (Stufe ${answer.score})\n\n`;
            });
        }

        const inputMessage = `
        Startup Daten:
        Industry: ${industry}
        Produkt Kategorie: ${product_category}
        Zielgruppe: ${target_customers}

        Bewertungsergebnisse: ${weakAnswersText}`;
        
        const client = new LangflowClient({ baseUrl: LANGFLOW_BASE_URL, apiKey: LANGFLOW_API_KEY });
        const flow = client.flow(LANGFLOW_HANDLUNGSEMPFEHLUNG_FLOW_ID);

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const response = await flow.stream(inputMessage);
                    for await (const event of response as any) {
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
        console.error('Error fetching recommendation:', error);
        return json({ error: 'Failed to fetch recommendation' }, { status: 500 });
    }
}; 