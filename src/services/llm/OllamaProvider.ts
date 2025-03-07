import { LLMProvider, LLMConfig } from './LLMProvider';

interface OllamaResponse {
    model: string;
    response: string;
    done: boolean;
}

export class OllamaProvider implements LLMProvider {
    async generateResponse(prompt: string, config: LLMConfig): Promise<string> {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: config.model,
                    prompt: prompt,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as OllamaResponse;
            return data.response;
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Failed to connect to Ollama. Make sure the Ollama service is running on port 11434');
            }
            throw error;
        }
    }
}
