import * as vscode from 'vscode';
import { ChatPanel } from './webview/ChatPanel';
import { OPENAI_CONFIG } from './config/openai';

export function activate(context: vscode.ExtensionContext) {
    console.log('Lightbulb AI is now active!');

    let startChatCommand = vscode.commands.registerCommand('lightbulb-ai.startChat', () => {
        if (!OPENAI_CONFIG.apiKey) {
            vscode.window.showErrorMessage('OpenAI API key is not configured. Please add it to your .env file.');
            return;
        }

        try {
            ChatPanel.createOrShow();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to start chat: ${(error as Error).message}`);
        }
    });

    context.subscriptions.push(startChatCommand);
}

export function deactivate() {}