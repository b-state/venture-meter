import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const questionId = parseInt(params.questionId);
    
    if (isNaN(questionId)) {
        return json({ error: 'Invalid question ID' }, { status: 400 });
    }

    try {
        // TODO: Replace this with actual API call to your help text service
        // For now, returning mock data based on question ID
        const helpTexts: Record<number, string> = {
            1: "Diese Frage hilft uns zu verstehen, wie etabliert Ihr Unternehmen bereits ist.",
            2: "Wir möchten wissen, wie Sie Ihre Zielgruppe definieren.",
            3: "Diese Information ist wichtig für die Bewertung Ihres Marktpotenzials.",
            4: "Ihre Antwort hilft uns, die Wettbewerbssituation einzuschätzen.",
            5: "Wir benötigen diese Information für die Finanzplanung.",
            // Add more help texts as needed
        };

        const helpText = helpTexts[questionId] || null;

        return json({ helpText });
    } catch (error) {
        console.error('Error fetching help text:', error);
        return json({ error: 'Failed to fetch help text' }, { status: 500 });
    }
}; 