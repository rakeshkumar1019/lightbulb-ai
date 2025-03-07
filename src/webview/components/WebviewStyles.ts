export class WebviewStyles {
    static get(): string {
        return `
            <style>
                body {
                    padding: 0;
                    margin: 0;
                    color: #ffffff;
                    background-color: #000000;
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
                    margin: 8px 0;
                    padding: 12px;
                    border-radius: 8px;
                    animation: fadeIn 0.3s ease-in;
                    border: 1px solid #ffffff;
                    max-width: 80%;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    background: #000000;
                    color: #ffffff;
                }

                .message .avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                    border: 1px solid var(--vscode-input-border);
                }

                .message .content {
                    flex: 1;
                }

                .message.user .avatar {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }

                .message.ai .avatar {
                    background: var(--vscode-inputValidation-infoBackground);
                    color: var(--vscode-inputValidation-infoForeground);
                }

                .message strong {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--vscode-symbolIcon-variableForeground);
                }

                .input-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 15px 20px;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    border-top: 1px solid var(--vscode-input-border);
                }
                .input-row {
                    display: flex;
                    gap: 10px;
                    width: 100%;
                }

                textarea {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid var(--vscode-input-border);
                    background: #000000;
                    color: #ffffff;
                    border-radius: 4px;
                    resize: vertical;
                    font-family: inherit;
                }

                select {
                    padding: 8px;
                    border: 1px solid var(--vscode-dropdown-border);
                    background: #000000;
                    color: #ffffff;
                    border-radius: 4px;
                    cursor: pointer;
                }

                button {
                    padding: 8px 16px;
                    background: #000000;
                    color: #ffffff;
                    border: 1px solid #ffffff;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                }

                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                button:hover:not(:disabled) {
                    background: var(--vscode-button-hoverBackground);
                }

                .loading {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 16px;
                    color: var(--vscode-descriptionForeground);
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            </style>
        `;
    }
}
