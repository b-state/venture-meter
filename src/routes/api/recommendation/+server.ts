import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { LANGFLOW_BASE_URL, LANGFLOW_API_KEY, LANGFLOW_HANDLUNGSEMPFEHLUNG_FLOW_ID } from '$env/static/private';
import { LangflowClient } from "@datastax/langflow-client"

export const GET: RequestHandler = async ({ fetch, url }) => {
    try {
        // Get startup info and results from query parameters
        const industry = url.searchParams.get('industry') || '';
        const product_category = url.searchParams.get('productCategory') || '';
        const target_customers = url.searchParams.get('targetCustomers') || '';
        const results = url.searchParams.get('results') || '';

        const inputMessage = `
        Startup Daten:
        Industry: ${industry}
        Produkt Kategorie: ${product_category}
        Zielgruppe: ${target_customers}

        Bewertungsergebnisse: ${results}

        Bitte erstelle eine Handlungsempfehlung basierend auf den Startup-Daten und den Bewertungsergebnissen.
        `;
        
        const client = new LangflowClient({ baseUrl: LANGFLOW_BASE_URL, apiKey: LANGFLOW_API_KEY });
        const flow = client.flow(LANGFLOW_HANDLUNGSEMPFEHLUNG_FLOW_ID);

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
        console.error('Error fetching recommendation:', error);
        return json({ error: 'Failed to fetch recommendation' }, { status: 500 });
    }
}; 