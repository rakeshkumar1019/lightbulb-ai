import * as vscode from 'vscode';
import { ChatService } from '../services/chatService';
import { MarkdownService } from '../services/markdownService';

export class ChatPanel {
    public static currentPanel: ChatPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel) {
        this._panel = panel;
        this._panel.webview.html = this._getWebviewContent();
        this._setWebviewMessageListener(this._panel.webview);
    }

    public static createOrShow() {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ChatPanel.currentPanel) {
            ChatPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'lightbulbAI',
            'Lightbulb AI Chat',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        ChatPanel.currentPanel = new ChatPanel(panel);
    }

    private _getWebviewContent() {
        return `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            padding: 0;
                            margin: 0;
                            background-color: var(--vscode-editor-background);
                            color: var(--vscode-editor-foreground);
                            font-family: var(--vscode-font-family);
                        }
                        .chat-container { 
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            height: 100vh;
                        }
                        .messages {
                            flex: 1;
                            overflow-y: auto;
                            margin-bottom: 60px;
                            padding-bottom: 20px;
                        }
                        .message {
                            margin: 10px 0;
                            padding: 12px;
                            border-radius: 6px;
                            border: 1px solid var(--vscode-input-border);
                        }
                        .user-message {
                            background: var(--vscode-input-background);
                        }
                        .ai-message {
                            background: var(--vscode-editor-background);
                        }
                        .ai-message pre {
                            background: var(--vscode-textCodeBlock-background);
                            padding: 12px;
                            border-radius: 4px;
                            overflow-x: auto;
                        }
                        .ai-message code {
                            font-family: var(--vscode-editor-font-family);
                            background: var(--vscode-textCodeBlock-background);
                            padding: 2px 4px;
                            border-radius: 3px;
                        }
                        .input-container {
                            display: flex;
                            padding: 15px;
                            background: var(--vscode-editor-background);
                            position: fixed;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            border-top: 1px solid var(--vscode-input-border);
                        }
                        #user-input {
                            flex: 1;
                            padding: 8px 12px;
                            margin-right: 10px;
                            background: var(--vscode-input-background);
                            border: 1px solid var(--vscode-input-border);
                            color: var(--vscode-input-foreground);
                            border-radius: 4px;
                            font-family: var(--vscode-font-family);
                        }
                        #user-input:focus {
                            outline: 1px solid var(--vscode-focusBorder);
                            border-color: var(--vscode-focusBorder);
                        }
                        button {
                            padding: 8px 16px;
                            background: var(--vscode-button-background);
                            color: var(--vscode-button-foreground);
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: var(--vscode-font-family);
                        }
                        button:hover {
                            background: var(--vscode-button-hoverBackground);
                        }
                        button:disabled {
                            opacity: 0.6;
                            cursor: not-allowed;
                        }
                        .thinking {
                            color: var(--vscode-descriptionForeground);
                            font-style: italic;
                            padding: 8px 12px;
                        }
                        .markdown-body {
                            color: var(--vscode-editor-foreground);
                        }
                        .markdown-body h1,
                        .markdown-body h2,
                        .markdown-body h3,
                        .markdown-body h4 {
                            color: var(--vscode-titleBar-activeForeground);
                            border-bottom: 1px solid var(--vscode-input-border);
                            padding-bottom: 0.3em;
                        }
                        .markdown-body a {
                            color: var(--vscode-textLink-foreground);
                        }
                        .markdown-body ul,
                        .markdown-body ol {
                            padding-left: 2em;
                        }
                        .markdown-body table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 1em 0;
                        }
                        .markdown-body th,
                        .markdown-body td {
                            border: 1px solid var(--vscode-input-border);
                            padding: 6px 13px;
                        }
                        .markdown-body tr {
                            background: var(--vscode-editor-background);
                        }
                        .markdown-body tr:nth-child(2n) {
                            background: var(--vscode-input-background);
                        }
                    </style>
                </head>
                <body>
                    <div class="chat-container">
                        <div class="messages" id="messages"></div>
                        <div class="input-container">
                            <input type="text" id="user-input" placeholder="Type your message...">
                            <button id="send-button" onclick="sendMessage()">Send</button>
                        </div>
                    </div>
                    <script>
                        const vscode = acquireVsCodeApi();
                        const sendButton = document.getElementById('send-button');
                        const userInput = document.getElementById('user-input');
                        
                        function setLoading(isLoading) {
                            sendButton.disabled = isLoading;
                            userInput.disabled = isLoading;
                            sendButton.textContent = isLoading ? 'Thinking...' : 'Send';
                        }
                        
                        function sendMessage() {
                            const message = userInput.value.trim();
                            if (message) {
                                setLoading(true);
                                vscode.postMessage({ type: 'sendMessage', message });
                                userInput.value = '';
                            }
                        }
    
                        userInput.addEventListener('keypress', (e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !sendButton.disabled) {
                                sendMessage();
                            }
                        });
    
                        window.addEventListener('message', event => {
                            const message = event.data;
                            if (message.type === 'addMessage') {
                                const messagesDiv = document.getElementById('messages');
                                const messageDiv = document.createElement('div');
                                messageDiv.className = 'message ' + message.sender + '-message markdown-body';
                                messageDiv.innerHTML = message.content;
                                messagesDiv.appendChild(messageDiv);
                                messagesDiv.scrollTop = messagesDiv.scrollHeight;
                                
                                if (message.sender === 'ai') {
                                    setLoading(false);
                                }
                            }
                        });
                    </script>
                </body>
            </html>`;
    }

    private async _handleUserMessage(message: string) {
        this._panel.webview.postMessage({
            type: 'addMessage',
            sender: 'user',
            content: message
        });

        try {
            const chatService = new ChatService();
            const response = await chatService.generateResponse(message);
            const formattedResponse = MarkdownService.render(response);

            this._panel.webview.postMessage({
                type: 'addMessage',
                sender: 'ai',
                content: formattedResponse
            });
        } catch (error) {
            const errorMessage = 'Failed to generate response. Please check your API key and try again.';
            vscode.window.showErrorMessage(errorMessage);
            
            this._panel.webview.postMessage({
                type: 'addMessage',
                sender: 'ai',
                content: `❌ ${errorMessage}`
            });
        }
    }

    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            async (message: any) => {
                switch (message.type) {
                    case 'sendMessage':
                        await this._handleUserMessage(message.message);
                        break;
                }
            },
            undefined,
            this._disposables
        );
    }

    public dispose() {
        ChatPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}