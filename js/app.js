/**
 * MV.ai — Core Application Controller & View Routing
 */

let currentActiveView = 'chat-view';

function initApp() {
  const views = {
    'chat-mode-button-sidebar': 'chat-view',
    'dev-mode-button-sidebar': 'developer-view',
    'zayron-cloner-mode-button-sidebar': 'zayron-cloner-view',
    'infoproduct-mode-button-sidebar': 'infoproduct-view',
    'viral-trends-mode-button-sidebar': 'viral-trends-view',
    'ad-creative-mode-button-sidebar': 'ad-creative-view',
    'academy-mode-button-sidebar': 'academy-view',

    // Mobile mapping
    'chat-mode-button-mobile': 'chat-view',
    'dev-mode-button-mobile': 'developer-view',
    'zayron-cloner-mode-button-mobile': 'zayron-cloner-view',
    'infoproduct-mode-button-mobile': 'infoproduct-view',
    'viral-trends-mode-button-mobile': 'viral-trends-view',
    'ad-creative-mode-button-mobile': 'ad-creative-view',
    'academy-mode-button-mobile': 'academy-view'
  };

  Object.entries(views).forEach(([btnId, viewId]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => {
        switchView(viewId, btnId);
      });
    }
  });

  // Mobile drawer
  const mobileMenuBtn = document.getElementById('mobile-menu-button');
  const closeMobileMenuBtn = document.getElementById('close-mobile-menu-button');
  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');

  if (mobileMenuBtn && mobileNavMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNavMenu.classList.add('open');
      if (mobileOverlay) mobileOverlay.classList.remove('hidden');
    });
  }

  const closeDrawer = () => {
    if (mobileNavMenu) mobileNavMenu.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.add('hidden');
  };

  if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);

  // Global Footer Prompt input routing
  const globalPromptInput = document.getElementById('prompt-input');
  const globalSendBtn = document.getElementById('send-button');

  if (globalSendBtn && globalPromptInput) {
    globalSendBtn.addEventListener('click', handleGlobalPromptSubmit);
    globalPromptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGlobalPromptSubmit();
      }
    });
  }

  // Define view inicial padrão
  switchView('developer-view', 'dev-mode-button-sidebar');
}

function switchView(viewId, activeBtnId) {
  currentActiveView = viewId;

  // Esconder todas as views
  const allViews = [
    'chat-view',
    'developer-view',
    'zayron-cloner-view',
    'infoproduct-view',
    'viral-trends-view',
    'ad-creative-view',
    'academy-view'
  ];

  allViews.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.classList.add('hidden');
  });

  // Mostrar view selecionada
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.remove('hidden');

  // Atualizar visual dos botões da sidebar
  document.querySelectorAll('#sidebar nav button').forEach(b => {
    b.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    b.classList.add('bg-gray-700', 'hover:bg-blue-600');
  });

  const activeBtn = document.getElementById(activeBtnId);
  if (activeBtn) {
    activeBtn.classList.remove('bg-gray-700');
    activeBtn.classList.add('bg-blue-600');
  }

  // Atualizar visibilidade do footer de prompt
  const footer = document.querySelector('footer');
  if (footer) {
    if (viewId === 'developer-view' || viewId === 'chat-view') {
      footer.classList.remove('hidden');
      const input = document.getElementById('prompt-input');
      if (input) {
        input.placeholder = viewId === 'developer-view'
          ? "Descreva o site ou alterações que deseja gerar com MV.ai..."
          : "Digite o que deseja criar ou perguntar aqui...";
      }
    } else {
      footer.classList.add('hidden');
    }
  }

  // Fechar drawer no mobile se aberto
  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  if (mobileNavMenu) mobileNavMenu.classList.remove('open');
  if (mobileOverlay) mobileOverlay.classList.add('hidden');
}

function handleGlobalPromptSubmit() {
  const input = document.getElementById('prompt-input');
  if (!input) return;
  const prompt = input.value.trim();
  if (!prompt) return;

  if (currentActiveView === 'chat-view') {
    handleSendChatMessage();
  } else if (currentActiveView === 'developer-view') {
    input.value = '';
    generateSiteFromPrompt(prompt);
  }
}

window.addEventListener('DOMContentLoaded', initApp);
