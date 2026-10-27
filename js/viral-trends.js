/**
 * MV.ai — Buscador de Produtos Virais e Análise de Mercado
 */

function initViralTrends() {
  const genBtn = document.getElementById('generate-viral-trends-button');
  const input = document.getElementById('viral-trends-description-input');
  const resultsContainer = document.getElementById('viral-products-results');

  if (genBtn && input) {
    genBtn.addEventListener('click', handleGenerateViralTrends);
  }
}

async function handleGenerateViralTrends() {
  const input = document.getElementById('viral-trends-description-input');
  const results = document.getElementById('viral-products-results');
  const query = input ? input.value.trim() : '';

  if (!query) {
    showCustomMessage('Descreva o nicho ou público que deseja analisar.', 'warning');
    return;
  }

  showLoading('Analisando dores, buscas reais e tendências virais do mercado...');

  const systemPrompt = `Você é um ESTRATEGISTA DE INFOPRODUTOS E MINERAÇÃO DE PRODUTOS VIRAIS.
O usuário quer atacar o seguinte nicho ou público: "${query}".

Faça uma análise profunda e devolva a resposta formatada em Markdown visual com:
1. 🔥 AS 10 MAIORES DORES DO PÚBLICO (com as palavras exatas e emocionais que eles usam).
2. 🔍 TERMOS DE BUSCA REAIS no Google e YouTube.
3. ⚠️ O QUE JÁ ESTÁ SATURADO no mercado.
4. 💡 3 IDEIAS DE INFOPRODUTOS VIRAIS DE ALTA CONVERSÃO:
   Para cada ideia inclua:
   - Nome do Produto (atraente e memorável)
   - Promessa Principal (headline)
   - Formato Recomendado (E-book, Guia Prático, Checklist)
   - Preço Sugerido (R$ 27 a R$ 97)
   - Ângulo de Vendas / Gancho Viral

Use formatação bonita com emojis, títulos em negrito e listas organizadas.`;

  try {
    const analysis = await MV_API.generateText(`Faça a análise completa de mercado para: "${query}"`, systemPrompt);

    results.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <div class="p-6 bg-gray-800/80 rounded-2xl border border-blue-500/30 text-gray-200 leading-relaxed text-sm">
          ${formatMarkdownToHtml(analysis)}
        </div>

        <div class="p-5 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 class="font-bold text-white text-base">Gostou das ideias acima?</h4>
            <p class="text-xs text-gray-300">Você pode transformar qualquer uma dessas ideias em um E-book ou Página de Vendas imediatamente com 1 clique.</p>
          </div>
          <div class="flex gap-2">
            <button onclick="sendViralToEbook('${encodeURIComponent(query)}')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg">
              <i class="fas fa-book"></i> Criar E-book Agora
            </button>
            <button onclick="sendViralToSite('${encodeURIComponent(query)}')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg">
              <i class="fas fa-globe"></i> Criar Site Agora
            </button>
          </div>
        </div>
      </div>
    `;

    showCustomMessage('Análise de mercado e produtos virais concluída!', 'success');
  } catch (err) {
    console.error("Viral trends error:", err);
    showCustomMessage('Falha ao analisar produtos virais: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
}

window.sendViralToEbook = function(encodedQuery) {
  const query = decodeURIComponent(encodedQuery);
  const ebookInput = document.getElementById('ebook-description-input');
  if (ebookInput) ebookInput.value = `Guia completo e prático resolvendo as dores de: ${query}`;
  if (typeof switchView === 'function') switchView('infoproduct-view', 'infoproduct-mode-button-sidebar');
  showCustomMessage('Tema transferido para o Gerador de E-book!', 'info');
};

window.sendViralToSite = function(encodedQuery) {
  const query = decodeURIComponent(encodedQuery);
  const promptInput = document.getElementById('prompt-input');
  const inlineInput = document.getElementById('dev-inline-prompt-input');
  const val = `Página de vendas de alta conversão para infoproduto no nicho de: ${query}`;
  if (promptInput) promptInput.value = val;
  if (inlineInput) inlineInput.value = val;
  if (typeof switchView === 'function') switchView('developer-view', 'dev-mode-button-sidebar');
  showCustomMessage('Tema transferido para o Gerador de Sites!', 'info');
};

function formatMarkdownToHtml(md) {
  return md
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-blue-400 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black text-purple-400 mt-6 mb-3 border-b border-gray-700 pb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black text-white mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-gray-300">$1</em>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-1">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-gray-300 my-1">$1</li>')
    .replace(/\n\n/g, '<p class="my-3 text-gray-200">')
    .replace(/\n/g, '<br>');
}

window.addEventListener('DOMContentLoaded', initViralTrends);
