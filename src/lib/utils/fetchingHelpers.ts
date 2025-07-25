import { getStartupInfo } from "./questionnaire";


type HelpTextStore = {
    [key: string]: string | null;
};

const helpTextStore: HelpTextStore = {};

function getHelpTextFromStore(questionId: number) {
    return helpTextStore[questionId];
}

function setHelpTextInStore(questionId: number, helpText: string | null) {
    helpTextStore[questionId] = helpText;
}

// New async generator for streaming help text
export async function* streamHelpText(questionId: number) {
    console.log('streaming help text for question', questionId);
    const helpText = getHelpTextFromStore(questionId);

    // prefetch the next question's help text
    if (!getHelpTextFromStore(questionId + 1)) {
        prefetchHelpText(questionId + 1);
    }
    if (helpText) {
        yield helpText;
        return;
    }

    try {
        const startupInfo = getStartupInfo();
        const params = new URLSearchParams();
        if (startupInfo) {
            params.append('industry', startupInfo.industry);
            params.append('productCategory', startupInfo.productCategory);
            params.append('targetCustomers', startupInfo.targetCustomers);
        }
        const response = await fetch(`/api/help-text/${questionId}?${params.toString()}`);
        if (response.ok) {
            const reader = response.body!.getReader();
            let helpText = '';
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                helpText += chunk;
                setHelpTextInStore(questionId, helpText);
                yield helpText; // Yield the current state of helpText
            }
        } else {
            console.error('Failed to fetch help text');
            setHelpTextInStore(questionId, null);
        }

    } catch (error) {
        console.error('Error fetching help text:', error);
        setHelpTextInStore(questionId, null);
    }
}

export async function prefetchHelpText(questionId: number) {
    console.log('prefetching help text for question', questionId);
    try {
        const startupInfo = getStartupInfo();
        const params = new URLSearchParams();
        if (startupInfo) {
            params.append('industry', startupInfo.industry);
            params.append('productCategory', startupInfo.productCategory);
            params.append('targetCustomers', startupInfo.targetCustomers);
        }
        const response = await fetch(`/api/help-text/${questionId}?${params.toString()}`);
        if (response.ok) {
            const text = await response.text();
            setHelpTextInStore(questionId, text);
        } else {
            console.error('Failed to fetch help text');
            setHelpTextInStore(questionId, null);
        }
    } catch (error) {
        console.error('Error fetching help text:', error);
        setHelpTextInStore(questionId, null);
    }
}