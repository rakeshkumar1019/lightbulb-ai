import * as dotenv from 'dotenv';

dotenv.config();

export type ModelProvider = 'openai' | 'gemini' | 'ollama';

export interface ModelConfig {
    provider: ModelProvider;
    model: string;
    temperature: number;
    max_tokens: number;
}

export const MODEL_CONFIGS: Record<ModelProvider, ModelConfig> = {
    openai: {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        max_tokens: 1000
    },
    gemini: {
        provider: 'gemini',
        model: 'gemini-pro',
        temperature: 0.7,
        max_tokens: 1000
    },
    ollama: {
        provider: 'ollama',
        model: 'llama3.2:3b',
        temperature: 0.7,
        max_tokens: 1000
    }
};

export const OPENAI_CONFIG = {
    apiKey: process.env.OPENAI_API_KEY,
    ...MODEL_CONFIGS.openai
};
