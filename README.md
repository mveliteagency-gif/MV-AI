# 🚀 MV.ai — Plataforma de IA para Criação de Sites, E-books e Anúncios

![MV.ai Logo](assets/logo.svg)

> **MV.ai** é uma plataforma completa e 100% gratuita que utiliza Inteligência Artificial para gerar landing pages profissionais, e-books diagramados em PDF e criativos de anúncios de alta conversão em segundos — sem mensalidades ou limite de créditos.

---

## 🌟 Funcionalidades Principais

- 🌐 **Gerador de Sites**: Criação de landing pages completas (Tailwind CSS, Google Fonts, Font Awesome, JavaScript interativo, contador de escassez, formulários e depoimentos) com pré-visualização responsiva (Desktop, Tablet e Mobile).
- ✏️ **Editor Visual WYSIWYG**: Edite textos, títulos, fontes, cores e imagens diretamente no site em tempo real.
- 📚 **Gerador de E-books**: Produza e-books completos (A4 Retrato ou Paisagem) com capa, sumário, capítulos aprofundados, estilos visuais personalizáveis e exportação em PDF real em alta definição.
- 🎨 **E-book Ilustrativo**: Geração de páginas ilustradas full-bleed com 7 estilos artísticos (3D, Infográfico, Aquarela, etc.).
- 📋 **Clonador de Sites**: Clone qualquer página via URL ou colando o código HTML bruto para edição direta.
- 💬 **Gerador de Prompts**: Chat com assistente de IA focado em copywriting de alta conversão, roteiros e prompts.
- 📢 **Gerador de Criativos**: Produção de anúncios para Feed (1:1), Mobile (4:5), Stories/Reels (9:16) e Banner (16:9) com estratégias de "Mostrar Solução" ou "Agitar Problema".
- 🔥 **Produtos Virais**: Mineração de nichos lucrativos, levantamento das maiores dores do público e geração de conceitos de infoprodutos com 1 clique para criar o site ou e-book.
- 📱 **100% Otimizado para Mobile & PWA**: Funciona como um aplicativo nativo no celular (Android e iOS) através de Progressive Web App (PWA) instalável, barra de navegação inferior estilo app nativo, gestos de toque, safe areas e redimensionamento automático de prévias A4.
- 🔑 **100% Gratuito & Multi-API**: Funciona sem chaves (via motor neural integrado gratuito) e suporta chaves do Google Gemini com sistema de rotação ilimitada.

---

## 📱 Como Instalar como App no Celular (PWA)

O MV.ai é um **Progressive Web App (PWA)** completo, permitindo uso em tela cheia sem barras de navegador, com carregamento ultrarrápido offline via Service Worker:

### No Android (Google Chrome / Brave / Edge):
1. Acesse o MV.ai no navegador do celular.
2. Toque no botão **"Instalar"** no banner superior ou abra o menu do navegador (⋮) e toque em **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
3. O ícone do MV.ai aparecerá na sua gaveta de aplicativos.

### No iPhone / iPad (Safari):
1. Acesse o MV.ai no Safari.
2. Toque no botão **Compartilhar** (ícone do quadrado com a seta para cima na barra inferior).
3. Role para baixo e selecione **"Adicionar à Tela de Início"**.
4. Toque em **"Adicionar"** no canto superior direito.

---

## 🚀 Como Executar Localmente

### Opção 1: Com Node.js
```bash
# Clone o repositório
git clone https://github.com/mveliteagency-gif/MV-AI.git
cd MV-AI

# Inicie o servidor
node server.cjs
```
Acesse no navegador: **`http://localhost:3000`**

### Opção 2: Direto no Navegador
Basta abrir o arquivo `index.html` em qualquer navegador web moderno (Google Chrome, Edge, Firefox, Brave).

---

## 📁 Estrutura do Projeto

```
MV-AI/
├── index.html            # Aplicação principal (PWA)
├── manifest.json         # Manifesto PWA com suporte a instalação nativa
├── sw.js                 # Service Worker para cache e uso offline
├── server.cjs            # Servidor local Node.js
├── README.md             # Documentação do projeto
├── assets/
│   ├── logo.svg          # Logotipo vetorial
│   ├── logo.png          # Logotipo em alta definição
│   ├── icon-192.png      # Ícone PWA 192x192
│   ├── icon-512.png      # Ícone PWA 512x512
│   └── icon-maskable.png # Ícone PWA adaptável (Android)
├── css/
│   └── styles.css        # Folha de estilos responsiva com bottom nav e safe areas
└── js/
    ├── app.js            # Roteamento e orquestrador principal
    ├── auth.js           # Gerenciamento de sessão VIP e créditos infinitos
    ├── api.js            # Engine de inteligência artificial híbrido
    ├── api-manager.js    # Gerenciador de chaves e tutoriais
    ├── background-3d.js  # Fundo 3D em Three.js
    ├── chat.js           # Gerador de Prompts e Chat
    ├── cloner.js         # Clonador de Sites
    ├── developer.js      # Gerador e editor de sites
    ├── ebook.js          # Gerador e diagramador de E-books
    ├── viral-trends.js   # Buscador de Produtos Virais
    └── ad-creative.js    # Gerador de Criativos de Anúncios
```

---

## 📄 Licença

Distribuído sob a licença MIT. Livre para uso pessoal e comercial.
