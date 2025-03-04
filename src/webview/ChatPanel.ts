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
                        .chat-container { 
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            height: 100vh;
                        }
                        .messages {
                            flex: 1;
                            overflow-y: auto;
                            margin-bottom: 20px;
                        }
                        .message {
                            margin: 10px 0;
                            padding: 10px;
                            border-radius: 5px;
                        }
                        .user-message {
                            background: #2d2d2d;
                            color: #fff;
                        }
                        .ai-message {
                            background: #1e1e1e;
                            color: #fff;
                        }
                        .input-container {
                            display: flex;
                            padding: 10px;
                            background: #1e1e1e;
                            position: fixed;
                            bottom: 0;
                            left: 0;
                            right: 0;
                        }
                        #user-input {
                            flex: 1;
                            padding: 8px;
                            margin-right: 10px;
                            background: #2d2d2d;
                            border: 1px solid #3d3d3d;
                            color: #fff;
                        }
                        button {
                            padding: 8px 16px;
                            background: #0e639c;
                            color: white;
                            border: none;
                            cursor: pointer;
                        }
                        button:hover {
                            background: #1177bb;
                        }
                    </style>
                </head>
                <body>
                    <div class="chat-container">
                        <div class="messages" id="messages"></div>
                        <div class="input-container">
                            <input type="text" id="user-input" placeholder="Type your message...">
                            <button onclick="sendMessage()">Send</button>
                        </div>
                    </div>
                    <script>
                        const vscode = acquireVsCodeApi();
                        
                        function sendMessage() {
                            const input = document.getElementById('user-input');
                            const message = input.value.trim();
                            if (message) {
                                vscode.postMessage({ type: 'sendMessage', message });
                                input.value = '';
                            }
                        }

                        document.getElementById('user-input').addEventListener('keypress', (e) => {
                            if (e.key === 'Enter') {
                                sendMessage();
                            }
                        });

                        window.addEventListener('message', event => {
                            const message = event.data;
                            if (message.type === 'addMessage') {
                                const messagesDiv = document.getElementById('messages');
                                const messageDiv = document.createElement('div');
                                messageDiv.className = 'message ' + message.sender + '-message';
                                messageDiv.innerHTML = message.content;
                                messagesDiv.appendChild(messageDiv);
                                messagesDiv.scrollTop = messagesDiv.scrollHeight;
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