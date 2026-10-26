/**
 * MV.ai — Clonador de Sites (Cloner View)
 */

let clonerCurrentCode = '';
let clonerHistory = [];
let clonerHistoryPointer = -1;
let clonerSelectedElement = null;

function initCloner() {
  const cloneBtn = document.getElementById('clone-site-button');
  const tabUrl = document.getElementById('cloner-tab-url');
  const tabHtml = document.getElementById('cloner-tab-html');
  const urlContainer = document.getElementById('cloner-url-container');
  const htmlContainer = document.getElementById('cloner-html-container');
  const iframe = document.getElementById('cloner-preview-iframe');

  // Preview devices
  const dBtn = document.getElementById('cloner-preview-desktop-button');
  const tBtn = document.getElementById('cloner-preview-tablet-button');
  const mBtn = document.getElementById('cloner-preview-mobile-button');

  if (dBtn) dBtn.addEventListener('click', () => setClonerDevice('desktop'));
  if (tBtn) tBtn.addEventListener('click', () => setClonerDevice('tablet'));
  if (mBtn) mBtn.addEventListener('click', () => setClonerDevice('mobile'));

  // Tabs
  if (tabUrl && tabHtml) {
    tabUrl.addEventListener('click', () => {
      tabUrl.classList.add('bg-blue-600', 'text-white');
      tabUrl.classList.remove('text-gray-400');
      tabHtml.classList.remove('bg-blue-600', 'text-white');
      tabHtml.classList.add('text-gray-400');
      urlContainer.classList.remove('hidden');
      htmlContainer.classList.add('hidden');
    });

    tabHtml.addEventListener('click', () => {
      tabHtml.classList.add('bg-blue-600', 'text-white');
      tabHtml.classList.remove('text-gray-400');
      tabUrl.classList.remove('bg-blue-600', 'text-white');
      tabUrl.classList.add('text-gray-400');
      htmlContainer.classList.remove('hidden');
      urlContainer.classList.add('hidden');
    });
  }

  // Clone button
  if (cloneBtn) {
    cloneBtn.addEventListener('click', handleCloneSite);
  }

  // Action buttons
  const copyBtn = document.getElementById('cloner-copy-html-button');
  const saveBtn = document.getElementById('cloner-save-project-button');
  const mySitesBtn = document.getElementById('cloner-my-projects-dev-button');
  const editModeBtn = document.getElementById('cloner-toggle-edit-mode-button');
  const undoBtn = document.getElementById('cloner-preview-undo-button');
  const redoBtn = document.getElementById('cloner-preview-redo-button');
  const newPageBtn = document.getElementById('cloner-new-page-button');

  if (copyBtn) copyBtn.addEventListener('click', () => {
    if (clonerCurrentCode) {
      navigator.clipboard.writeText(clonerCurrentCode);
      showCustomMessage('HTML clonado copiado!', 'success');
    }
  });

  if (saveBtn) saveBtn.addEventListener('click', () => {
    const name = document.getElementById('cloner-project-name-input')?.value || `Site Clonado - ${new Date().toLocaleDateString('pt-BR')}`;
    const saved = JSON.parse(localStorage.getItem('mv_saved_sites') || '[]');
    saved.unshift({
      id: 'clone_' + Date.now(),
      name: name,
      code: clonerCurrentCode,
      date: new Date().toLocaleString('pt-BR')
    });
    localStorage.setItem('mv_saved_sites', JSON.stringify(saved));
    showCustomMessage(`Site "${name}" salvo em Meus Sites!`, 'success');
  });

  if (mySitesBtn) mySitesBtn.addEventListener('click', openProjectsModal);

  // Transfer to Developer View for advanced AI editing
  if (editModeBtn) {
    editModeBtn.addEventListener('click', () => {
      if (!clonerCurrentCode) {
        showCustomMessage('Clone ou cole um site primeiro.', 'warning');
        return;
      }
      updateSiteCode(clonerCurrentCode, true);
      document.getElementById('dev-mode-button-sidebar')?.click();
      showCustomMessage('Site transferido para o Gerador de Sites! Você pode editá-lo com IA ou visualmente.', 'success');
    });
  }

  if (undoBtn) undoBtn.addEventListener('click', () => navigateClonerHistory(-1));
  if (redoBtn) redoBtn.addEventListener('click', () => navigateClonerHistory(1));
  if (newPageBtn) newPageBtn.addEventListener('click', () => {
    document.getElementById('cloner-url-input').value = '';
    document.getElementById('cloner-html-input').value = '';
    updateClonerCode('<!DOCTYPE html><html><body style="background:#111;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;"><h2>Insira uma URL ou cole HTML para clonar</h2></body></html>', false);
  });
}

function setClonerDevice(device) {
  const iframe = document.getElementById('cloner-preview-iframe');
  const buttons = {
    desktop: document.getElementById('cloner-preview-desktop-button'),
    tablet: document.getElementById('cloner-preview-tablet-button'),
    mobile: document.getElementById('cloner-preview-mobile-button')
  };
  Object.values(buttons).forEach(b => b?.classList.remove('active'));
  buttons[device]?.classList.add('active');

  if (device === 'desktop') iframe.style.maxWidth = '100%';
  else if (device === 'tablet') iframe.style.maxWidth = '768px';
  else if (device === 'mobile') iframe.style.maxWidth = '425px';
}

async function handleCloneSite() {
  const urlInput = document.getElementById('cloner-url-input');
  const htmlInput = document.getElementById('cloner-html-input');
  const isHtmlTab = !document.getElementById('cloner-html-container').classList.contains('hidden');

  if (isHtmlTab) {
    const rawHtml = htmlInput.value.trim();
    if (!rawHtml) {
      showCustomMessage('Cole o código HTML no campo.', 'warning');
      return;
    }
    updateClonerCode(rawHtml, true);
    showCustomMessage('HTML carregado com sucesso na pré-visualização!', 'success');
    return;
  }

  // Via URL
  let targetUrl = urlInput.value.trim();
  if (!targetUrl) {
    showCustomMessage('Informe a URL do site a ser clonado.', 'warning');
    return;
  }
  if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

  showLoading('MV.ai está clonando o site...');

  // Proxies CORS para garantir clonagem sem bloqueios
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
  ];

  let clonedHtml = '';
  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy);
      if (res.ok) {
        clonedHtml = await res.text();
        if (clonedHtml && clonedHtml.length > 100) break;
      }
    } catch (e) {
      console.warn("Proxy failed, trying next...", e);
    }
  }

  hideLoading();

  if (clonedHtml) {
    // Normalizar caminhos relativos para absolutos usando a tag <base>
    const baseTag = `<base href="${targetUrl}">`;
    if (clonedHtml.includes('<head>')) {
      clonedHtml = clonedHtml.replace('<head>', `<head>\n${baseTag}`);
    } else {
      clonedHtml = baseTag + clonedHtml;
    }

    updateClonerCode(clonedHtml, true);
    showCustomMessage('Site clonado com sucesso! Você pode editá-lo ou transferir para o Gerador.', 'success');
  } else {
    showCustomMessage('Não foi possível obter o código via URL devido a proteções do site. Use a aba "Colar HTML" como alternativa.', 'error');
  }
}

function updateClonerCode(code, pushToHistory = true) {
  clonerCurrentCode = code;
  const iframe = document.getElementById('cloner-preview-iframe');
  if (iframe) iframe.srcdoc = code;

  if (pushToHistory) {
    if (clonerHistoryPointer < clonerHistory.length - 1) {
      clonerHistory.splice(clonerHistoryPointer + 1);
    }
    clonerHistory.push(code);
    clonerHistoryPointer = clonerHistory.length - 1;

    const undoBtn = document.getElementById('cloner-preview-undo-button');
    const redoBtn = document.getElementById('cloner-preview-redo-button');
    if (undoBtn) undoBtn.disabled = clonerHistoryPointer <= 0;
    if (redoBtn) redoBtn.disabled = clonerHistoryPointer >= clonerHistory.length - 1;
  }
}

function navigateClonerHistory(dir) {
  const newPointer = clonerHistoryPointer + dir;
  if (newPointer >= 0 && newPointer < clonerHistory.length) {
    clonerHistoryPointer = newPointer;
    updateClonerCode(clonerHistory[clonerHistoryPointer], false);

    const undoBtn = document.getElementById('cloner-preview-undo-button');
    const redoBtn = document.getElementById('cloner-preview-redo-button');
    if (undoBtn) undoBtn.disabled = clonerHistoryPointer <= 0;
    if (redoBtn) redoBtn.disabled = clonerHistoryPointer >= clonerHistory.length - 1;
  }
}

window.addEventListener('DOMContentLoaded', initCloner);
