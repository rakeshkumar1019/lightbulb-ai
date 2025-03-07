import { WebviewStyles } from './WebviewStyles';
import { WebviewScripts } from './WebviewScripts';

export class WebviewContent {
    static getContent(): string {
        return `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${WebviewStyles.get()}
                </head>
                <body>
                    <div class="chat-container">
                        <div class="messages" id="messages"></div>
                        <div class="input-container">
                            <div class="input-row">
                                <select id="model-select">
                                    <option value="ollama">Ollama (Local)</option>
                                    <option value="openai">OpenAI GPT-4</option>
                                    <option value="gemini">Google Gemini</option>
                                </select>
                            </div>
                            <div class="input-row">
                                <textarea id="user-input" placeholder="Type your message here..." rows="2"></textarea>
                                <button id="send-button">Send</button>
                            </div>
                        </div>
                    </div>
                    ${WebviewScripts.get()}
                </body>
            </html>`;
    }
}
