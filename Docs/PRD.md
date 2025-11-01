PRD: Redesign Estratégico Amplanet (Versão 2025)
Produto: Novo site institucional estático da Amplanet
Proprietário do Projeto: Caio
Data: 31 de outubro de 2025
1. Visão Geral e Objetivos
1.1. O Problema
O site atual (baseado em PHP) é funcional, mas visualmente simples e não está estruturado para promover a nova linha de serviços de aplicativos (Disney+, HBO Max, etc.). Ele não reflete uma imagem moderna de uma empresa de tecnologia.
1.2. A Solução (Visão)
Criar um site estático (HTML, CSS, JS), de carregamento ultra-rápido, com um design moderno e totalmente responsivo (mobile-first). O novo site servirá como a principal ferramenta de marketing e vendas, facilitando a contratação de planos de internet e a venda adicional (upsell) dos novos serviços de aplicativos.
1.3. Objetivos Principais
Modernizar a Imagem: Atualizar a percepção da marca Amplanet para uma provedora de "soluções de conexão e entretenimento".
Gerar Leads (Planos): Aumentar o número de cliques no botão "Contratar" (links de WhatsApp) para os planos de internet.
Gerar Leads (Apps): Criar um funil claro e atrativo para a contratação dos serviços de aplicativos adicionais.
Performance: Garantir nota A no PageSpeed Insights, já que o site será 100% estático.
2. Escopo do Projeto
2.1. O que VAMOS fazer (In-Scope)
Refazer 100% do front-end do site.
Migrar o conteúdo existente (Planos, Sobre) para a nova estrutura.
Criar uma nova página (servicos.html) dedicada aos aplicativos (baseado na imagem fornecida).
Implementar interações ricas com JavaScript (modais, animações de scroll).
Garantir que todos os CTAs (Call to Action) levem para o WhatsApp.
Site 100% responsivo.
2.2. O que NÃO VAMOS fazer (Out-of-Scope)
NÃO haverá banco de dados.
NÃO haverá backend (sem PHP, Node, etc.).
NÃO vamos recriar a "Área do Cliente" ou "2ª Via de Boleto". Estas seções serão links externos que apontam para o sistema legado (o site que já existe).
NÃO haverá sistema de login, cadastro ou e-commerce no novo site.
3. Arquitetura de Páginas (Sitemap)
O site será composto pelas seguintes páginas estáticas:
index.html (Home): O principal ponto de entrada.
planos.html (Planos): Detalhamento de todos os planos (Residencial, Corp, Condomínios).
servicos.html (Nossos Apps): A nova galeria de serviços adicionais.
sobre.html (Sobre Nós): A história, missão, visão e valores da empresa.
cobertura.html (Cobertura): Informação sobre as áreas atendidas.
4. Detalhamento das Páginas (Features)
4.1. Componentes Globais (Header & Footer)
Header (Cabeçalho):
Logo da Amplanet.
Menu de Navegação (Links para: Início, Planos, Nossos Apps, Sobre, Cobertura).
Menu "Hambúrguer" em telas móveis (controlado por JS).
Botão Destaque: "Área do Cliente" (link externo para: https://amplanet.com.br/central_assinante_web/login).
Footer (Rodapé):
* Logo e breve descrição.
* Contatos (Telefone, WhatsApp, Endereço).
* Links de redes sociais.
* Links de navegação rápida (repetir o menu).
* Link para "2ª Via" (link externo).
4.2. index.html (Página Home)
Seção 1: "Hero" (Principal)
Banner de alta qualidade (ou vídeo leve) com sobreposição de texto.
Título (H1): "A conexão que transforma: Internet Fibra + Entretenimento."
Botão 1 (Primário): "Conheça Nossos Planos" (scrolla para Seção 2).
Botão 2 (Secundário): "Veja os Apps Disponíveis" (link para servicos.html).
Seção 2: Planos Residenciais (Cards)
Título: "Planos Residenciais: A velocidade que você precisa."
Exibição de 3 "Cards" principais (ex: 800 Mega, 1 Giga).
Cada card deve conter: Nome do Plano, Velocidade, ícones (Wi-Fi 6, 100% Fibra), Preço (se aplicável) e botão "Contratar via WhatsApp".
Seção 3: "Turbine seu Plano" (Nova Seção de Apps)
Título: "Sua internet ainda mais completa."
Subtítulo: "Adicione serviços incríveis ao seu plano e tenha tudo em um só lugar."
Grid com os 4-5 ícones principais (ex: Disney+, HBO Max, Amazon Prime, Deezer).
Botão: "Ver Todos os Serviços Adicionais" (link para servicos.html).
Seção 4: Outras Soluções (Empresas e Condomínios)
Uma seção mais simples, 2 colunas.
Texto para Planos Corporativos com botão "Consultar".
Texto para Planos de Condomínio com botão "Consultar".
4.3. servicos.html (Nossos Apps)
Objetivo: Vender os aplicativos adicionais da imagem.
Seção 1: Galeria de Apps
Título: "Nossos Serviços Adicionais".
Subtítulo: "Escolha os apps que mais combinam com você e pague um valor adicional."
Feature (JS): Uma galeria interativa baseada na imagem (Standard, Advanced, Top, Premium).
Cada ícone de app (HBO, Looke, Zen, etc.) será clicável.
Seção 2: Modal de Informação (JS)
Ao clicar em um ícone de app, um "modal" (pop-up) deve abrir.
Conteúdo do Modal:
Logo do App em destaque.
Breve descrição do serviço.
Preço (ex: "Adicione por +R$ X,XX/mês").
Botão CTA: "Quero Adicionar!" (link direto para WhatsApp).
4.4. sobre.html (Sobre Nós)
Objetivo: Expandir o conteúdo do site atual.
Seção 1: Banner com foto da empresa ou da equipe (se houver).
Seção 2: "Nossa História" (texto a ser expandido, talvez com IA).
Seção 3: Missão, Visão e Valores (reaproveitar e re-estilizar).
Seção 4: "Nossos Diferenciais" (Moderno)
Usar ícones (da pasta /assets/images/icons/) para destacar:
Suporte Técnico Local
100% Fibra Óptica
Wi-Fi de Alta Performance
Sem Franquia
4.5. planos.html e cobertura.html
planos.html: Página com cards detalhados de todos os planos (Residenciais, Corporativos, Condomínios) para quem quer ver a lista completa.
cobertura.html: Página simples com lista de cidades/bairros atendidos. (Pode ter um Google Maps embutido se não pesar no carregamento).
5. Requisitos Técnicos e Estrutura
5.1. Tech Stack
HTML5: Semântico (tags <section>, <nav>, <footer>, etc).
CSS3: Uso de Flexbox e Grid para layout. Design responsivo (Media Queries).
JavaScript (ES6+): Puro (Vanilla JS), sem frameworks, para:
Controle do menu mobile.
Abertura/Fechamento do Modal de Apps.
Animações de "Scroll Reveal" (elementos que aparecem ao rolar).
5.2. Estrutura de Arquivos (Revisada)
/amplanet-novo-site
│
├── index.html
├── planos.html
├── servicos.html
├── sobre.html
├── cobertura.html
│
└── /assets/
    │
    ├── /css/
    │   └── style.css       (CSS principal)
    │
    ├── /js/
    │   └── main.js         (Todo o JS do site)
    │
    └── /images/
        │
        ├── logo-amplanet.svg
        ├── favicon.ico
        │
        ├── /banners/
        │   └── hero-home.jpg
        │
        ├── /icons/
        │   ├── whatsapp.svg
        │   ├── wifi.svg
        │   └── suporte.svg
        │
        └── /apps-logos/
            ├── disney-plus.png
            ├── hbo-max.png
            └── (todos os outros logos da imagem)



