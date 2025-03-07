import * as vscode from 'vscode';
import { ChatService } from '../services/ChatService';
import { MarkdownService } from '../services/markdownService';
import { WebviewContent } from './components/WebviewContent';

export class ChatPanel {
    public static currentPanel: ChatPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private chatService: ChatService;

    private constructor(panel: vscode.WebviewPanel) {
        this._panel = panel;
        this.chatService = new ChatService();
        this._panel.webview.html = WebviewContent.getContent();
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

    private async _handleUserMessage(message: string) {
        try {
            // Show user message
            this._panel.webview.postMessage({
                type: 'addMessage',
                sender: 'user',
                content: `
                    <div class="avatar">U</div>
                    <div class="content">
                        <strong>You</strong>
                        ${message}
                    </div>`
            });

            // Show loading state
            this._panel.webview.postMessage({
                type: 'setLoading',
                isLoading: true
            });

            // Show loading state message
            this._panel.webview.postMessage({
                type: 'addMessage',
                sender: 'loading',
                content: '<div class="loading">Generating...</div>'
            });

            const response = await this.chatService.generateResponse(message);
            const formattedResponse = MarkdownService.render(response);

            // Remove loading message and show AI response
            this._panel.webview.postMessage({
                type: 'removeLoading'
            });
            
            this._panel.webview.postMessage({
                type: 'setLoading',
                isLoading: false
            });
            this._panel.webview.postMessage({
                type: 'addMessage',
                sender: 'ai',
                content: `
                    <div class="avatar">L</div>
                    <div class="content">
                        <strong>Lightbulb</strong>
                        ${formattedResponse}
                    </div>`
            });
        } catch (error) {
            // Remove loading message on error
            this._panel.webview.postMessage({
                type: 'removeLoading'
            });

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
                    case 'modelChanged':
                        this.chatService.setProvider(message.model);
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