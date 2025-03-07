import * as vscode from 'vscode';
import { ChatPanel } from './webview/ChatPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('Lightbulb AI is now active!');

    let startChatCommand = vscode.commands.registerCommand('lightbulb-ai.startChat', () => {
        try {
            ChatPanel.createOrShow();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to start chat: ${(error as Error).message}`);
        }
    });

    context.subscriptions.push(startChatCommand);
}

export function deactivate() {}