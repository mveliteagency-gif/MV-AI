/**
 * MV.ai — Core Application Controller & View Routing
 */

let currentActiveView = 'developer-view';
let isTogglingMenu = false;

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
      btn.onclick = () => {
        switchView(viewId, btnId);
      };
    }
  });

  // Mobile drawer controls
  const mobileMenuBtn = document.getElementById('mobile-menu-button');
  const closeMobileMenuBtn = document.getElementById('close-mobile-menu-button');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');

  if (mobileMenuBtn) {
    mobileMenuBtn.onclick = (e) => {
      e.preventDefault();
      toggleMobileMenu();
    };
  }
  if (closeMobileMenuBtn) {
    closeMobileMenuBtn.onclick = (e) => {
      e.preventDefault();
      closeMobileMenu();
    };
  }
  if (mobileOverlay) {
    mobileOverlay.onclick = (e) => {
      e.preventDefault();
      closeMobileMenu();
    };
  }

  // Mobile Bottom Navigation Bar explicit bindings
  const bottomNavButtons = {
    'bnav-dev': 'developer-view',
    'bnav-ebook': 'infoproduct-view',
    'bnav-chat': 'chat-view',
    'bnav-creative': 'ad-creative-view'
  };

  Object.entries(bottomNavButtons).forEach(([bId, vId]) => {
    const b = document.getElementById(bId);
    if (b) {
      b.onclick = (e) => {
        e.preventDefault();
        switchView(vId, 'dev-mode-button-sidebar');
      };
    }
  });

  const bnavMenu = document.getElementById('bnav-menu');
  if (bnavMenu) {
    bnavMenu.onclick = (e) => {
      e.preventDefault();
      toggleMobileMenu();
    };
  }

  // Global Footer Prompt input routing
  const globalPromptInput = document.getElementById('prompt-input');
  const globalSendBtn = document.getElementById('send-button');

  if (globalSendBtn && globalPromptInput) {
    globalSendBtn.onclick = handleGlobalPromptSubmit;
    globalPromptInput.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGlobalPromptSubmit();
      }
    };
  }

  // Close Academy lesson modal on background click
  const academyModal = document.getElementById('academy-lesson-modal');
  if (academyModal) {
    academyModal.onclick = (e) => {
      if (e.target === academyModal) closeAcademyLessonModal();
    };
  }

  // Define view inicial padrão
  switchView('developer-view', 'dev-mode-button-sidebar');
}

function toggleMobileMenu(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  if (isTogglingMenu) return;
  isTogglingMenu = true;
  setTimeout(() => { isTogglingMenu = false; }, 250);

  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  if (!mobileNavMenu) return;

  const isOpen = mobileNavMenu.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  if (mobileNavMenu) {
    mobileNavMenu.classList.add('open');
    mobileNavMenu.style.right = '0';
    mobileNavMenu.style.pointerEvents = 'auto';
  }
  if (mobileOverlay) {
    mobileOverlay.classList.remove('hidden');
    mobileOverlay.classList.add('active');
    mobileOverlay.style.display = 'block';
    mobileOverlay.style.pointerEvents = 'auto';
  }
}

function closeMobileMenu() {
  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  if (mobileNavMenu) {
    mobileNavMenu.classList.remove('open');
    mobileNavMenu.style.right = '-320px';
    mobileNavMenu.style.pointerEvents = 'none';
  }
  if (mobileOverlay) {
    mobileOverlay.classList.add('hidden');
    mobileOverlay.classList.remove('active');
    mobileOverlay.style.display = 'none';
    mobileOverlay.style.pointerEvents = 'none';
  }
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
  const mainContent = document.getElementById('main-content');
  if (footer) {
    if (viewId === 'developer-view' || viewId === 'chat-view') {
      footer.classList.remove('hidden');
      if (mainContent) mainContent.classList.add('has-footer');
      const input = document.getElementById('prompt-input');
      if (input) {
        input.placeholder = viewId === 'developer-view'
          ? "Descreva o site ou alterações que deseja gerar com MV.ai..."
          : "Digite o que deseja criar ou perguntar aqui...";
      }
    } else {
      footer.classList.add('hidden');
      if (mainContent) mainContent.classList.remove('has-footer');
    }
  }

  // Fechar drawer no mobile se aberto
  closeMobileMenu();

  // Scroll to top of main content on view switch
  if (mainContent) mainContent.scrollTop = 0;

  // Auto-fit de E-book se for infoproduto
  if (viewId === 'infoproduct-view') {
    setTimeout(() => {
      if (typeof fitEbookPreview === 'function') fitEbookPreview();
    }, 120);
  }
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

// =========================================================================
// MV ACADEMY MASTERCLASSES DATABASE & MODAL CONTROLLER
// =========================================================================
const ACADEMY_LESSONS = {
  'lesson-ebook': {
    title: 'Como Criar e Vender E-books em 24 Horas com MV.ai',
    category: 'Infoprodutos & E-books',
    tag: 'Estratégia Express',
    readTime: '8 min de leitura',
    description: 'Aprenda o passo a passo validado para escolher um tema lucrativo, gerar o e-book com capas visuais de alta definição, cadastrar na Kiwify ou Hotmart e fazer suas primeiras vendas em menos de 24 horas.',
    steps: [
      {
        num: '1',
        title: 'Escolha de Nichos com Alta Demanda',
        text: 'Foque nos 4 grandes mercados milionários: Saúde/Fitness, Finanças/Investimentos, Negócios/Marketing e Relacionamentos/Produtividade. Use a aba "Produtos Virais" no MV.ai para verificar tendências em alta.'
      },
      {
        num: '2',
        title: 'Geração Completa com IA',
        text: 'No Gerador de E-books do MV.ai, selecione a aba "E-book Texto" para conteúdos densos de 6 a 12 capítulos ou "E-book Ilustrativo" para infográficos e guias visuais com arte em 3D de alta conversão.'
      },
      {
        num: '3',
        title: 'Design, Edição e Exportação em PDF',
        text: 'Ajuste os textos diretamente no e-book com o editor inline, escolha o tema visual (Moderno, Royal ou Oceano) e baixe o arquivo final em PDF A4 de alta definição com 1 clique.'
      },
      {
        num: '4',
        title: 'Cadastro Gratuito na Plataforma de Checkout',
        text: 'Crie sua conta na Kiwify ou Hotmart, cadastre seu novo produto como "E-book/PDF", defina o preço de oferta entre R$ 19,90 e R$ 47,00 e anexe o arquivo PDF para entrega automática.'
      },
      {
        num: '5',
        title: 'Estratégia de Tráfego Sem Gastar Nada',
        text: 'Crie 3 posts no Instagram/TikTok em formato carrossel apresentando as 3 maiores dores do seu nicho e convide as pessoas a clicarem no link da bio para baixar o e-book completo.'
      }
    ],
    prompt: 'Crie um e-book ilustrado completo sobre Como Começar no Marketing Digital do Zero e Fazer a Primeira Venda em 7 Dias, com roteiro prático e exemplos passo a passo.',
    actionText: 'Criar E-book Agora 🚀',
    actionView: 'infoproduct-view'
  },
  'lesson-landing-page': {
    title: 'Criando Landing Pages Milionárias de Alta Conversão',
    category: 'Sites & Páginas de Vendas',
    tag: 'Alta Conversão',
    readTime: '10 min de leitura',
    description: 'Construa páginas de vendas profissionais com estrutura psicológica persuasiva (AIDA), cronômetro regressivo, garantias e botões de checkout que convertem visitantes em clientes.',
    steps: [
      {
        num: '1',
        title: 'A Estrutura AIDA da Página Perfeita',
        text: 'Toda landing page vencedora possui: 1. Headline magnética que prende a atenção nos primeiros 3 segundos; 2. Vídeo de vendas ou imagem hero de impacto; 3. Lista clara de benefícios com ícones; 4. Prova social (depoimentos); 5. Oferta irresistível com preço cortado; 6. Garantia incondicional de 7 dias; 7. FAQ com perguntas frequentes.'
      },
      {
        num: '2',
        title: 'Geração do Site no MV.ai',
        text: 'Abra o Gerador de Sites do MV.ai e envie seu prompt detalhando seu produto, público-alvo e cores desejadas. A IA construirá toda a estrutura HTML, CSS moderno e scripts interativos.'
      },
      {
        num: '3',
        title: 'Edição Visual WYSIWYG',
        text: 'Clique em qualquer texto do site para editá-lo em tempo real. Adicione o link do seu checkout da Kiwify ou Hotmart diretamente nos botões "Comprar Agora".'
      },
      {
        num: '4',
        title: 'Hospedagem e Publicação em 1 Minuto',
        text: 'Clique em "Baixar Código ZIP" e hospede gratuitamente na Netlify ou Vercel arrastando a pasta do site. Em 60 segundos seu site estará online com certificado SSL seguro.'
      }
    ],
    prompt: 'Crie uma Landing Page moderna dark neon para um infoproduto digital de alta conversão, com headline chamativa, cronômetro de escassez regressivo, 3 planos de preço, depoimentos em carrossel e seção de garantia.',
    actionText: 'Criar Site Agora 🚀',
    actionView: 'developer-view'
  },
  'lesson-creatives': {
    title: 'Anúncios e Criativos Magnéticos para Instagram & TikTok',
    category: 'Tráfego Pago & Anúncios',
    tag: 'Escala de Tráfego',
    readTime: '7 min de leitura',
    description: 'Como gerar criativos em formatos Feed (1:1) e Stories (9:16) que reduzem o custo por clique (CPC) pela metade e aumentam o ROI das suas campanhas de anúncios.',
    steps: [
      {
        num: '1',
        title: 'A Regra dos Primeiros 3 Segundos',
        text: 'Mais de 80% dos usuários decidem se vão continuar assistindo ao anúncio nos primeiros 3 segundos. Use elementos visuais contrastantes, cores vivas e textos grandes de quebra de padrão.'
      },
      {
        num: '2',
        title: 'Geração de Criativos com MV.ai',
        text: 'Na aba "Gerador de Criativos", selecione a proporção (Feed 1:1 para feed ou 9:16 para Stories/Reels) e escolha estilos visuais de alto impacto como 3D Premium ou Fotorrealista.'
      },
      {
        num: '3',
        title: 'Copywriting e Chamada para Ação (CTA)',
        text: 'Utilize o Gerador de Prompts do MV.ai para redigir legendas magnéticas com ganchos fortes: "Pare de perder tempo com..." ou "O segredo que ninguém te conta sobre...".'
      },
      {
        num: '4',
        title: 'Campanha de Tráfego no Meta Ads',
        text: 'Crie uma campanha de Reconhecimento ou Vendas no Meta Ads Manager, defina orçamento diário a partir de R$ 10,00 e teste pelo menos 3 variações de criativos gerados pelo MV.ai.'
      }
    ],
    prompt: 'Criativo publicitário para Instagram Stories sobre Fórmula de Criação de E-books com IA, estética 3D render de luxo, smartphone flutuante exibindo capa dourada, iluminação cinematográfica roxa e ciano.',
    actionText: 'Gerar Criativo Agora 🚀',
    actionView: 'ad-creative-view'
  },
  'lesson-viral': {
    title: 'Mineração de Produtos Virais & Tendências Emergentes',
    category: 'Pesquisa de Mercado',
    tag: 'Tendências Validadas',
    readTime: '6 min de leitura',
    description: 'Descubra produtos e tópicos com explosão de buscas antes que fiquem saturados no mercado para criar ofertas exclusivas e faturar no primeiro ciclo.',
    steps: [
      {
        num: '1',
        title: 'Garimpagem na Aba Produtos Virais',
        text: 'Acesse a aba "Produtos Virais" no MV.ai para analisar temas em forte ascensão no Brasil e nos Estados Unidos nos últimos 30 dias.'
      },
      {
        num: '2',
        title: 'Validação de Interesse Real',
        text: 'Pesquise as hashtags relacionadas no TikTok Creative Center e no Google Trends para verificar se o interesse está em curva ascendente.'
      },
      {
        num: '3',
        title: 'Criação Imediata da Oferta',
        text: 'Assim que identificar uma tendência em crescimento, gere imediatamente o e-book ilustrativo correspondente e a landing page no MV.ai para lançar a oferta antes de todo mundo.'
      }
    ],
    prompt: 'Análise aprofundada de 5 nichos e produtos digitais mais quentes para vender no mercado brasileiro neste trimestre, com sugestões de títulos e ganchos de atração.',
    actionText: 'Explorar Tendências Virais 🚀',
    actionView: 'viral-trends-view'
  }
};

function openAcademyLesson(lessonId) {
  const lesson = ACADEMY_LESSONS[lessonId];
  if (!lesson) return;

  const modal = document.getElementById('academy-lesson-modal');
  const titleEl = document.getElementById('academy-modal-title');
  const catEl = document.getElementById('academy-modal-category');
  const readEl = document.getElementById('academy-modal-readtime');
  const bodyEl = document.getElementById('academy-modal-body');
  const actionBtn = document.getElementById('academy-modal-action-btn');

  if (titleEl) titleEl.textContent = lesson.title;
  if (catEl) catEl.textContent = lesson.category;
  if (readEl) readEl.innerHTML = `<i class="fas fa-clock mr-1"></i> ${lesson.readTime}`;

  if (bodyEl) {
    let stepsHtml = lesson.steps.map(s => `
      <div class="p-4 rounded-xl bg-gray-800/80 border border-gray-700/80 space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">${s.num}</span>
          <h4 class="font-bold text-white text-sm sm:text-base">${s.title}</h4>
        </div>
        <p class="text-xs sm:text-sm text-gray-300 leading-relaxed pl-8">${s.text}</p>
      </div>
    `).join('');

    bodyEl.innerHTML = `
      <div class="space-y-4">
        <p class="text-xs sm:text-sm text-gray-300 leading-relaxed italic bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/30">
          ${lesson.description}
        </p>

        <h3 class="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 mt-4">
          <i class="fas fa-list-check mr-1.5"></i> Passo a Passo da Aula Prática:
        </h3>
        
        <div class="space-y-3">
          ${stepsHtml}
        </div>

        <div class="p-4 rounded-xl bg-gray-900 border border-purple-500/30 space-y-2 mt-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <i class="fas fa-terminal"></i> Prompt Recomendado para esta Aula:
            </span>
            <button onclick="copyAcademyPrompt('${encodeURIComponent(lesson.prompt)}')" class="text-[11px] px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition font-medium flex items-center gap-1">
              <i class="fas fa-copy"></i> Copiar
            </button>
          </div>
          <p class="text-xs text-gray-300 font-mono bg-black/40 p-2.5 rounded-lg border border-gray-800 select-all">
            ${lesson.prompt}
          </p>
        </div>
      </div>
    `;
  }

  if (actionBtn) {
    actionBtn.innerHTML = `${lesson.actionText}`;
    actionBtn.onclick = () => {
      closeAcademyLessonModal();
      switchView(lesson.actionView, 'dev-mode-button-sidebar');
    };
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeAcademyLessonModal() {
  const modal = document.getElementById('academy-lesson-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

function copyAcademyPrompt(encodedPrompt) {
  const text = decodeURIComponent(encodedPrompt);
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showCustomMessage === 'function') {
      showCustomMessage('Prompt copiado para a área de transferência!', 'success');
    } else {
      alert('Prompt copiado!');
    }
  }).catch(() => {
    prompt('Copie o prompt:', text);
  });
}

// Global exposure for inline onclick handlers
window.toggleMobileMenu = toggleMobileMenu;
window.openMobileMenu = openMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.switchView = switchView;
window.openAcademyLesson = openAcademyLesson;
window.closeAcademyLessonModal = closeAcademyLessonModal;
window.copyAcademyPrompt = copyAcademyPrompt;

window.addEventListener('DOMContentLoaded', initApp);
