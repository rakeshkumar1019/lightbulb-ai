import OpenAI from 'openai';
import { OPENAI_CONFIG } from '../config/openai';

export class ChatService {
    private openai: OpenAI;

    constructor() {
        if (!OPENAI_CONFIG.apiKey) {
            throw new Error('OpenAI API key is not configured');
        }
        
        this.openai = new OpenAI({
            apiKey: OPENAI_CONFIG.apiKey
        });
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: OPENAI_CONFIG.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: OPENAI_CONFIG.temperature,
                max_tokens: OPENAI_CONFIG.max_tokens
            });

            return response.choices[0].message.content || 'No response generated';
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }
}