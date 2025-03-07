export class WebviewScripts {
    static get(): string {
        return `
            <script>
                const vscode = acquireVsCodeApi();
                const messagesDiv = document.getElementById('messages');
                const sendButton = document.getElementById('send-button');
                const userInput = document.getElementById('user-input');
                const modelSelect = document.getElementById('model-select');

                function sendMessage() {
                    const message = userInput.value.trim();
                    if (message) {
                        vscode.postMessage({ type: 'sendMessage', message });
                        userInput.value = '';
                    }
                }

                sendButton.addEventListener('click', sendMessage);
                
                userInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });

                modelSelect.addEventListener('change', function() {
                    vscode.postMessage({ 
                        type: 'modelChanged', 
                        model: this.value 
                    });
                });

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'addMessage':
                            const div = document.createElement('div');
                            div.className = 'message ' + message.sender;
                            div.innerHTML = message.content;
                            if (message.sender === 'loading') {
                                div.setAttribute('data-loading', 'true');
                            }
                            messagesDiv.appendChild(div);
                            messagesDiv.scrollTop = messagesDiv.scrollHeight;
                            break;
                        case 'removeLoading':
                            const loadingMessages = messagesDiv.querySelectorAll('[data-loading="true"]');
                            loadingMessages.forEach(el => el.remove());
                            break;
                        case 'setLoading':
                            sendButton.disabled = message.isLoading;
                            userInput.disabled = message.isLoading;
                            modelSelect.disabled = message.isLoading;
                            break;
                    }
                });

                // Enable textarea resizing behavior
                userInput.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                });
            </script>
        `;
    }
}
