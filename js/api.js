/**
 * MV.ai — Core AI Engine & Multi-Provider API Layer
 * Supports Google Gemini (with multi-key rotation) + Free Built-in AI fallback + Image APIs
 */

const MV_API = {
  // Cascata oficial de modelos Gemini para máxima taxa de sucesso
  geminiModels: [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-lite-preview-02-05'
  ],

  // Retorna todas as chaves configuradas no LocalStorage
  getGeminiKeys() {
    try {
      const stored = localStorage.getItem('mv_gemini_keys');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const single = localStorage.getItem('mv_primary_gemini_key');
      if (single && single.trim()) return [{ key: single.trim(), status: 'active' }];
    } catch (e) {
      console.warn("Erro ao ler chaves:", e);
    }
    return [];
  },

  getPexelsKey() {
    return localStorage.getItem('mv_pexels_key') || '';
  },

  /**
   * Chamada de IA principal para geração de texto / código / prompts / briefings
   * Tenta as chaves do usuário no Gemini; se nenhuma chave existir ou todas falharem,
   * usa o engine gratuito ilimitado do MV.ai (Pollinations text stream).
   */
  async generateText(prompt, systemInstruction = '', options = {}) {
    const keys = this.getGeminiKeys();
    
    // Se o usuário cadastrou chaves Gemini, tenta na cascata
    if (keys.length > 0) {
      for (const item of keys) {
        if (item.status === 'invalid') continue;
        const key = item.key || item;
        for (const model of this.geminiModels) {
          try {
            console.log(`[MV.ai] Chamando Gemini (${model})...`);
            const payload = {
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 8192
              }
            };
            if (systemInstruction) {
              payload.systemInstruction = {
                parts: [{ text: systemInstruction }]
              };
            }

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (res.ok) {
              const data = await res.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) return text;
            } else if (res.status === 400 || res.status === 403) {
              console.warn(`Chave Gemini inválida ou sem permissão (${res.status})`);
              break; // Pula chave
            }
          } catch (err) {
            console.warn(`Erro no modelo ${model}:`, err);
          }
        }
      }
    }

    // FALLBACK 100% GRATUITO E ILIMITADO (Sem necessidade de chave)
    console.log('[MV.ai] Usando Neural Engine Gratuito...');
    try {
      const combinedPrompt = systemInstruction 
        ? `${systemInstruction}\n\n${prompt}` 
        : prompt;

      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemInstruction || 'Você é um assistente de IA especialista em marketing digital, criação de sites e infoprodutos.' },
            { role: 'user', content: prompt }
          ],
          model: 'mistral'
        })
      });

      if (res.ok) {
        const text = await res.text();
        if (text && text.trim()) return text;
      }
    } catch (e) {
      console.warn("Fallback Pollinations text falhou:", e);
    }

    throw new Error("Não foi possível gerar a resposta. Verifique sua chave API ou conexão.");
  },

  /**
   * Geração de Imagens por IA (100% Gratuito em Alta Resolução)
   * Usa Pollinations AI (Flux / SDXL) com prompts enriquecidos
   */
  generateImageUrl(prompt, width = 1024, height = 1024, style = '') {
    const finalPrompt = style ? `${prompt}, style: ${style}, high resolution, professional lighting, photorealistic or digital art` : prompt;
    const seed = Math.floor(Math.random() * 999999);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
  },

  /**
   * Busca imagens no Pexels ou gera via IA
   */
  async searchOrGenerateImage(query, width = 800, height = 600) {
    const pexelsKey = this.getPexelsKey();
    if (pexelsKey) {
      try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
          headers: { Authorization: pexelsKey }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.large || data.photos[0].src.medium;
          }
        }
      } catch (e) {
        console.warn("Pexels error, using AI image generator", e);
      }
    }
    // Geração inteligente instantânea
    return this.generateImageUrl(query, width, height);
  }
};

// UI Feedback Global
function showCustomMessage(msg, type = 'info') {
  const container = document.getElementById('mv-toast-container') || createToastContainer();
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-amber-600' : 'bg-blue-600';
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 font-medium text-sm ${bg} backdrop-blur-md`;
  toast.innerHTML = `<i class="fas ${icon} text-lg"></i><span>${msg}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function createToastContainer() {
  const c = document.createElement('div');
  c.id = 'mv-toast-container';
  c.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;width:92%;max-width:440px;align-items:center;';
  document.body.appendChild(c);
  return c;
}

let loadingFailsafeTimer = null;

function showLoading(text = "Processando com MV.ai...") {
  const overlay = document.getElementById('generating-overlay');
  const overlayText = document.getElementById('generating-overlay-text');
  if (overlay) {
    if (overlayText) overlayText.textContent = text;
    overlay.classList.remove('hidden');
    setTimeout(() => {
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
    }, 10);

    clearTimeout(loadingFailsafeTimer);
    loadingFailsafeTimer = setTimeout(() => {
      hideLoading();
    }, 20000);
  }
}

function hideLoading() {
  clearTimeout(loadingFailsafeTimer);
  const overlay = document.getElementById('generating-overlay');
  if (overlay) {
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  }
}

window.showCustomMessage = showCustomMessage;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
