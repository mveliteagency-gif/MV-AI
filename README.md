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
- 🔑 **100% Gratuito & Multi-API**: Funciona sem chaves (via motor neural integrado gratuito) e suporta chaves do Google Gemini com sistema de rotação ilimitada.

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
├── index.html            # Aplicação principal
├── server.cjs            # Servidor local Node.js
├── README.md             # Documentação do projeto
├── assets/
│   ├── logo.svg          # Logotipo vetorial
│   └── logo.png          # Logotipo em alta definição
├── css/
│   └── styles.css        # Folha de estilos e temas
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
