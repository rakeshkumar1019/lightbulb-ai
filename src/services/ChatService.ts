import { ModelProvider, MODEL_CONFIGS } from '../config/openai';
import { LLMProvider } from './llm/LLMProvider';
import { OllamaProvider } from './llm/OllamaProvider';
import { OpenAIProvider } from './llm/OpenAIProvider';

export class ChatService {
    private currentProvider: ModelProvider = 'ollama';
    private llmProvider: LLMProvider | null = null;

    setProvider(provider: ModelProvider) {
        this.currentProvider = provider;
        switch (provider) {
            case 'openai':
                const apiKey = process.env.OPENAI_API_KEY;
                if (!apiKey) {
                    throw new Error('OpenAI API key is required');
                }
                this.llmProvider = new OpenAIProvider(apiKey);
                break;
            case 'ollama':
                this.llmProvider = new OllamaProvider();
                break;
            // case 'gemini':
            //     const geminiKey = process.env.GEMINI_API_KEY;
            //     if (!geminiKey) {
            //         throw new Error('Gemini API key is required');
            //     }
            //     this.llmProvider = new GeminiProvider(geminiKey);
            //     break;
            default:
                throw new Error(`Provider ${provider} not implemented`);
        }
    }

    async generateResponse(prompt: string): Promise<string> {
        if (!this.llmProvider) {
            this.setProvider(this.currentProvider);
        }
        
        if (!this.llmProvider) {
            throw new Error('No LLM provider configured');
        }

        const config = MODEL_CONFIGS[this.currentProvider];
        return await this.llmProvider.generateResponse(prompt, config);
    }
}
