/**
 * MV.ai — Gerador de Prompts (Chat Conversacional)
 */

let isChatLoading = false;

function initChat() {
  const sendBtn = document.getElementById('send-button');
  const promptInput = document.getElementById('prompt-input');
  const micBtn = document.getElementById('microphone-button');
  const listeningIndicator = document.getElementById('listening-indicator');

  // O envio do prompt global é orquestrado centralmente por js/app.js
  // para evitar chamadas duplicadas e conflitos entre views.

  // Voice speech-to-text
  if (micBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    micBtn.addEventListener('click', () => {
      try {
        recognition.start();
        micBtn.classList.add('bg-red-600', 'animate-pulse');
        if (listeningIndicator) listeningIndicator.classList.remove('hidden');
      } catch (err) {
        console.warn("Speech recognition error:", err);
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (promptInput) promptInput.value += (promptInput.value ? ' ' : '') + transcript;
    };

    recognition.onend = () => {
      micBtn.classList.remove('bg-red-600', 'animate-pulse');
      if (listeningIndicator) listeningIndicator.classList.add('hidden');
    };
  }

  // Mensagem inicial de boas vindas
  const chatHistory = document.getElementById('chat-history-container');
  if (chatHistory && chatHistory.children.length === 0) {
    addChatMessage('ai', `👋 Olá! Eu sou o assistente do **MV.ai**!

Aqui você pode gerar prompts ultra-detalhados de alta conversão para:
- 🚀 **Landing Pages e Sites Completos**
- 📖 **E-books e Infoprodutos Lucrativos**
- 🎨 **Imagens e Criativos Visuais**
- 💬 **Scripts de Vendas e Copywriting**

Digite abaixo o que você deseja criar ou escolha uma das abas ao lado para gerar sites ou ebooks diretamente!`);
  }
}

function addChatMessage(sender, text) {
  const container = document.getElementById('chat-history-container');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`;

  const bubble = document.createElement('div');
  const isUser = sender === 'user';
  bubble.className = `max-w-2xl p-4 rounded-2xl shadow-lg relative ${
    isUser 
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none' 
      : 'bg-gray-800/90 text-gray-100 border border-gray-700 rounded-bl-none ai-message-content'
  }`;

  // Formatação simples de Markdown
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 p-3 rounded-lg overflow-x-auto my-2 font-mono text-xs text-blue-300"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-900 px-1.5 py-0.5 rounded text-blue-300 text-xs">$1</code>')
    .replace(/\n/g, '<br>');

  bubble.innerHTML = formatted;

  if (!isUser) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-chat-button';
    copyBtn.title = 'Copiar texto';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text);
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
      copyBtn.classList.add('clicked');
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
        copyBtn.classList.remove('clicked');
      }, 2000);
    };
    bubble.appendChild(copyBtn);
  }

  wrapper.appendChild(bubble);
  container.appendChild(wrapper);

  container.scrollTop = container.scrollHeight;
}

async function handleSendChatMessage() {
  const input = document.getElementById('prompt-input');
  if (!input) return;
  const prompt = input.value.trim();
  if (!prompt || isChatLoading) return;

  input.value = '';
  addChatMessage('user', prompt);

  const typingStatus = document.getElementById('chat-typing-status');
  if (typingStatus) typingStatus.classList.remove('hidden');
  isChatLoading = true;

  try {
    const systemPrompt = `Você é o assistente inteligente de elite do MV.ai. Você é especialista em:
1. Copywriting direto de alta conversão (AIDA, PAS, Storytelling).
2. Criação de estruturas irresistíveis para E-books, cursos e infoprodutos.
3. Engenharia de prompts para designers e desenvolvedores gerarem landing pages lucrativas.
Responda sempre em português, com tom profissional, prático e motivador. Use listas, tópicos e destaque os pontos-chave.`;

    const response = await MV_API.generateText(prompt, systemPrompt);
    addChatMessage('ai', response);
  } catch (err) {
    console.error("Chat error:", err);
    addChatMessage('ai', `⚠️ Desculpe, ocorreu um erro ao gerar a resposta: ${err.message}. Verifique sua conexão ou configure uma chave Gemini nas configurações.`);
  } finally {
    if (typingStatus) typingStatus.classList.add('hidden');
    isChatLoading = false;
  }
}

window.handleSendChatMessage = handleSendChatMessage;
window.addEventListener('DOMContentLoaded', initChat);
