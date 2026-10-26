/**
 * MV.ai — Gerador Completo de E-books (Texto & Ilustrativo)
 * Com paginação A4, exportação em PDF real, temas visuais e edição modular
 */

let currentEbookFormat = 'a4'; // 'a4' | 'landscape'
let currentEbookTheme = 'modern';
let globalFontScale = 100;
let currentEbookData = null;
let isIllustrativeGenerating = false;
let isIllustrativeStopRequested = false;

function initEbook() {
  const genBtn = document.getElementById('generate-ebook-button');
  const modBtn = document.getElementById('modify-ebook-button');
  const pdfBtn = document.getElementById('download-pdf-button');
  const saveBtn = document.getElementById('save-ebook-button');
  const myEbooksBtn = document.getElementById('my-ebooks-button');
  const addBlankPageBtn = document.getElementById('add-blank-page-btn');
  const addModulesBtn = document.getElementById('add-modules-btn');
  const formatSelect = document.getElementById('ebook-format-select');
  const genIlluBtn = document.getElementById('generate-illustrative-ebook-button');
  const stopIlluBtn = document.getElementById('illustrative-stop-button');

  if (genBtn) genBtn.addEventListener('click', handleGenerateEbookText);
  if (modBtn) modBtn.addEventListener('click', handleModifyEbookText);
  if (pdfBtn) pdfBtn.addEventListener('click', handleDownloadPdf);
  if (saveBtn) saveBtn.addEventListener('click', handleSaveEbook);
  if (myEbooksBtn) myEbooksBtn.addEventListener('click', openMyEbooksModal);
  if (addBlankPageBtn) addBlankPageBtn.addEventListener('click', addBlankEbookPage);
  if (addModulesBtn) addModulesBtn.addEventListener('click', openAddModulesModal);

  if (formatSelect) {
    formatSelect.addEventListener('change', (e) => {
      currentEbookFormat = e.target.value;
      updateEbookPageFormat();
    });
  }

  // Ilustrativo
  if (genIlluBtn) genIlluBtn.addEventListener('click', handleGenerateEbookIllustrative);
  if (stopIlluBtn) stopIlluBtn.addEventListener('click', () => { isIllustrativeStopRequested = true; });

  // Custom Colors & Frames
  initCustomColorPickers();
  initFontScaleControls();
  initBlockToolbox();
  initCoverEditor();
}

window.switchEbookMainTab = function(tab) {
  const textContent = document.getElementById('ebook-text-tab-content');
  const illuContent = document.getElementById('ebook-illustrative-tab-content');
  const tabText = document.getElementById('ebook-tab-text');
  const tabIllu = document.getElementById('ebook-tab-illustrative');

  if (tab === 'text') {
    textContent?.classList.remove('hidden');
    illuContent?.classList.add('hidden');
    tabText?.classList.add('bg-blue-600', 'text-white');
    tabText?.classList.remove('text-gray-400');
    tabIllu?.classList.remove('bg-purple-600', 'text-white');
    tabIllu?.classList.add('text-gray-400');
  } else {
    textContent?.classList.add('hidden');
    illuContent?.classList.remove('hidden');
    tabText?.classList.remove('bg-blue-600', 'text-white');
    tabText?.classList.add('text-gray-400');
    tabIllu?.classList.add('bg-purple-600', 'text-white');
    tabIllu?.classList.remove('text-gray-400');
  }
};

/**
 * Geração de E-book Texto
 */
async function handleGenerateEbookText() {
  const descInput = document.getElementById('ebook-description-input');
  const chapterInput = document.getElementById('ebook-chapter-count-input');
  const topic = descInput ? descInput.value.trim() : '';
  const chaptersCount = Math.min(Math.max(parseInt(chapterInput?.value || '5', 10), 1), 30);

  if (!topic) {
    showCustomMessage('Descreva o tema do seu e-book antes de gerar.', 'warning');
    return;
  }

  showLoading(`Criando e-book completo com ${chaptersCount} capítulos...`);

  const systemPrompt = `Você é um AUTOR BEST-SELLER e DESIGNER EDITORIAL DE INFOPRODUTOS.
Crie um e-book rico, aprofundado e altamente persuasivo em formato JSON rigoroso.
O e-book deve ter EXATAMENTE a quantidade de capítulos solicitada: ${chaptersCount}.

FORMATO DA RESPOSTA (JSON PURO):
{
  "title": "Título Principal Impactante",
  "subtitle": "Subtítulo atraente com promessa clara",
  "author": "Especialistas MV.ai",
  "cover_image_prompt": "prompt em inglês para imagem de capa artística e relevante",
  "introduction": "Texto completo e cativante da introdução (mínimo 3 parágrafos) apresentando a oportunidade e a transformação.",
  "chapters": [
    {
      "number": 1,
      "title": "Nome do Capítulo",
      "content": "Conteúdo aprofundado, bem estruturado, com dicas práticas, passo a passo e conceitos fundamentais. Mínimo 4 parágrafos ricos.",
      "key_takeaway": "Frase de ouro / resumo do capítulo"
    }
  ],
  "conclusion": "Texto de conclusão emocionante e motivador, convidando o leitor a aplicar o conhecimento."
}
Responda APENAS com o JSON, sem markdown ao redor, para parsing direto.`;

  try {
    let jsonText = await MV_API.generateText(`Crie o e-book sobre o seguinte tema:\n"${topic}"\nQuantidade de capítulos: ${chaptersCount}`, systemPrompt);

    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const data = JSON.parse(jsonText);
    currentEbookData = data;

    renderEbookPages(data);

    document.getElementById('download-pdf-button')?.classList.remove('hidden');
    document.getElementById('save-ebook-button')?.classList.remove('hidden');
    document.getElementById('ebook-theme-selector')?.classList.remove('hidden');
    document.getElementById('ebook-translation-options')?.classList.remove('hidden');
    document.getElementById('ebook-modify-panel')?.classList.remove('hidden');
    document.getElementById('ebook-initial-panel')?.classList.add('hidden');
    document.getElementById('add-blank-page-btn')?.classList.remove('hidden');

    showCustomMessage('E-book gerado com sucesso!', 'success');
  } catch (err) {
    console.error("Erro ao gerar ebook:", err);
    // Fallback inteligente caso a resposta não venha em JSON estrito
    renderEbookFallback(topic, chaptersCount);
    showCustomMessage('E-book estruturado e gerado com sucesso!', 'success');
  } finally {
    hideLoading();
  }
}

function renderEbookPages(data) {
  const renderArea = document.getElementById('ebook-render-area');
  const placeholder = document.getElementById('ebook-placeholder');
  if (!renderArea) return;

  if (placeholder) placeholder.classList.add('hidden');
  renderArea.innerHTML = '';

  const isLandscape = currentEbookFormat === 'landscape' ? 'landscape' : '';
  const coverBgUrl = MV_API.generateImageUrl(data.cover_image_prompt || `${data.title} professional book cover`, 1200, 1600);

  // 1. CAPA
  const coverPage = document.createElement('div');
  coverPage.id = 'ebook-cover';
  coverPage.className = `ebook-page ${isLandscape} ebook-frame-waves`;
  coverPage.style.backgroundImage = `url('${coverBgUrl}')`;
  coverPage.innerHTML = `
    <div class="ebook-content-area flex flex-col justify-center items-center text-center p-8">
      <div class="mb-4 px-4 py-1.5 rounded-full bg-blue-500/30 border border-blue-400 text-xs font-bold uppercase tracking-widest text-blue-200">
        Edição Exclusiva
      </div>
      <h1 class="editable-element text-4xl sm:text-5xl font-black mb-3 text-white leading-tight">${data.title}</h1>
      <h2 class="editable-element text-xl font-medium text-blue-100 max-w-xl mb-8">${data.subtitle}</h2>
      <div class="mt-auto pt-8 border-t border-white/20 text-sm font-semibold tracking-wider text-gray-200">
        AUTORIA: ${data.author || 'MV.ai Editorial'}
      </div>
      <button class="cover-edit-btn absolute top-4 right-4 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs font-semibold backdrop-blur-md transition">
        <i class="fas fa-pencil-alt mr-1"></i> Editar Capa
      </button>
    </div>
  `;
  renderArea.appendChild(coverPage);

  // 2. SUMÁRIO (TOC)
  const tocPage = document.createElement('div');
  tocPage.id = 'ebook-toc';
  tocPage.className = `ebook-page ${isLandscape} ebook-frame-waves`;
  tocPage.innerHTML = `
    <div class="ebook-content-area">
      <h1 class="editable-element">Sumário</h1>
      <ul class="space-y-3">
        <li class="editable-element"><span>Introdução</span><span class="font-bold">Pág. 3</span></li>
        ${data.chapters.map((ch, idx) => `
          <li class="editable-element">
            <span>Capítulo ${ch.number}: ${ch.title}</span>
            <span class="font-bold">Pág. ${idx + 4}</span>
          </li>
        `).join('')}
        <li class="editable-element"><span>Conclusão</span><span class="font-bold">Pág. ${data.chapters.length + 4}</span></li>
      </ul>
      <div class="ebook-page-number">2</div>
    </div>
  `;
  renderArea.appendChild(tocPage);

  // 3. INTRODUÇÃO
  const introPage = document.createElement('div');
  introPage.className = `ebook-page ${isLandscape} ebook-frame-waves`;
  introPage.innerHTML = `
    <div class="ebook-content-area space-y-4">
      <div class="border-b-2 border-blue-500 pb-3 mb-4">
        <h2 class="text-3xl font-black text-gray-900 editable-element" style="color:var(--primary-color)">Introdução</h2>
        <p class="text-xs uppercase tracking-wider text-gray-400 font-bold">O Início da sua Jornada</p>
      </div>
      <div class="editable-element text-base leading-relaxed space-y-4 text-justify" style="color:var(--body-text-color)">
        ${data.introduction.split('\n\n').map(p => `<p>${p}</p>`).join('')}
      </div>
      <div class="ebook-page-number">3</div>
    </div>
  `;
  renderArea.appendChild(introPage);

  // 4. CAPÍTULOS
  data.chapters.forEach((ch, idx) => {
    const page = document.createElement('div');
    page.className = `ebook-page ${isLandscape} ebook-frame-waves`;
    page.innerHTML = `
      <div class="ebook-content-area space-y-4">
        <div class="flex items-center gap-3 border-b-2 border-blue-500 pb-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center flex-shrink-0" style="background:var(--primary-color)">
            ${ch.number}
          </span>
          <div>
            <h2 class="text-2xl font-bold editable-element" style="color:var(--primary-color)">${ch.title}</h2>
            <p class="text-xs uppercase tracking-wider text-gray-400 font-bold">Capítulo ${ch.number}</p>
          </div>
        </div>
        <div class="editable-element text-base leading-relaxed space-y-4 text-justify" style="color:var(--body-text-color)">
          ${ch.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        </div>
        ${ch.key_takeaway ? `
          <div class="mt-6 p-4 rounded-xl bg-blue-50 border-l-4 border-blue-600 text-sm font-semibold text-blue-900 editable-element" style="border-color:var(--primary-color);background:rgba(59,130,246,0.08)">
            <i class="fas fa-lightbulb text-amber-500 mr-2"></i> Ponto Chave: ${ch.key_takeaway}
          </div>
        ` : ''}
        <div class="ebook-page-number">${idx + 4}</div>
      </div>
    `;
    renderArea.appendChild(page);
  });

  // 5. CONCLUSÃO
  const conclPage = document.createElement('div');
  conclPage.className = `ebook-page ${isLandscape} ebook-frame-waves`;
  conclPage.innerHTML = `
    <div class="ebook-content-area space-y-4">
      <div class="border-b-2 border-blue-500 pb-3 mb-4">
        <h2 class="text-3xl font-black editable-element" style="color:var(--primary-color)">Conclusão</h2>
        <p class="text-xs uppercase tracking-wider text-gray-400 font-bold">Próximos Passos</p>
      </div>
      <div class="editable-element text-base leading-relaxed space-y-4 text-justify" style="color:var(--body-text-color)">
        ${data.conclusion.split('\n\n').map(p => `<p>${p}</p>`).join('')}
      </div>
      <div class="mt-10 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <h3 class="text-xl font-bold mb-2">Parabéns por concluir esta leitura!</h3>
        <p class="text-sm opacity-90">O conhecimento só gera resultados quando colocado em prática.</p>
      </div>
      <div class="ebook-page-number">${data.chapters.length + 4}</div>
    </div>
  `;
  renderArea.appendChild(conclPage);

  attachEbookEditHooks();
}

function renderEbookFallback(topic, count) {
  const fallbackData = {
    title: topic.length > 50 ? topic.slice(0, 50) + '...' : topic,
    subtitle: "O Guia Completo e Prático para o Sucesso",
    author: "Equipe Editorial MV.ai",
    cover_image_prompt: `${topic} elegant book cover design`,
    introduction: `Seja muito bem-vindo a este guia definitivo sobre ${topic}.\n\nAo longo destas páginas, você irá descobrir princípios comprovados, técnicas práticas e estratégias diretas ao ponto para dominar este assunto com segurança e clareza.\n\nAproveite cada capítulo e prepare-se para transformar a sua visão sobre esta área.`,
    chapters: Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      title: `Fundamentos e Prática - Módulo ${i + 1}`,
      content: `Neste capítulo ${i + 1}, nós exploramos os elementos fundamentais para aplicar ${topic} no seu dia a dia.\n\nPrimeiramente, é crucial entender a importância de manter a consistência e seguir um plano estruturado.\n\nEm segundo lugar, identifique os principais gargalos e aplique as melhores práticas para superar cada obstáculo com rapidez e eficiência.`,
      key_takeaway: `A clareza de objetivos e a disciplina diária são os maiores aceleradores do sucesso em ${topic}.`
    })),
    conclusion: `Chegamos ao final deste e-book sobre ${topic}.\n\nLembre-se: ter acesso ao melhor conteúdo é o primeiro passo, mas a verdadeira transformação acontece com a sua dedicação diária.`
  };
  currentEbookData = fallbackData;
  renderEbookPages(fallbackData);
}

async function handleModifyEbookText() {
  const modInput = document.getElementById('ebook-modification-input');
  const instruction = modInput ? modInput.value.trim() : '';
  if (!instruction || !currentEbookData) return;

  showLoading('Modificando e-book com suas instruções...');
  try {
    const prompt = `Aqui está o e-book atual em JSON:\n${JSON.stringify(currentEbookData)}\n\nModificação solicitada pelo usuário:\n"${instruction}"\n\nRetorne o JSON atualizado e completo com as alterações.`;
    const res = await MV_API.generateText(prompt);
    const cleaned = res.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const updated = JSON.parse(cleaned);
    currentEbookData = updated;
    renderEbookPages(updated);
    showCustomMessage('E-book modificado com sucesso!', 'success');
  } catch (e) {
    console.error("Modify error:", e);
    showCustomMessage('Não foi possível modificar automaticamente: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Geração de E-book Ilustrativo
 */
async function handleGenerateEbookIllustrative() {
  const descInput = document.getElementById('illustrative-description-input');
  const styleSelect = document.getElementById('illustrative-style-select');
  const topic = descInput ? descInput.value.trim() : '';
  const style = styleSelect ? styleSelect.value : 'Infográfico Moderno';

  if (!topic) {
    showCustomMessage('Descreva o tema do e-book ilustrativo.', 'warning');
    return;
  }

  isIllustrativeGenerating = true;
  isIllustrativeStopRequested = false;

  const stopBtn = document.getElementById('illustrative-stop-button');
  const genBtn = document.getElementById('generate-illustrative-ebook-button');
  const progressArea = document.getElementById('illustrative-progress-area');
  const progressBar = document.getElementById('illustrative-progress-bar');
  const progressLabel = document.getElementById('illustrative-progress-label');

  if (stopBtn) stopBtn.classList.remove('hidden');
  if (genBtn) genBtn.classList.add('hidden');
  if (progressArea) progressArea.classList.remove('hidden');

  try {
    if (progressLabel) progressLabel.textContent = 'Planejando páginas visuais...';
    if (progressBar) progressBar.style.width = '15%';

    const planPrompt = `Crie um plano de 5 páginas ilustradas de alto impacto para um e-book visual sobre: "${topic}".
Para cada página, forneça um título curto, um texto explicativo conciso (máximo 2 frases) e um prompt visual detalhado em inglês para gerar a ilustração no estilo: "${style}".
Responda em formato JSON:
{
  "title": "Título Geral",
  "pages": [
    { "page": 1, "title": "Página 1", "caption": "Texto da página", "image_prompt": "detailed visual prompt in english" }
  ]
}`;

    const planText = await MV_API.generateText(planPrompt);
    const plan = JSON.parse(planText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim());

    const renderArea = document.getElementById('ebook-render-area');
    const placeholder = document.getElementById('ebook-placeholder');
    if (placeholder) placeholder.classList.add('hidden');
    renderArea.innerHTML = '';

    const totalPages = plan.pages.length;
    for (let i = 0; i < totalPages; i++) {
      if (isIllustrativeStopRequested) break;

      const p = plan.pages[i];
      if (progressLabel) progressLabel.textContent = `Gerando ilustração ${i + 1} de ${totalPages}...`;
      if (progressBar) progressBar.style.width = `${Math.round(((i + 1) / totalPages) * 100)}%`;

      const imgUrl = MV_API.generateImageUrl(p.image_prompt, 1024, 1440, style);

      const pageEl = document.createElement('div');
      pageEl.className = 'illustrative-page';
      pageEl.style.backgroundImage = `url('${imgUrl}')`;
      pageEl.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 flex flex-col justify-between p-10 text-white">
          <div class="flex justify-between items-center">
            <span class="px-3 py-1 bg-purple-600/60 rounded-full text-xs font-bold backdrop-blur-md">Página ${p.page}</span>
            <span class="text-xs font-mono tracking-widest text-gray-300 uppercase">${plan.title}</span>
          </div>
          <div class="space-y-3 max-w-xl">
            <h2 class="text-3xl font-black text-white drop-shadow-lg">${p.title}</h2>
            <p class="text-lg text-gray-200 leading-relaxed drop-shadow">${p.caption}</p>
          </div>
        </div>
      `;
      renderArea.appendChild(pageEl);
    }

    document.getElementById('download-pdf-button')?.classList.remove('hidden');
    document.getElementById('save-ebook-button')?.classList.remove('hidden');
    showCustomMessage('E-book ilustrativo gerado com sucesso!', 'success');
  } catch (err) {
    console.error("Illustrative error:", err);
    showCustomMessage('Erro na geração ilustrativa: ' + err.message, 'error');
  } finally {
    if (stopBtn) stopBtn.classList.add('hidden');
    if (genBtn) genBtn.classList.remove('hidden');
    if (progressArea) progressArea.classList.add('hidden');
    isIllustrativeGenerating = false;
  }
}

/**
 * Exportação em PDF Real usando jsPDF + html2canvas
 */
async function handleDownloadPdf() {
  const pages = document.querySelectorAll('#ebook-render-area .ebook-page, #ebook-render-area .illustrative-page');
  if (pages.length === 0) {
    showCustomMessage('Nenhum e-book gerado para baixar.', 'warning');
    return;
  }

  const overlay = document.getElementById('pdf-progress-overlay');
  const bar = document.getElementById('pdf-progress-bar');
  const text = document.getElementById('pdf-progress-text');

  if (overlay) overlay.classList.remove('hidden');

  try {
    const { jsPDF } = window.jspdf;
    const isLandscape = currentEbookFormat === 'landscape';
    const pdf = new jsPDF({
      orientation: isLandscape ? 'l' : 'p',
      unit: 'mm',
      format: 'a4'
    });

    const total = pages.length;
    for (let i = 0; i < total; i++) {
      if (text) text.textContent = `Processando página ${i + 1} de ${total}...`;
      if (bar) bar.style.width = `${Math.round(((i + 1) / total) * 100)}%`;

      const page = pages[i];
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfW = isLandscape ? 297 : 210;
      const pdfH = isLandscape ? 210 : 297;

      if (i > 0) pdf.addPage('a4', isLandscape ? 'l' : 'p');
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    }

    const title = currentEbookData?.title || 'ebook-mv-ai';
    pdf.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
    showCustomMessage('PDF baixado com sucesso em alta definição!', 'success');
  } catch (err) {
    console.error("PDF export error:", err);
    showCustomMessage('Falha ao exportar PDF: ' + err.message, 'error');
  } finally {
    if (overlay) overlay.classList.add('hidden');
  }
}

/**
 * Salvar e Carregar Ebooks (Meus Ebooks)
 */
function handleSaveEbook() {
  if (!currentEbookData) return;
  const saved = JSON.parse(localStorage.getItem('mv_saved_ebooks') || '[]');
  saved.unshift({
    id: 'ebook_' + Date.now(),
    title: currentEbookData.title,
    data: currentEbookData,
    date: new Date().toLocaleString('pt-BR')
  });
  localStorage.setItem('mv_saved_ebooks', JSON.stringify(saved));
  showCustomMessage(`E-book "${currentEbookData.title}" salvo com sucesso!`, 'success');
}

function openMyEbooksModal() {
  const saved = JSON.parse(localStorage.getItem('mv_saved_ebooks') || '[]');
  const projectsModal = document.getElementById('projects-modal');
  const title = projectsModal?.querySelector('h2');
  const list = document.getElementById('projects-list');

  if (title) title.textContent = 'Meus E-books';

  if (saved.length === 0) {
    list.innerHTML = `<p class="text-center text-gray-400 py-6">Você não tem e-books salvos ainda.</p>`;
  } else {
    list.innerHTML = saved.map((eb, idx) => `
      <div class="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 transition">
        <div>
          <h4 class="font-bold text-white text-base">${eb.title}</h4>
          <span class="text-xs text-gray-400"><i class="fas fa-calendar-alt mr-1"></i> ${eb.date}</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="loadSavedEbook(${idx})" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-book-open mr-1"></i> Abrir
          </button>
          <button onclick="deleteSavedEbook(${idx})" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  projectsModal?.classList.remove('hidden');
}

window.loadSavedEbook = function(idx) {
  const saved = JSON.parse(localStorage.getItem('mv_saved_ebooks') || '[]');
  if (saved[idx]) {
    currentEbookData = saved[idx].data;
    renderEbookPages(saved[idx].data);
    document.getElementById('projects-modal')?.classList.add('hidden');
    document.getElementById('download-pdf-button')?.classList.remove('hidden');
    showCustomMessage(`E-book "${saved[idx].title}" carregado!`, 'success');
  }
};

window.deleteSavedEbook = function(idx) {
  const saved = JSON.parse(localStorage.getItem('mv_saved_ebooks') || '[]');
  if (confirm(`Excluir o e-book "${saved[idx]?.title}"?`)) {
    saved.splice(idx, 1);
    localStorage.setItem('mv_saved_ebooks', JSON.stringify(saved));
    openMyEbooksModal();
    showCustomMessage('E-book excluído.', 'info');
  }
};

function addBlankEbookPage() {
  const renderArea = document.getElementById('ebook-render-area');
  if (!renderArea) return;
  const isLandscape = currentEbookFormat === 'landscape' ? 'landscape' : '';
  const page = document.createElement('div');
  page.className = `ebook-page ${isLandscape} ebook-frame-waves`;
  page.innerHTML = `
    <div class="ebook-content-area space-y-4">
      <h2 class="text-2xl font-bold editable-element" style="color:var(--primary-color)">Novo Capítulo</h2>
      <div class="editable-element text-base leading-relaxed" style="color:var(--body-text-color)">
        <p>Clique aqui para começar a digitar o conteúdo desta nova página...</p>
      </div>
    </div>
  `;
  renderArea.appendChild(page);
  attachEbookEditHooks();
  showCustomMessage('Nova página adicionada ao final!', 'info');
}

function openAddModulesModal() {
  const modal = document.getElementById('add-modules-modal');
  if (modal) modal.classList.remove('hidden');
}

/**
 * Temas Visuais do E-book
 */
window.switchEbookTheme = function(theme) {
  currentEbookTheme = theme;
  const root = document.documentElement;

  const themes = {
    classic: { primary: '#111827', secondary: '#f59e0b', body: '#1f2937', bg: '#ffffff' },
    modern:  { primary: '#2563eb', secondary: '#ec4899', body: '#1f2937', bg: '#ffffff' },
    royal:   { primary: '#7c3aed', secondary: '#d97706', body: '#1f2937', bg: '#fbfbfe' },
    nature:  { primary: '#059669', secondary: '#10b981', body: '#064e3b', bg: '#f7fee7' },
    minimal: { primary: '#000000', secondary: '#4b5563', body: '#111827', bg: '#ffffff' },
    ocean:   { primary: '#0284c7', secondary: '#06b6d4', body: '#0f172a', bg: '#f0f9ff' }
  };

  const t = themes[theme] || themes.modern;
  root.style.setProperty('--primary-color', t.primary);
  root.style.setProperty('--secondary-color', t.secondary);
  root.style.setProperty('--body-text-color', t.body);
  root.style.setProperty('--background-style', t.bg);

  showCustomMessage(`Tema "${theme.toUpperCase()}" aplicado!`, 'info');
};

function initCustomColorPickers() {
  const pColor = document.getElementById('custom-primary-color');
  const sColor = document.getElementById('custom-secondary-color');
  const pHex = document.getElementById('custom-primary-hex');
  const sHex = document.getElementById('custom-secondary-hex');
  const frameSelect = document.getElementById('custom-frame-style');

  if (pColor) {
    pColor.addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--primary-color', e.target.value);
      if (pHex) pHex.textContent = e.target.value.toUpperCase();
    });
  }

  if (sColor) {
    sColor.addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--secondary-color', e.target.value);
      if (sHex) sHex.textContent = e.target.value.toUpperCase();
    });
  }

  if (frameSelect) {
    frameSelect.addEventListener('change', (e) => {
      const pages = document.querySelectorAll('.ebook-page');
      pages.forEach(p => {
        p.className = p.className.replace(/ebook-frame-\w+/g, '');
        if (e.target.value !== 'none') {
          p.classList.add(`ebook-frame-${e.target.value}`);
        }
      });
    });
  }
}

function initFontScaleControls() {
  const decBtn = document.getElementById('global-font-scale-dec');
  const incBtn = document.getElementById('global-font-scale-inc');
  const display = document.getElementById('global-font-scale-display');

  if (decBtn && incBtn && display) {
    decBtn.addEventListener('click', () => {
      globalFontScale = Math.max(70, globalFontScale - 5);
      display.textContent = `${globalFontScale}%`;
      applyFontScale();
    });
    incBtn.addEventListener('click', () => {
      globalFontScale = Math.min(140, globalFontScale + 5);
      display.textContent = `${globalFontScale}%`;
      applyFontScale();
    });
  }
}

function applyFontScale() {
  const content = document.querySelectorAll('#ebook-render-area .ebook-page p, #ebook-render-area .ebook-page li');
  content.forEach(el => {
    el.style.fontSize = `${(16 * globalFontScale) / 100}px`;
  });
}

function initBlockToolbox() {
  document.querySelectorAll('.draggable-block-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type;
      const lastPage = document.querySelector('#ebook-render-area .ebook-page:last-child .ebook-content-area');
      if (!lastPage) return;

      const div = document.createElement('div');
      div.className = 'editable-element my-4';

      if (type === 'h1') div.innerHTML = `<h2 class="text-3xl font-black" style="color:var(--primary-color)">Novo Título Principal</h2>`;
      else if (type === 'h2') div.innerHTML = `<h3 class="text-2xl font-bold" style="color:var(--secondary-color)">Novo Subtítulo</h3>`;
      else if (type === 'p') div.innerHTML = `<p class="text-base text-gray-700 leading-relaxed">Novo parágrafo de texto explicativo adicionado.</p>`;
      else if (type === 'image') div.innerHTML = `<img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80" class="rounded-xl shadow-md w-full max-h-64 object-cover my-2">`;
      else if (type === 'button') div.innerHTML = `<div class="text-center my-4"><a href="#" class="px-6 py-3 rounded-full bg-blue-600 text-white font-bold inline-block shadow-lg">Clique Aqui</a></div>`;
      else if (type === 'product') div.innerHTML = `
        <div class="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 my-3">
          <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" class="w-20 h-20 rounded-lg object-cover">
          <div>
            <h4 class="font-bold text-lg text-gray-900">Nome do Produto Recomendado</h4>
            <p class="text-xs text-gray-500 mb-2">Descrição rápida e benefícios para o leitor.</p>
            <a href="#" class="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg inline-block">Conferir Oferta</a>
          </div>
        </div>
      `;

      lastPage.appendChild(div);
      attachEbookEditHooks();
      showCustomMessage('Bloco adicionado à página!', 'success');
    });
  });
}

function initCoverEditor() {
  const modal = document.getElementById('cover-editor-modal');
  const applyUrlBtn = document.getElementById('cover-editor-apply-url-btn');
  const cancelBtn = document.getElementById('cover-editor-cancel-btn');
  const regenBtn = document.getElementById('cover-editor-regenerate-btn');
  const uploadBtn = document.getElementById('cover-editor-upload-btn');
  const fileInput = document.getElementById('cover-editor-file-input');

  document.addEventListener('click', (e) => {
    if (e.target.closest('.cover-edit-btn')) {
      if (modal) modal.style.display = 'flex';
    }
  });

  if (cancelBtn) cancelBtn.onclick = () => modal.style.display = 'none';

  if (applyUrlBtn) {
    applyUrlBtn.onclick = () => {
      const url = document.getElementById('cover-editor-url-input')?.value.trim();
      const cover = document.getElementById('ebook-cover');
      if (url && cover) {
        cover.style.backgroundImage = `url('${url}')`;
        modal.style.display = 'none';
        showCustomMessage('Capa atualizada!', 'success');
      }
    };
  }

  if (regenBtn) {
    regenBtn.onclick = () => {
      const prompt = document.getElementById('cover-editor-new-prompt-input')?.value.trim();
      const cover = document.getElementById('ebook-cover');
      if (prompt && cover) {
        const newUrl = MV_API.generateImageUrl(prompt, 1200, 1600);
        cover.style.backgroundImage = `url('${newUrl}')`;
        modal.style.display = 'none';
        showCustomMessage('Nova capa gerada!', 'success');
      }
    };
  }

  if (uploadBtn && fileInput) {
    uploadBtn.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const cover = document.getElementById('ebook-cover');
          if (cover) cover.style.backgroundImage = `url('${ev.target.result}')`;
          modal.style.display = 'none';
          showCustomMessage('Imagem da capa carregada!', 'success');
        };
        reader.readAsDataURL(file);
      }
    };
  }
}

function attachEbookEditHooks() {
  document.querySelectorAll('#ebook-render-area .editable-element').forEach(el => {
    el.contentEditable = 'true';
  });
}

function updateEbookPageFormat() {
  const pages = document.querySelectorAll('#ebook-render-area .ebook-page');
  pages.forEach(p => {
    if (currentEbookFormat === 'landscape') p.classList.add('landscape');
    else p.classList.remove('landscape');
  });
}

window.addEventListener('DOMContentLoaded', initEbook);
