/**
 * MV.ai — Gerador de Criativos de Alta Conversão
 */

let currentAdFormat = '1:1';
let currentAdStrategy = 'solucao';
let currentAdBrief = null;
let currentAdImageUrl = '';
let currentAdRefImageData = null;

const AD_FORMATS_CONFIG = {
  '1:1':  { label: 'Feed Quadrado', desc: '1080×1080px (Instagram / Facebook)', w: 1080, h: 1080 },
  '4:5':  { label: 'Feed Mobile',   desc: '1080×1350px (Feed Vertical)',        w: 1080, h: 1350 },
  '9:16': { label: 'Stories / Reels', desc: '1080×1920px (Stories & TikTok)',    w: 1080, h: 1920 },
  '16:9': { label: 'Banner / YouTube', desc: '1280×720px (Thumbnails)',          w: 1280, h: 720  }
};

function initAdCreative() {
  renderFormatTabs();

  const btnLivre = document.getElementById('creative-btn-livre');
  const btnAgitar = document.getElementById('creative-btn-agitar');
  const refineBtn = document.getElementById('creative-refine-btn');
  const refineInput = document.getElementById('creative-refine-input');
  const downloadBtn = document.getElementById('creative-download-btn');
  const variationBtn = document.getElementById('creative-variation-btn');

  // Ref Image buttons
  const refBtn = document.getElementById('creative-ref-image-btn');
  const refInput = document.getElementById('creative-ref-image-input');
  const refPreview = document.getElementById('creative-ref-image-preview');
  const refThumb = document.getElementById('creative-ref-image-thumb');
  const refRemove = document.getElementById('creative-ref-image-remove');
  const descInput = document.getElementById('creative-input');

  if (btnLivre) btnLivre.addEventListener('click', () => handleGenerateCreative('solucao'));
  if (btnAgitar) btnAgitar.addEventListener('click', () => handleGenerateCreative('agitar'));
  if (refineBtn) refineBtn.addEventListener('click', handleRefineCreative);
  if (refineInput) {
    refineInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleRefineCreative();
    });
  }
  if (downloadBtn) downloadBtn.addEventListener('click', downloadCurrentCreative);
  if (variationBtn) variationBtn.addEventListener('click', handleGenerateVariation);

  if (refBtn && refInput) {
    refBtn.addEventListener('click', () => refInput.click());
    refInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          currentAdRefImageData = ev.target.result;
          if (refThumb) refThumb.src = ev.target.result;
          if (refPreview) refPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (refRemove) {
    refRemove.addEventListener('click', () => {
      currentAdRefImageData = null;
      if (refPreview) refPreview.classList.add('hidden');
      if (refInput) refInput.value = '';
    });
  }

  if (descInput) {
    descInput.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              currentAdRefImageData = ev.target.result;
              if (refThumb) refThumb.src = ev.target.result;
              if (refPreview) refPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
          }
        }
      }
    });
  }
}

function renderFormatTabs() {
  const container = document.getElementById('creative-format-tabs');
  const descEl = document.getElementById('creative-format-desc');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(AD_FORMATS_CONFIG).forEach(([key, cfg]) => {
    const active = key === currentAdFormat;
    const btn = document.createElement('button');
    btn.className = `px-4 py-2 rounded-xl text-xs font-bold border transition ${
      active 
        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20' 
        : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-500'
    }`;
    btn.innerHTML = `<span>${key}</span> <span class="opacity-75">(${cfg.label})</span>`;
    btn.onclick = () => {
      currentAdFormat = key;
      renderFormatTabs();
    };
    container.appendChild(btn);
  });

  if (descEl) {
    descEl.textContent = `${AD_FORMATS_CONFIG[currentAdFormat].desc}`;
  }
}

async function handleGenerateCreative(strategy) {
  const descInput = document.getElementById('creative-input');
  const productDesc = descInput ? descInput.value.trim() : '';

  if (!productDesc) {
    showCustomMessage('Descreva seu produto ou serviço antes de gerar o criativo.', 'warning');
    return;
  }

  currentAdStrategy = strategy;

  const resultArea = document.getElementById('creative-result-area');
  const loadingState = document.getElementById('creative-loading-state');
  const resultImg = document.getElementById('creative-result-image');
  const actionsArea = document.getElementById('creative-image-actions');
  const briefContent = document.getElementById('creative-brief-content');

  if (resultArea) resultArea.classList.remove('hidden');
  if (loadingState) loadingState.classList.remove('hidden');
  if (resultImg) resultImg.classList.add('hidden');
  if (actionsArea) actionsArea.classList.add('hidden');

  showLoading('MV.ai criando estratégia e arte visual do anúncio...');

  const strategyPrompt = strategy === 'solucao' 
    ? 'Foco: Mostrar a Solução, a transformação positiva, alívio e resultado tangível.'
    : 'Foco: Agitar o Problema, destacar o risco de não agir, a frustração atual e despertar urgência.';

  const systemPrompt = `Você é um DIRETOR DE CRIAÇÃO E COPYWRITER DE ANÚNCIOS VIRAIS (Meta Ads / TikTok Ads).
O usuário quer um criativo para o seguinte produto: "${productDesc}".
${strategyPrompt}
Formato de anúncio: ${currentAdFormat}.

Crie um briefing de alta conversão estruturado com:
1. 🎯 Público-Alvo e Momento de Consciência
2. ⚡ Gancho Principal (Headline do Anúncio)
3. 📝 Texto Principal de Copy (Legenda persuasiva de 3 parágrafos)
4. 🖼️ Descrição Visual da Arte (Composição, cores, elemento central, iluminação)
5. 🔍 Prompt em Inglês para a IA gerar a Imagem (ex: "cinematic product photography, neon lighting, luxury...")`;

  try {
    const brief = await MV_API.generateText(productDesc, systemPrompt);
    currentAdBrief = brief;

    if (briefContent) {
      briefContent.innerHTML = formatMarkdownToHtml(brief);
    }

    // Extrair ou sintetizar o prompt visual
    const imgPrompt = `advertising visual for ${productDesc}, ${strategy === 'solucao' ? 'clean positive aesthetic, happy person, bright lighting' : 'dramatic cinematic lighting, emotional expression, high contrast'}, 8k resolution, ultra detailed advertising composition`;
    
    const cfg = AD_FORMATS_CONFIG[currentAdFormat];
    const imageUrl = MV_API.generateImageUrl(imgPrompt, cfg.w, cfg.h);
    currentAdImageUrl = imageUrl;

    const img = new Image();
    img.src = imageUrl;
    const finalizeImage = () => {
      if (resultImg) {
        resultImg.src = imageUrl;
        resultImg.classList.remove('hidden');
      }
      if (loadingState) loadingState.classList.add('hidden');
      if (actionsArea) actionsArea.classList.remove('hidden');
      hideLoading();
    };
    img.onload = () => {
      finalizeImage();
      showCustomMessage('Criativo gerado com sucesso pelo MV.ai!', 'success');
    };
    img.onerror = () => {
      finalizeImage();
      showCustomMessage('Arte visual gerada! Exibindo imagem...', 'info');
    };
  } catch (err) {
    console.error("Ad creative error:", err);
    hideLoading();
    if (loadingState) loadingState.classList.add('hidden');
    showCustomMessage('Erro ao gerar criativo: ' + err.message, 'error');
  }
}

async function handleGenerateVariation() {
  showLoading('Gerando variação A/B de alta conversão...');
  try {
    const cfg = AD_FORMATS_CONFIG[currentAdFormat];
    const newSeed = Math.floor(Math.random() * 99999);
    const desc = document.getElementById('creative-input')?.value || 'produto digital';
    const variationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ' alternative angle, contrasting bold colors, high converting ad')}&width=${cfg.w}&height=${cfg.h}&seed=${newSeed}&nologo=true`;

    currentAdImageUrl = variationUrl;
    const resultImg = document.getElementById('creative-result-image');
    if (resultImg) resultImg.src = variationUrl;
    showCustomMessage('Nova variação A/B gerada!', 'success');
  } catch (e) {
    showCustomMessage('Erro na variação: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
}

async function handleRefineCreative() {
  const refineInput = document.getElementById('creative-refine-input');
  const chatHistory = document.getElementById('creative-chat-history');
  const instruction = refineInput ? refineInput.value.trim() : '';

  if (!instruction) return;
  refineInput.value = '';

  const userMsg = document.createElement('div');
  userMsg.className = 'text-xs text-blue-300 p-2 bg-blue-950/40 rounded border border-blue-900';
  userMsg.textContent = `Refinamento: ${instruction}`;
  chatHistory.appendChild(userMsg);

  showLoading('Refinando arte do anúncio...');

  try {
    const cfg = AD_FORMATS_CONFIG[currentAdFormat];
    const newPrompt = `${document.getElementById('creative-input')?.value || ''}, refined with: ${instruction}, professional ad visual`;
    const newUrl = MV_API.generateImageUrl(newPrompt, cfg.w, cfg.h);

    currentAdImageUrl = newUrl;
    const resultImg = document.getElementById('creative-result-image');
    if (resultImg) resultImg.src = newUrl;

    const aiMsg = document.createElement('div');
    aiMsg.className = 'text-xs text-emerald-300 p-2 bg-emerald-950/40 rounded border border-emerald-900';
    aiMsg.textContent = `Arte refinada de acordo com seu pedido!`;
    chatHistory.appendChild(aiMsg);

    showCustomMessage('Criativo refinado com sucesso!', 'success');
  } catch (err) {
    console.error("Refine error:", err);
  } finally {
    hideLoading();
  }
}

function downloadCurrentCreative() {
  if (!currentAdImageUrl) return;
  const a = document.createElement('a');
  a.href = currentAdImageUrl;
  a.target = '_blank';
  a.download = `criativo-mv-ai-${currentAdFormat.replace(':', 'x')}.jpg`;
  a.click();
  showCustomMessage('Baixando criativo em alta definição!', 'success');
}

window.addEventListener('DOMContentLoaded', initAdCreative);
