import OpenAI from 'openai';
import { LLMProvider, LLMConfig } from './LLMProvider';

export class OpenAIProvider implements LLMProvider {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey });
    }

    async generateResponse(prompt: string, config: LLMConfig): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: config.temperature,
            max_tokens: config.max_tokens
        });
        
        return response.choices[0].message.content || 'No response generated';
    }
}
