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
        if (ChatPanel.currentPanel) {
            ChatPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside, true);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'lightbulbAI',
            'Lightbulb AI Chat',
            {
                viewColumn: vscode.ViewColumn.Beside,
                preserveFocus: true
            },
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
                            margin-bottom: 70px;
                            padding-bottom: 20px;
                        }
                        .message {
                            margin: 3px 0;  /* Reduced from 5px to 3px */
                            padding: 16px;
                            border-radius: 8px;
                            animation: fadeIn 0.3s ease-in;
                            margin-left: 0;
                            border: 1px solid var(--vscode-input-border);
                            border-bottom-left-radius: 4px;
                        }
                        
                        .message-header {
                            display: flex;
                            align-items: center;
                            margin-bottom: 8px;
                            justify-content: flex-start;
                            color: var(--vscode-editor-foreground); /* Changed to match text color */
                            font-weight: bold; /* Made the header bold */
                        }

                        .message-header .username {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            order: 1;
                        }

                        .message-header .timestamp {
                            font-size: 0.8em;
                            color: var(--vscode-descriptionForeground);
                            margin-left: 8px; /* Change margin to left */
                            order: 2; /* Move timestamp to right */
                        }

                        .avatar-icon {
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            background: var(--vscode-editor-background);
                            padding: 2px;
                            border: 1px solid var(--vscode-input-border);
                        }

                        .avatar-icon svg {
                            width: 100%;
                            height: 100%;
                            fill: var(--vscode-editor-foreground);
                        }

                        .message-content {
                            margin-top: 8px;
                            color: var(--vscode-editor-foreground);
                        }
                        .ai-message pre {
                            background: var(--vscode-textCodeBlock-background);
                            padding: 12px;
                            border-radius: 6px;
                            overflow-x: auto;
                            margin: 8px 0;
                        }
                        .ai-message code {
                            font-family: var(--vscode-editor-font-family);
                            background: var(--vscode-textCodeBlock-background);
                            padding: 2px 4px;
                            border-radius: 3px;
                        }
                        .input-container {
                            display: flex;
                            padding: 15px 20px;
                            background: var(--vscode-editor-background);
                            position: fixed;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            border-top: 1px solid var(--vscode-input-border);
                            backdrop-filter: blur(10px);
                            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                        }
                        #user-input {
                            flex: 1;
                            padding: 10px 15px;
                            margin-right: 12px;
                            background: var(--vscode-input-background);
                            border: 1px solid var(--vscode-input-border);
                            color: var(--vscode-input-foreground);
                            border-radius: 6px;
                            font-family: var(--vscode-font-family);
                            font-size: 14px;
                            transition: all 0.3s ease;
                        }
                        #user-input:focus {
                            outline: none;
                            border-color: var(--vscode-focusBorder);
                            box-shadow: 0 0 0 2px var(--vscode-focusBorder);
                        }
                        button {
                            padding: 10px 20px;
                            background: var(--vscode-button-background);
                            color: var(--vscode-button-foreground);
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-family: var(--vscode-font-family);
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.3s ease;
                        }
                        button:hover {
                            background: var(--vscode-button-hoverBackground);
                            transform: translateY(-1px);
                        }
                        button:active {
                            transform: translateY(0);
                        }
                        button:disabled {
                            opacity: 0.6;
                            cursor: not-allowed;
                            transform: none;
                        }
                        .thinking-indicator {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            padding: 12px;
                            color: var(--vscode-descriptionForeground);
                            font-style: italic;
                            animation: fadeIn 0.3s ease-in;
                        }
                        .dot {
                            width: 6px;
                            height: 6px;
                            background: var(--vscode-button-background);
                            border-radius: 50%;
                            animation: bounce 1.4s infinite ease-in-out;
                        }
                        .dot:nth-child(1) { animation-delay: -0.32s; }
                        .dot:nth-child(2) { animation-delay: -0.16s; }
                        @keyframes bounce {
                            0%, 80%, 100% { transform: scale(0); }
                            40% { transform: scale(1.0); }
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .markdown-body { color: var(--vscode-editor-foreground); }
                        .markdown-body h1,
                        .markdown-body h2,
                        .markdown-body h3,
                        .markdown-body h4 {
                            color: var(--vscode-titleBar-activeForeground);
                            border-bottom: 1px solid var(--vscode-input-border);
                            padding-bottom: 0.3em;
                            margin-top: 24px;
                            margin-bottom: 16px;
                        }
                        .markdown-body a {
                            color: var(--vscode-textLink-foreground);
                            text-decoration: none;
                        }
                        .markdown-body a:hover {
                            text-decoration: underline;
                        }
                        .markdown-body ul,
                        .markdown-body ol {
                            padding-left: 2em;
                            margin: 16px 0;
                        }
                        .markdown-body li {
                            margin: 8px 0;
                        }
                        .markdown-body table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 16px 0;
                        }
                        .markdown-body th,
                        .markdown-body td {
                            border: 1px solid var(--vscode-input-border);
                            padding: 8px 13px;
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
                            <input type="text" id="user-input" placeholder="Type your message here...">
                            <button id="send-button">Send</button>
                        </div>
                    </div>
                    <script>
                        const vscode = acquireVsCodeApi();
                        const messagesDiv = document.getElementById('messages');
                        const sendButton = document.getElementById('send-button');
                        const userInput = document.getElementById('user-input');

                        function createThinkingIndicator() {
                            const indicator = document.createElement('div');
                            indicator.className = 'thinking-indicator';
                            indicator.innerHTML = 'Generating<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
                            return indicator;
                        }

                        function setLoading(isLoading) {
                            sendButton.disabled = isLoading;
                            userInput.disabled = isLoading;
                            
                            if (isLoading) {
                                const indicator = createThinkingIndicator();
                                messagesDiv.appendChild(indicator);
                            } else {
                                const existingIndicator = document.querySelector('.thinking-indicator');
                                if (existingIndicator) {
                                    existingIndicator.remove();
                                }
                            }
                        }

                        function formatTimestamp() {
                            const now = new Date();
                            return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }

                        function getUserAvatar() {
                            return '<div class="avatar-icon">' +
                                '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                                '<path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"></path>' +
                                '</svg>' +
                                '</div>';
                        }

                        function getAIAvatar() {
                            return '<div class="avatar-icon">' +
                                '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                                '<path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>' +
                                '</svg>' +
                                '</div>';
                        }

                        function addMessage(content, sender) {
                            const messageDiv = document.createElement('div');
                            messageDiv.className = 'message ' + sender + '-message markdown-body';
                            
                            const header = document.createElement('div');
                            header.className = 'message-header';
                            
                            const username = document.createElement('div');
                            username.className = 'username';
                            
                            if (sender === 'user') {
                                username.innerHTML = getUserAvatar()+ "You";
                            } else {
                                username.innerHTML = getAIAvatar() + "Lightbulb AI";
                            }
                            
                            const timestamp = document.createElement('span');
                            timestamp.className = 'timestamp';
                            timestamp.textContent = formatTimestamp();
                            
                            header.appendChild(username);
                            header.appendChild(timestamp);
                            
                            const messageContent = document.createElement('div');
                            messageContent.className = 'message-content';
                            messageContent.innerHTML = content;
                            
                            messageDiv.appendChild(header);
                            messageDiv.appendChild(messageContent);
                            
                            messagesDiv.appendChild(messageDiv);
                            messagesDiv.scrollTop = messagesDiv.scrollHeight;
                        }

                        function sendMessage() {
                            const message = userInput.value.trim();
                            if (message) {
                                vscode.postMessage({ type: 'sendMessage', message });
                                userInput.value = '';
                            }
                        }

                        sendButton.addEventListener('click', sendMessage);
                        userInput.addEventListener('keypress', (e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !sendButton.disabled) {
                                sendMessage();
                            }
                        });

                        window.addEventListener('message', event => {
                            const message = event.data;
                            switch (message.type) {
                                case 'addMessage':
                                    addMessage(message.content, message.sender);
                                    break;
                                case 'setLoading':
                                    setLoading(message.isLoading);
                                    break;
                            }
                        });
                    </script>
                </body>
            </html>`;
    }

    private async _handleUserMessage(message: string) {
        try {
            // Show user message
            this._panel.webview.postMessage({
                type: 'addMessage',
                sender: 'user',
                content: message
            });

            // Show loading state
            this._panel.webview.postMessage({
                type: 'setLoading',
                isLoading: true
            });

            const chatService = new ChatService();
            const response = await chatService.generateResponse(message);
            const formattedResponse = MarkdownService.render(response);

            // Hide loading state and show AI response
            this._panel.webview.postMessage({
                type: 'setLoading',
                isLoading: false
            });
            this._panel.webview.postMessage({
                type: 'addMessage',
                sender: 'ai',
                content: formattedResponse
            });
        } catch (error) {
            // Hide loading state on error
            this._panel.webview.postMessage({
                type: 'setLoading',
                isLoading: false
            });
            
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