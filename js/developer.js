/**
 * MV.ai — Gerador e Editor Visual de Sites (Developer View)
 */

let currentSiteCode = '';
let siteHistory = [];
let siteHistoryPointer = -1;
let isVisualEditMode = false;
let selectedElementForEdit = null;
let customEmbeddedScripts = '';

function initDeveloper() {
  const iframe = document.getElementById('preview-iframe');
  const desktopBtn = document.getElementById('preview-desktop-button');
  const tabletBtn = document.getElementById('preview-tablet-button');
  const mobileBtn = document.getElementById('preview-mobile-button');
  const saveBtn = document.getElementById('save-project-button');
  const myProjectsBtn = document.getElementById('my-projects-dev-button');
  const copyHtmlBtn = document.getElementById('copy-html-button');
  const newPageBtn = document.getElementById('new-page-button');
  const undoBtn = document.getElementById('preview-undo-button');
  const redoBtn = document.getElementById('preview-redo-button');
  const toggleEditBtn = document.getElementById('toggle-edit-mode-button');
  const embedScriptsBtn = document.getElementById('embed-scripts-button');
  const publishNetlifyBtn = document.getElementById('publish-netlify-button');

  // Device switcher
  if (desktopBtn && iframe) {
    desktopBtn.addEventListener('click', () => setPreviewSize('desktop'));
    tabletBtn.addEventListener('click', () => setPreviewSize('tablet'));
    mobileBtn.addEventListener('click', () => setPreviewSize('mobile'));
  }

  // Buttons
  if (copyHtmlBtn) copyHtmlBtn.addEventListener('click', copySiteHtml);
  if (saveBtn) saveBtn.addEventListener('click', saveCurrentProject);
  if (myProjectsBtn) myProjectsBtn.addEventListener('click', openProjectsModal);
  if (newPageBtn) newPageBtn.addEventListener('click', confirmNewPage);
  if (undoBtn) undoBtn.addEventListener('click', () => navigateSiteHistory(-1));
  if (redoBtn) redoBtn.addEventListener('click', () => navigateSiteHistory(1));
  if (toggleEditBtn) toggleEditBtn.addEventListener('click', toggleVisualEditMode);
  if (embedScriptsBtn) embedScriptsBtn.addEventListener('click', openEmbedScriptsModal);
  if (publishNetlifyBtn) publishNetlifyBtn.addEventListener('click', downloadSiteZip);

  initTextToolbar();
  initElementModal();

  // Se já tiver código salvo ou padrão, carrega
  const lastCode = localStorage.getItem('mv_last_site_code');
  if (lastCode) {
    updateSiteCode(lastCode, false);
  } else {
    loadDefaultWelcomeSite();
  }
}

function setPreviewSize(device) {
  const iframe = document.getElementById('preview-iframe');
  const buttons = {
    desktop: document.getElementById('preview-desktop-button'),
    tablet: document.getElementById('preview-tablet-button'),
    mobile: document.getElementById('preview-mobile-button')
  };

  Object.values(buttons).forEach(b => b?.classList.remove('active'));
  buttons[device]?.classList.add('active');

  if (device === 'desktop') iframe.style.maxWidth = '100%';
  else if (device === 'tablet') iframe.style.maxWidth = '768px';
  else if (device === 'mobile') iframe.style.maxWidth = '425px';
}

function updateSiteCode(code, pushToHistory = true) {
  currentSiteCode = code;
  const iframe = document.getElementById('preview-iframe');
  const textarea = document.getElementById('code-content-textarea');

  if (textarea) textarea.value = code;
  if (iframe) {
    iframe.srcdoc = injectEditorHooks(code);
    iframe.onload = () => {
      attachIframeEditListeners();
    };
  }

  localStorage.setItem('mv_last_site_code', code);

  if (pushToHistory) {
    if (siteHistoryPointer < siteHistory.length - 1) {
      siteHistory.splice(siteHistoryPointer + 1);
    }
    siteHistory.push(code);
    siteHistoryPointer = siteHistory.length - 1;
    updateUndoRedoButtons();
  }
}

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('preview-undo-button');
  const redoBtn = document.getElementById('preview-redo-button');
  if (undoBtn) undoBtn.disabled = siteHistoryPointer <= 0;
  if (redoBtn) redoBtn.disabled = siteHistoryPointer >= siteHistory.length - 1;
}

function navigateSiteHistory(direction) {
  const newPointer = siteHistoryPointer + direction;
  if (newPointer >= 0 && newPointer < siteHistory.length) {
    siteHistoryPointer = newPointer;
    updateSiteCode(siteHistory[siteHistoryPointer], false);
    updateUndoRedoButtons();
  }
}

function injectEditorHooks(html) {
  if (customEmbeddedScripts) {
    html = html.replace('</head>', `${customEmbeddedScripts}\n</head>`);
  }
  return html;
}

/**
 * Geração de Site com IA a partir do Prompt
 */
async function generateSiteFromPrompt(userPrompt) {
  if (!userPrompt || !userPrompt.trim()) return;

  showLoading('MV.ai está projetando seu site de alta conversão...');

  const systemPrompt = `Você é um DESIGNER FRONT-END SÊNIOR e MESTRE EM COPYWRITING DE CONVERSÃO.
Gere um site / landing page COMPLETO, moderno, elegante e 100% autossuficiente em uma ÚNICA estrutura HTML5.

REQUISITOS OBRIGATÓRIOS:
1. Inclua no <head>:
   - Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
   - Google Fonts (Inter, Poppins ou Montserrat)
   - Font Awesome 6: <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
2. Estrutura da Página de Vendas:
   - Header fixo com Logo em texto/ícone e botão de CTA destacado.
   - Hero Section impactante: Headline irresistível, subheadline esclarecedora, botão CTA pulsante com ícone, prova social ("Mais de 10.000 clientes satisfeitos"), imagem de alta conversão.
   - Seção de Dores / O Problema: "Você se identifica com isso?" (3 ou 4 cards com problemas que o público enfrenta).
   - Seção de Solução / O Método: Como seu produto ou serviço resolve essas dores de forma rápida e segura.
   - Seção de Benefícios / Módulos: Cards modernos com ícones vibrantes e explicações claras.
   - Seção de Prova Social / Depoimentos: 3 depoimentos realistas com fotos, estrelas e resultados comprovados.
   - Seção de Oferta Irrecusável: Card de preço, bônus exclusivos, ancoragem de preço (De R$ X por apenas 12x de R$ Y), botão CTA grande com efeito hover.
   - Garantia Incondicional: Selo de 7 ou 30 dias de garantia com texto tranquilizador.
   - FAQ (Perguntas Frequentes): 4 ou 5 perguntas comuns respondidas com clareza.
   - Rodapé completo com links, copyright e aviso de responsabilidade.
3. Imagens:
   - Use URLs diretas de alta qualidade do Unsplash para ilustrar:
     ex: https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80 (fitness),
     https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80 (business/tech),
     https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80 (educação/equipe), etc.
4. Interatividade:
   - Contador regressivo em tempo real (JavaScript).
   - Animações CSS suaves (@keyframes pulse, hover:scale-105).
5. Responda APENAS com o código HTML puro, começando com <!DOCTYPE html> e fechando com </html>, sem textos explicativos fora do código.`;

  try {
    let generatedHtml = await MV_API.generateText(`Crie uma landing page de alta conversão para o seguinte tema:\n"${userPrompt}"`, systemPrompt);

    // Limpeza de possíveis blocos markdown ```html
    generatedHtml = generatedHtml.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();

    if (!generatedHtml.includes('<!DOCTYPE') && !generatedHtml.includes('<html')) {
      generatedHtml = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Landing Page</title><script src="https://cdn.tailwindcss.com"></script></head><body>${generatedHtml}</body></html>`;
    }

    updateSiteCode(generatedHtml, true);
    showCustomMessage('Página criada com sucesso pelo MV.ai!', 'success');
  } catch (err) {
    console.error("Erro na geração de site:", err);
    showCustomMessage(`Erro ao gerar página: ${err.message}`, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Modo de Edição Visual (WYSIWYG)
 */
function toggleVisualEditMode() {
  isVisualEditMode = !isVisualEditMode;
  const btn = document.getElementById('toggle-edit-mode-button');
  const toolbar = document.getElementById('dev-text-edit-toolbar');

  if (isVisualEditMode) {
    if (btn) {
      btn.textContent = 'Sair da Edição';
      btn.classList.add('bg-blue-600', 'text-white');
    }
    if (toolbar) toolbar.classList.remove('hidden');
    showCustomMessage('Modo de Edição Ativado! Clique em qualquer texto ou imagem para editar.', 'info');
  } else {
    if (btn) {
      btn.textContent = 'Editar Site';
      btn.classList.remove('bg-blue-600');
    }
    if (toolbar) toolbar.classList.add('hidden');
  }
  attachIframeEditListeners();
}

function attachIframeEditListeners() {
  const iframe = document.getElementById('preview-iframe');
  if (!iframe || !iframe.contentDocument) return;

  const doc = iframe.contentDocument;
  const elements = doc.querySelectorAll('h1, h2, h3, h4, p, span, a, button, img, li');

  elements.forEach(el => {
    if (isVisualEditMode) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', handleElementClickInIframe);
      if (['H1', 'H2', 'H3', 'H4', 'P', 'SPAN', 'LI'].includes(el.tagName)) {
        el.contentEditable = 'true';
        el.addEventListener('input', () => {
          syncIframeToCode();
        });
      }
    } else {
      el.style.cursor = '';
      el.contentEditable = 'false';
      el.removeEventListener('click', handleElementClickInIframe);
    }
  });
}

function handleElementClickInIframe(e) {
  if (!isVisualEditMode) return;
  e.preventDefault();
  e.stopPropagation();

  selectedElementForEdit = e.currentTarget;

  if (selectedElementForEdit.tagName === 'IMG' || selectedElementForEdit.tagName === 'BUTTON' || selectedElementForEdit.tagName === 'A') {
    openElementModal(selectedElementForEdit);
  }
}

function syncIframeToCode() {
  const iframe = document.getElementById('preview-iframe');
  if (!iframe || !iframe.contentDocument) return;
  const newHtml = iframe.contentDocument.documentElement.outerHTML;
  currentSiteCode = '<!DOCTYPE html>\n' + newHtml;
  document.getElementById('code-content-textarea').value = currentSiteCode;
  localStorage.setItem('mv_last_site_code', currentSiteCode);
}

/**
 * Toolbar de Texto
 */
function initTextToolbar() {
  const toolbar = document.getElementById('dev-text-edit-toolbar');
  if (!toolbar) return;

  toolbar.querySelectorAll('button[data-format]').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;
      const iframe = document.getElementById('preview-iframe');
      if (iframe && iframe.contentDocument) {
        iframe.contentDocument.execCommand(format, false, null);
        syncIframeToCode();
      }
    });
  });

  toolbar.querySelectorAll('button[data-align]').forEach(btn => {
    btn.addEventListener('click', () => {
      const align = btn.dataset.align;
      const iframe = document.getElementById('preview-iframe');
      if (iframe && iframe.contentDocument) {
        iframe.contentDocument.execCommand('justify' + align.charAt(0).toUpperCase() + align.slice(1), false, null);
        syncIframeToCode();
      }
    });
  });

  const fontSelect = document.getElementById('dev-font-family-select');
  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      if (selectedElementForEdit) {
        selectedElementForEdit.style.fontFamily = e.target.value;
        syncIframeToCode();
      }
    });
  }

  const fontSizeInput = document.getElementById('dev-font-size-input');
  if (fontSizeInput) {
    fontSizeInput.addEventListener('input', (e) => {
      if (selectedElementForEdit) {
        selectedElementForEdit.style.fontSize = `${e.target.value}px`;
        syncIframeToCode();
      }
    });
  }

  const colorPicker = document.getElementById('dev-text-color-picker');
  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      if (selectedElementForEdit) {
        selectedElementForEdit.style.color = e.target.value;
        syncIframeToCode();
      }
    });
  }
}

/**
 * Modal de Edição de Imagens e Botões
 */
function initElementModal() {
  const modal = document.getElementById('element-edit-modal');
  const cancelBtn = document.getElementById('cancel-element-edit-button');
  const applyBtn = document.getElementById('apply-element-url-button');
  const deleteBtn = document.getElementById('delete-element-button-modal');
  const aiGenBtn = document.getElementById('ai-image-generate-btn');
  const uploadInput = document.getElementById('element-image-upload');
  const uploadBtn = document.getElementById('upload-element-button');

  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (selectedElementForEdit) {
        selectedElementForEdit.remove();
        syncIframeToCode();
        modal.classList.add('hidden');
        showCustomMessage('Elemento removido.', 'info');
      }
    });
  }

  if (uploadBtn && uploadInput) {
    uploadBtn.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (selectedElementForEdit) {
            selectedElementForEdit.src = ev.target.result;
            syncIframeToCode();
            modal.classList.add('hidden');
            showCustomMessage('Imagem atualizada!', 'success');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (aiGenBtn) {
    aiGenBtn.addEventListener('click', () => {
      const promptInput = document.getElementById('ai-image-prompt-input');
      const p = promptInput ? promptInput.value.trim() : '';
      if (!p) {
        showCustomMessage('Digite o que deseja na imagem.', 'warning');
        return;
      }
      const newUrl = MV_API.generateImageUrl(p, 1024, 1024);
      if (selectedElementForEdit) {
        selectedElementForEdit.src = newUrl;
        syncIframeToCode();
        modal.classList.add('hidden');
        showCustomMessage('Imagem gerada com sucesso!', 'success');
      }
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      if (!selectedElementForEdit) return;

      const urlInput = document.getElementById('element-url-input');
      const btnTextInput = document.getElementById('button-text-input');
      const btnLinkInput = document.getElementById('button-link-input');
      const btnColorInput = document.getElementById('button-color-input');
      const btnTextColorInput = document.getElementById('button-text-color-input');
      const btnRadiusInput = document.getElementById('button-border-radius-input');

      if (selectedElementForEdit.tagName === 'IMG' && urlInput && urlInput.value.trim()) {
        selectedElementForEdit.src = urlInput.value.trim();
      }

      if (['BUTTON', 'A'].includes(selectedElementForEdit.tagName)) {
        if (btnTextInput && btnTextInput.value) selectedElementForEdit.textContent = btnTextInput.value;
        if (btnLinkInput && btnLinkInput.value) selectedElementForEdit.href = btnLinkInput.value;
        if (btnColorInput && btnColorInput.value) selectedElementForEdit.style.backgroundColor = btnColorInput.value;
        if (btnTextColorInput && btnTextColorInput.value) selectedElementForEdit.style.color = btnTextColorInput.value;
        if (btnRadiusInput && btnRadiusInput.value) selectedElementForEdit.style.borderRadius = `${btnRadiusInput.value}px`;
      }

      syncIframeToCode();
      modal.classList.add('hidden');
      showCustomMessage('Alterações salvas!', 'success');
    });
  }
}

function openElementModal(el) {
  const modal = document.getElementById('element-edit-modal');
  if (!modal) return;

  const imageOptions = document.getElementById('image-edit-options');
  const buttonOptions = document.getElementById('button-edit-options');

  if (el.tagName === 'IMG') {
    imageOptions.classList.remove('hidden');
    buttonOptions.classList.add('hidden');
    document.getElementById('element-url-input').value = el.src || '';
  } else {
    imageOptions.classList.add('hidden');
    buttonOptions.classList.remove('hidden');
    document.getElementById('button-text-input').value = el.textContent || '';
    document.getElementById('button-link-input').value = el.getAttribute('href') || '';
  }

  modal.classList.remove('hidden');
}

/**
 * Projetos Salvos (Meus Sites)
 */
function saveCurrentProject() {
  const nameInput = document.getElementById('project-name-input');
  const name = (nameInput && nameInput.value.trim()) || `Site MV.ai - ${new Date().toLocaleDateString('pt-BR')}`;

  const savedSites = JSON.parse(localStorage.getItem('mv_saved_sites') || '[]');
  const existingIdx = savedSites.findIndex(s => s.name.toLowerCase() === name.toLowerCase());

  const newEntry = {
    id: 'site_' + Date.now(),
    name: name,
    code: currentSiteCode,
    date: new Date().toLocaleString('pt-BR')
  };

  if (existingIdx >= 0) {
    savedSites[existingIdx] = newEntry;
  } else {
    savedSites.unshift(newEntry);
  }

  localStorage.setItem('mv_saved_sites', JSON.stringify(savedSites));
  showCustomMessage(`Site "${name}" salvo com sucesso em Meus Sites!`, 'success');
}

function openProjectsModal() {
  const modal = document.getElementById('projects-modal');
  const list = document.getElementById('projects-list');
  const closeBtn = document.getElementById('close-projects-modal-button');

  if (!modal || !list) return;

  if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');

  const saved = JSON.parse(localStorage.getItem('mv_saved_sites') || '[]');
  if (saved.length === 0) {
    list.innerHTML = `<p class="text-center text-gray-400 py-6">Você ainda não tem sites salvos. Crie um e clique em "Salvar"!</p>`;
  } else {
    list.innerHTML = saved.map((s, idx) => `
      <div class="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition">
        <div>
          <h4 class="font-bold text-white text-base">${s.name}</h4>
          <span class="text-xs text-gray-400"><i class="fas fa-calendar-alt mr-1"></i> ${s.date}</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="loadSavedSite(${idx})" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-folder-open mr-1"></i> Abrir
          </button>
          <button onclick="deleteSavedSite(${idx})" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  modal.classList.remove('hidden');
}

window.loadSavedSite = function(idx) {
  const saved = JSON.parse(localStorage.getItem('mv_saved_sites') || '[]');
  if (saved[idx]) {
    updateSiteCode(saved[idx].code, true);
    document.getElementById('project-name-input').value = saved[idx].name;
    document.getElementById('projects-modal').classList.add('hidden');
    showCustomMessage(`Site "${saved[idx].name}" carregado!`, 'success');
  }
};

window.deleteSavedSite = function(idx) {
  const saved = JSON.parse(localStorage.getItem('mv_saved_sites') || '[]');
  if (confirm(`Tem certeza que deseja excluir "${saved[idx]?.name}"?`)) {
    saved.splice(idx, 1);
    localStorage.setItem('mv_saved_sites', JSON.stringify(saved));
    openProjectsModal();
    showCustomMessage('Site excluído.', 'info');
  }
};

function copySiteHtml() {
  if (!currentSiteCode) {
    showCustomMessage('Nenhum código para copiar.', 'warning');
    return;
  }
  navigator.clipboard.writeText(currentSiteCode).then(() => {
    showCustomMessage('Código HTML copiado para a área de transferência!', 'success');
  });
}

function confirmNewPage() {
  if (confirm('Deseja criar uma nova página em branco? Todo o progresso não salvo será descartado.')) {
    document.getElementById('project-name-input').value = '';
    loadDefaultWelcomeSite();
    showCustomMessage('Nova página pronta.', 'info');
  }
}

function openEmbedScriptsModal() {
  const modal = document.getElementById('embed-scripts-modal');
  const textarea = document.getElementById('script-code-input');
  const cancelBtn = document.getElementById('cancel-embed-scripts-button');
  const applyBtn = document.getElementById('apply-embed-scripts-button');

  if (!modal) return;
  textarea.value = customEmbeddedScripts;

  cancelBtn.onclick = () => modal.classList.add('hidden');
  applyBtn.onclick = () => {
    customEmbeddedScripts = textarea.value;
    updateSiteCode(injectEditorHooks(currentSiteCode), true);
    modal.classList.add('hidden');
    showCustomMessage('Scripts e Pixels aplicados!', 'success');
  };

  modal.classList.remove('hidden');
}

function downloadSiteZip() {
  if (typeof JSZip === 'undefined') {
    // Fallback: download direct HTML file
    const blob = new Blob([currentSiteCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    showCustomMessage('Arquivo index.html baixado!', 'success');
    return;
  }

  const zip = new JSZip();
  zip.file('index.html', currentSiteCode);
  zip.generateAsync({ type: 'blob' }).then(content => {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-mv-ai.zip';
    a.click();
    showCustomMessage('Pacote ZIP baixado! Pronto para publicar na Netlify ou Vercel.', 'success');
  });
}

function loadDefaultWelcomeSite() {
  const welcomeHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao MV.ai</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); box-shadow: 0 4px 25px rgba(59, 130, 246, 0.4); }
      50% { transform: scale(1.04); box-shadow: 0 6px 35px rgba(168, 85, 247, 0.6); }
    }
    .cta-pulse { animation: pulseGlow 2s infinite ease-in-out; }
  </style>
</head>
<body class="bg-gray-950 text-white min-h-screen flex flex-col justify-between">
  <!-- Navbar -->
  <nav class="flex items-center justify-between px-8 py-5 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
        <i class="fas fa-bolt text-white text-xl"></i>
      </div>
      <span class="text-2xl font-black tracking-tight text-white">MV<span class="text-blue-500">.ai</span></span>
    </div>
    <a href="#oferta" class="px-5 py-2.5 rounded-full font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-500/25">
      Começar Agora
    </a>
  </nav>

  <!-- Hero Section -->
  <section class="max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12 flex-1">
    <div class="flex-1 space-y-6 text-center lg:text-left">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
        <i class="fas fa-sparkles"></i> Inteligência Artificial de Última Geração
      </div>
      <h1 class="text-4xl sm:text-6xl font-black leading-tight tracking-tight">
        Crie Sites e Páginas de Vendas em <span class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Segundos</span>
      </h1>
      <p class="text-gray-400 text-lg sm:text-xl max-w-xl">
        Descreva seu produto ou negócio no campo abaixo e a inteligência do MV.ai cria sua página completa com design profissional, copywriting persuasivo e responsividade total.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
        <button onclick="alert('Digite no campo abaixo no MV.ai para gerar seu site!')" class="cta-pulse px-8 py-4 rounded-full font-extrabold text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-95 transition">
          <i class="fas fa-magic mr-2"></i> Gerar Minha Página
        </button>
      </div>
    </div>
    <div class="flex-1 relative">
      <div class="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-30"></div>
      <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" alt="Landing page showcase" class="relative rounded-2xl shadow-2xl border border-gray-800 w-full object-cover">
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-gray-900 py-6 text-center text-xs text-gray-500">
    © 2026 MV.ai — Todos os direitos reservados. 100% Gratuito e Ilimitado.
  </footer>
</body>
</html>`;

  updateSiteCode(welcomeHtml, false);
}

window.addEventListener('DOMContentLoaded', initDeveloper);
