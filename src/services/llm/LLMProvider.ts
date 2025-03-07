export interface LLMConfig {
    model: string;
    temperature: number;
    max_tokens: number;
}

export interface LLMProvider {
    generateResponse(prompt: string, config: LLMConfig): Promise<string>;
}
