/**
 * MV.ai — Gerenciador de Chaves de API & Rotação Inteligente
 */

function initApiManager() {
  const openBtnSidebar = document.getElementById('manage-api-button-sidebar');
  const openBtnMobile = document.getElementById('manage-api-button-mobile');
  const modal = document.getElementById('manage-api-modal');
  const closeBtn = document.getElementById('close-manage-api-modal');
  const cancelBtn = document.getElementById('cancel-manage-api');
  const saveBtn = document.getElementById('save-manage-api');

  const geminiInput = document.getElementById('user-gemini-key');
  const pexelsInput = document.getElementById('user-pexels-key');

  const geminiRotationBtn = document.getElementById('gemini-rotation-btn');
  const pexelsRotationBtn = document.getElementById('pexels-rotation-btn');

  // Load saved keys
  if (geminiInput) {
    const keys = MV_API.getGeminiKeys();
    if (keys.length > 0) geminiInput.value = keys[0].key || keys[0];
  }
  if (pexelsInput) {
    pexelsInput.value = MV_API.getPexelsKey();
  }

  const openModal = () => {
    if (modal) {
      modal.classList.remove('hidden');
      const content = document.getElementById('manage-api-modal-content');
      if (content) {
        content.classList.remove('opacity-0', 'scale-95');
        content.classList.add('opacity-100', 'scale-100');
      }
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.add('hidden');
    }
  };

  if (openBtnSidebar) openBtnSidebar.addEventListener('click', openModal);
  if (openBtnMobile) openBtnMobile.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const gVal = geminiInput?.value.trim() || '';
      const pVal = pexelsInput?.value.trim() || '';

      if (gVal) {
        const existing = MV_API.getGeminiKeys();
        if (!existing.some(k => (k.key || k) === gVal)) {
          existing.unshift({ key: gVal, status: 'active', addedAt: new Date().toISOString() });
        }
        localStorage.setItem('mv_gemini_keys', JSON.stringify(existing));
        localStorage.setItem('mv_primary_gemini_key', gVal);
      } else {
        localStorage.removeItem('mv_primary_gemini_key');
      }

      if (pVal) {
        localStorage.setItem('mv_pexels_key', pVal);
      } else {
        localStorage.removeItem('mv_pexels_key');
      }

      closeModal();
      showCustomMessage('Chaves de API salvas com sucesso no MV.ai!', 'success');
    });
  }

  // Rotação de Chaves
  if (geminiRotationBtn) {
    geminiRotationBtn.addEventListener('click', () => openRotationSubModal('gemini'));
  }
  if (pexelsRotationBtn) {
    pexelsRotationBtn.addEventListener('click', () => openRotationSubModal('pexels'));
  }

  // Tutorial Gemini
  const tutGeminiBtn = document.getElementById('tutorial-gemini-btn');
  const tutModal = document.getElementById('tutorial-modal');
  const closeTutBtn = document.getElementById('close-tutorial-modal');
  const closeTutFooterBtn = document.getElementById('close-tutorial-btn-footer');

  if (tutGeminiBtn) {
    tutGeminiBtn.addEventListener('click', () => {
      openTutorialModal();
    });
  }

  if (closeTutBtn) closeTutBtn.onclick = () => tutModal?.classList.add('hidden');
  if (closeTutFooterBtn) closeTutFooterBtn.onclick = () => tutModal?.classList.add('hidden');
}

function openRotationSubModal(type) {
  const modal = document.getElementById('key-rotation-modal');
  const label = document.getElementById('rotation-modal-provider-label');
  const list = document.getElementById('rotation-modal-list');
  const addBtn = document.getElementById('rotation-modal-add-btn');
  const input = document.getElementById('rotation-modal-input');
  const closeBtn = document.getElementById('rotation-modal-close');
  const testBtn = document.getElementById('rotation-modal-test-btn');

  if (!modal) return;
  modal.classList.remove('hidden');
  modal.style.display = 'flex';

  if (label) label.textContent = `Rotação de Chaves: ${type.toUpperCase()}`;
  if (closeBtn) closeBtn.onclick = () => { modal.classList.add('hidden'); modal.style.display = 'none'; };

  const renderList = () => {
    const keys = type === 'gemini' ? MV_API.getGeminiKeys() : [];
    if (keys.length === 0) {
      list.innerHTML = `<p class="text-xs text-gray-500 text-center py-4">Nenhuma chave adicional cadastrada.</p>`;
    } else {
      list.innerHTML = keys.map((k, idx) => `
        <div class="flex items-center justify-between p-2 bg-gray-800 rounded-lg border border-gray-700 mb-2">
          <span class="font-mono text-xs text-blue-300">${(k.key || k).slice(0, 8)}...${(k.key || k).slice(-4)}</span>
          <span class="text-[10px] text-emerald-400 font-bold">● Ativa</span>
          <button onclick="removeRotationKey('${type}', ${idx})" class="text-red-400 hover:text-red-300 text-xs p-1">✕</button>
        </div>
      `).join('');
    }
  };

  renderList();

  addBtn.onclick = () => {
    const keyVal = input.value.trim();
    if (!keyVal) return;
    const keys = MV_API.getGeminiKeys();
    keys.push({ key: keyVal, status: 'active', addedAt: new Date().toISOString() });
    localStorage.setItem('mv_gemini_keys', JSON.stringify(keys));
    input.value = '';
    renderList();
    showCustomMessage('Chave adicionada à lista de rotação!', 'success');
  };

  if (testBtn) {
    testBtn.onclick = async () => {
      showLoading('Testando conexão com servidores Gemini...');
      try {
        const testRes = await MV_API.generateText('Responda apenas: OK', '', { maxTokens: 10 });
        hideLoading();
        showCustomMessage('✅ Teste realizado com sucesso! API respondendo perfeitamente.', 'success');
      } catch (e) {
        hideLoading();
        showCustomMessage('⚠️ Erro ao testar chave: ' + e.message, 'error');
      }
    };
  }
}

window.removeRotationKey = function(type, idx) {
  const keys = MV_API.getGeminiKeys();
  keys.splice(idx, 1);
  localStorage.setItem('mv_gemini_keys', JSON.stringify(keys));
  openRotationSubModal(type);
};

function openTutorialModal() {
  const modal = document.getElementById('tutorial-modal');
  const body = document.getElementById('tutorial-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="space-y-6">
      <div class="p-4 rounded-xl bg-blue-950/60 border border-blue-600/40 text-blue-200 text-sm leading-relaxed">
        <strong>💡 O MV.ai já funciona 100% de graça</strong> mesmo sem nenhuma chave! Mas ao adicionar sua chave pessoal gratuita do Google Gemini, você terá respostas ainda mais rápidas e sem qualquer fila de espera.
      </div>

      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <span class="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center flex-shrink-0">1</span>
          <div>
            <h4 class="font-bold text-white text-base">Acesse o Google AI Studio</h4>
            <p class="text-sm text-gray-400">Entre em <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-blue-400 underline font-bold">aistudio.google.com/app/apikey</a> e faça login com sua conta do Google.</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <span class="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center flex-shrink-0">2</span>
          <div>
            <h4 class="font-bold text-white text-base">Clique em "Create API key"</h4>
            <p class="text-sm text-gray-400">Clique no botão azul no canto superior direito para criar uma nova chave instantaneamente (100% gratuita).</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <span class="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center flex-shrink-0">3</span>
          <div>
            <h4 class="font-bold text-white text-base">Copie e Cole no MV.ai</h4>
            <p class="text-sm text-gray-400">Copie a chave gerada (começa com "AIzaSy...") e cole no campo "Gemini API Key" no MV.ai.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

window.addEventListener('DOMContentLoaded', initApiManager);
