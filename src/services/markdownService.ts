import { marked } from 'marked';

export class MarkdownService {
    static render(content: string): string {
        const result = marked(content);
        if (result instanceof Promise) {
            throw new Error('Async rendering is not supported');
        }
        return result;
    }
}