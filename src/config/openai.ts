import * as dotenv from 'dotenv';
import Configuration from 'openai';

dotenv.config();

export const OPENAI_CONFIG = {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    max_tokens: 1000
};
