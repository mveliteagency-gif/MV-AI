/**
 * MV.ai — Core Application Controller & View Routing
 */

let currentActiveView = 'developer-view';

function initApp() {
  const views = {
    'chat-mode-button-sidebar': 'chat-view',
    'dev-mode-button-sidebar': 'developer-view',
    'zayron-cloner-mode-button-sidebar': 'zayron-cloner-view',
    'infoproduct-mode-button-sidebar': 'infoproduct-view',
    'viral-trends-mode-button-sidebar': 'viral-trends-view',
    'ad-creative-mode-button-sidebar': 'ad-creative-view',
    'academy-mode-button-sidebar': 'academy-view',

    // Mobile Drawer buttons
    'dev-mode-button-drawer': 'developer-view',
    'infoproduct-mode-button-drawer': 'infoproduct-view',
    'zayron-cloner-mode-button-drawer': 'zayron-cloner-view',
    'chat-mode-button-drawer': 'chat-view',
    'ad-creative-mode-button-drawer': 'ad-creative-view',
    'viral-trends-mode-button-drawer': 'viral-trends-view',
    'academy-mode-button-drawer': 'academy-view'
  };

  Object.entries(views).forEach(([btnId, viewId]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => {
        switchView(viewId, btnId);
      });
    }
  });

  // Mobile drawer controls
  const mobileMenuBtn = document.getElementById('mobile-menu-button');
  const closeMobileMenuBtn = document.getElementById('close-mobile-menu-button');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  if (closeMobileMenuBtn) {
    closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

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

function toggleMobileMenu() {
  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  if (!mobileNavMenu) return;

  const isOpen = mobileNavMenu.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    mobileNavMenu.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.remove('hidden');
  }
}

function closeMobileMenu() {
  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  if (mobileNavMenu) mobileNavMenu.classList.remove('open');
  if (mobileOverlay) mobileOverlay.classList.add('hidden');
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

  // Atualizar botões da barra superior mobile (mobile-tab-bar)
  const tabMapping = {
    'developer-view': 'Sites',
    'infoproduct-view': 'E-book',
    'zayron-cloner-view': 'Clonador',
    'chat-view': 'Prompts',
    'ad-creative-view': 'Criativos',
    'viral-trends-view': 'Viral',
    'academy-view': 'Academy'
  };

  document.querySelectorAll('.mobile-tab-btn').forEach(tab => {
    const text = tab.innerText.trim();
    if (text.includes(tabMapping[viewId])) {
      tab.classList.add('mobile-tab-active');
      tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    } else {
      tab.classList.remove('mobile-tab-active');
    }
  });

  // Atualizar visual da barra de navegação inferior mobile (mobile-bottom-nav)
  const bottomNavMap = {
    'developer-view': 'bnav-dev',
    'infoproduct-view': 'bnav-ebook',
    'chat-view': 'bnav-chat',
    'ad-creative-view': 'bnav-creative'
  };

  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeBNavId = bottomNavMap[viewId];
  if (activeBNavId) {
    const activeBNav = document.getElementById(activeBNavId);
    if (activeBNav) activeBNav.classList.add('active');
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
  closeMobileMenu();

  // Scroll to top of main content on view switch
  const mainContent = document.getElementById('main-content');
  if (mainContent) mainContent.scrollTop = 0;
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

// Global exposure for inline onclick handlers
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.switchView = switchView;

window.addEventListener('DOMContentLoaded', initApp);
