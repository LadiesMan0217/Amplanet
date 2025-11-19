// ========================================
// HEADER SCROLL EFFECT
// ========================================
let lastScroll = 0;
let hideHintTimeout = null; // Timeout para controle do fadeOut do scroll hint
const header = document.querySelector('.header');

// Efeito de scroll desabilitado - navbar estática
// function handleHeaderScroll() {
//     const currentScroll = window.pageYOffset;
//     if (currentScroll > 50) {
//         header.classList.add('scrolled');
//     } else {
//         header.classList.remove('scrolled');
//     }
//     lastScroll = currentScroll;
// }

// window.addEventListener('scroll', handleHeaderScroll, { passive: true });

// ========================================
// AJUSTAR PADDING-TOP DO BODY BASEADO NA ALTURA DO HEADER
// ========================================
// REMOVIDO: Header não é mais fixo, então não precisa de padding-top no body
// O header agora é estático e faz parte do fluxo normal do documento

// ========================================
// MENU MOBILE TOGGLE
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    
    if (menuToggle && navbarMenu) {
        menuToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = menuToggle.querySelectorAll('span');
            if (navbarMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu when clicking on a link
        const menuLinks = navbarMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarMenu.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideMenu = navbarMenu.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnToggle && navbarMenu.classList.contains('active')) {
                navbarMenu.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // ========================================
    // MODAL FUNCTIONALITY (for servicos.html)
    // ========================================
    const appItems = document.querySelectorAll('.app-item');
    const modal = document.getElementById('appModal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = modal ? modal.querySelector('.modal-overlay') : null;
    const modalAppLogo = document.getElementById('modalAppLogo');
    const modalAppName = document.getElementById('modalAppName');
    const modalAppDesc = document.getElementById('modalAppDesc');
    const modalAppPrice = document.getElementById('modalAppPrice');
    const modalAppButton = document.getElementById('modalAppButton');

    if (appItems.length > 0 && modal) {
        appItems.forEach(item => {
            item.addEventListener('click', function() {
                const appName = this.getAttribute('data-name');
                const appDesc = this.getAttribute('data-desc');
                const appPrice = this.getAttribute('data-price');
                const appImg = this.querySelector('img');
                
                if (modalAppLogo && appImg) {
                    modalAppLogo.src = appImg.src;
                    modalAppLogo.alt = appName;
                }
                
                if (modalAppName) modalAppName.textContent = appName;
                if (modalAppDesc) modalAppDesc.textContent = appDesc;
                if (modalAppPrice) {
                    modalAppPrice.textContent = appPrice === 'Consultar' 
                        ? 'Consultar Valores' 
                        : `Adicione por +R$ ${appPrice}/mês`;
                }
                
                if (modalAppButton) {
                    const whatsappMessage = encodeURIComponent(`Olá! Gostaria de adicionar o serviço ${appName} ao meu plano.`);
                    modalAppButton.href = `https://wa.me/55869988230492?text=${whatsappMessage}`;
                }
                
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close modal functions
        const closeModal = function() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }

        // Close modal on ESC key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // ========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (navbarMenu && navbarMenu.classList.contains('active')) {
                    navbarMenu.classList.remove('active');
                    const spans = menuToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });
    });

    // ========================================
    // CARROSSEL DE BANNERS - REMOVIDO
    // Banner único implementado - código do carrossel removido
    // ========================================

    // ========================================
    // PARALLAX EFFECT FOR HERO BANNER MOBILE (Preparado para futura adaptação)
    // ========================================
    // Código preparado para quando houver banner mobile específico
    // Descomente e ajuste quando o banner mobile estiver pronto
    /*
    let ticking = false;
    const heroImageMobile = document.querySelector('.hero-image-mobile');
    
    function updateParallax() {
        if (heroImageMobile && window.innerWidth < 768) {
            const scrolled = window.pageYOffset;
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                const heroHeight = heroSection.offsetHeight;
                if (scrolled < heroHeight) {
                    const parallaxSpeed = 0.15; // Mais suave
                    const yPos = -(scrolled * parallaxSpeed);
                    heroImageMobile.style.transform = `translate3d(0, ${yPos}px, 0)`;
                    heroImageMobile.style.opacity = Math.max(0, 1 - (scrolled / heroHeight) * 0.3);
                } else {
                    heroImageMobile.style.transform = 'translate3d(0, 0, 0)';
                    heroImageMobile.style.opacity = 0.7;
                }
            }
        }
        ticking = false;
    }

    function requestParallaxTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    if (heroImageMobile) {
        window.addEventListener('scroll', requestParallaxTick, { passive: true });
        // Initial call
        updateParallax();
    }
    */

    // ========================================
    // ENHANCED SCROLL REVEAL ANIMATION
    // ========================================
    
    // Detectar se estamos na home page (index.html)
    function isHomePage() {
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop();
        return filename === 'index.html' || filename === '' || pathname.endsWith('/');
    }
    
    // Identificar a primeira seção nas outras páginas (primeira <section> após header, excluindo .hero)
    function getFirstSection() {
        const hero = document.querySelector('.hero');
        const allSections = document.querySelectorAll('section');
        
        // Se não houver hero, retornar a primeira seção
        if (!hero) {
            return allSections.length > 0 ? allSections[0] : null;
        }
        
        // Encontrar a primeira seção que não seja .hero
        for (let i = 0; i < allSections.length; i++) {
            if (!allSections[i].classList.contains('hero')) {
                return allSections[i];
            }
        }
        
        return null;
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry) => {
            // Usar uma margem de segurança para evitar flickering
            if (entry.isIntersecting) {
                // Add revealed class with a small delay for smooth animation
                // Sincronizar com o aparecimento do botão do WhatsApp se possível
                const scrollY = window.pageYOffset || window.scrollY;
                const isTop = scrollY < 50;
                
                // Se estiver no topo, pode ser um falso positivo do observer em telas altas
                // Esperar um pouco mais ou verificar se realmente deve mostrar
                
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, 50);
                
                // Manter revelado permanentemente uma vez visto
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Detectar se é home page
    const isHome = isHomePage();
    const firstSection = isHome ? null : getFirstSection();
    
    // Se não for home page, garantir que a primeira seção apareça imediatamente
    // IMPORTANTE: Fazer isso ANTES de qualquer querySelectorAll para evitar que receba scroll-reveal
    if (!isHome && firstSection) {
        // Adicionar classe revealed ANTES de qualquer processamento
        firstSection.classList.add('revealed');
        // Remover estilos inline que possam estar escondendo
        firstSection.style.opacity = '';
        firstSection.style.visibility = '';
        firstSection.style.display = '';
        // Remover scroll-reveal se já foi adicionado por algum motivo
        firstSection.classList.remove('scroll-reveal');
        
        // Também garantir que elementos filhos da primeira seção apareçam
        const firstSectionChildren = firstSection.querySelectorAll('.section-title, .section-subtitle, .plano-card, .planos-grid, .container');
        firstSectionChildren.forEach(child => {
            child.classList.add('revealed');
            child.classList.remove('scroll-reveal'); // Remover scroll-reveal se existir
            child.style.opacity = '';
            child.style.visibility = '';
        });
    }
    
    // Add scroll-reveal class to sections, titles, and cards
    // IMPORTANTE: Excluir a primeira seção e seus filhos se não for home page
    let revealSelector = `
        section:not(.hero), 
        .section-title, 
        .section-subtitle,
        .plano-card, 
        .app-item, 
        .app-item-large,
        .solucao-card, 
        .valor-card, 
        .diferencial-item, 
        .info-card,
        .teste-velocidade-card,
        .teste-dicas-card
    `;
    
    const revealElements = document.querySelectorAll(revealSelector);
    
    revealElements.forEach(el => {
        // Se não for home page e este elemento for a primeira seção ou estiver dentro dela, pular
        if (!isHome && firstSection) {
            // Verificar se o elemento é a primeira seção ou está dentro dela
            const isFirstSection = el === firstSection;
            const isInsideFirstSection = firstSection.contains(el);
            
            if (isFirstSection || isInsideFirstSection) {
                // Não aplicar scroll-reveal na primeira seção e seus filhos das outras páginas
                // Garantir que não tenha scroll-reveal
                el.classList.remove('scroll-reveal');
                // Garantir que tenha revealed
                if (!el.classList.contains('revealed')) {
                    el.classList.add('revealed');
                }
                // Garantir visibilidade
                el.style.opacity = '';
                el.style.visibility = '';
                return;
            }
        }
        
        // Aplicar scroll-reveal normalmente apenas se não for a primeira seção
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });

    // ========================================
    // ACTIVE NAVIGATION LINK HIGHLIGHTING
    // ========================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-menu a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPage || (currentPage === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ========================================
    // SPEED TEST IFRAME LOADING (teste-velocidade.html)
    // ========================================
    const speedtestIframe = document.getElementById('speedtestIframe');
    if (speedtestIframe) {
        // Garantir que o iframe esteja visível
        speedtestIframe.style.display = 'block';
        
        // Verificar se o iframe carregou
        speedtestIframe.addEventListener('load', function() {
            console.log('✅ Speed test iframe carregado com sucesso');
        });
        
        // Tratar erros de carregamento
        speedtestIframe.addEventListener('error', function() {
            console.error('❌ Erro ao carregar speed test iframe');
        });
    }

    // ========================================
    // PLANOS EXPANSÃO/COLAPSO - SIMPLIFICADO
    // Usa max-height para expansão interna sem afetar altura do card
    // ========================================
    const maisInfoButtons = document.querySelectorAll('.btn-mais-info');
    
    maisInfoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const planoCard = this.closest('.plano-card');
            const planoDetails = planoCard.querySelector('.plano-details');
            
            if (!planoCard || !planoDetails) {
                return;
            }
            
            // Usar requestAnimationFrame para otimizar animação
            requestAnimationFrame(() => {
                if (planoCard.classList.contains('expanded')) {
                    // Colapsar - card volta para altura mínima
                    planoCard.classList.remove('expanded');
                    planoDetails.style.maxHeight = '0';
                    planoDetails.style.opacity = '0';
                    planoDetails.style.paddingTop = '0';
                    planoDetails.style.paddingBottom = '0';
                    planoDetails.style.marginBottom = '0';
                    planoDetails.style.pointerEvents = 'none';
                    // Card volta para altura mínima
                    planoCard.style.height = 'auto';
                    planoCard.style.minHeight = '336px';
                } else {
                    // Expandir - card cresce para acomodar detalhes
                    planoCard.classList.add('expanded');
                    
                    // Usar setTimeout para garantir que o DOM esteja atualizado
                    setTimeout(() => {
                        // Primeiro, tornar completamente visível temporariamente para medir
                        planoDetails.style.maxHeight = 'none';
                        planoDetails.style.height = 'auto';
                        planoDetails.style.opacity = '1';
                        planoDetails.style.padding = 'var(--spacing-md)';
                        planoDetails.style.visibility = 'visible';
                        planoDetails.style.overflow = 'visible';
                        planoDetails.style.display = 'flex';
                        planoDetails.style.marginBottom = 'var(--spacing-md)';
                        
                        // Garantir que elementos filhos sejam visíveis
                        const features = planoDetails.querySelector('.plano-features');
                        if (features) {
                            features.style.opacity = '1';
                            features.style.visibility = 'visible';
                            features.style.display = 'flex';
                            
                            // Garantir que cada feature seja visível
                            const featureItems = features.querySelectorAll('.plano-feature');
                            featureItems.forEach(feature => {
                                feature.style.opacity = '1';
                                feature.style.visibility = 'visible';
                                feature.style.display = 'flex';
                            });
                        }
                        
                        // Forçar reflow para garantir que o conteúdo seja renderizado
                        void planoDetails.offsetHeight;
                        
                        // Medir altura real do conteúdo
                        let contentHeight = planoDetails.scrollHeight;
                        
                        // Se scrollHeight for 0, usar método alternativo
                        if (contentHeight === 0 || contentHeight < 50) {
                            // Contar features e calcular altura estimada
                            if (features) {
                                const featureItems = features.querySelectorAll('.plano-feature');
                                const numFeatures = featureItems.length;
                                // Cada feature tem aproximadamente 40-45px de altura + gap
                                contentHeight = (numFeatures * 48) + 60; // features + padding
                            } else {
                                // Altura padrão baseada em conteúdo típico
                                contentHeight = 280;
                            }
                        }
                        
                        // Aplicar altura calculada aos detalhes
                        planoDetails.style.maxHeight = contentHeight + 'px';
                        planoDetails.style.height = 'auto';
                        planoDetails.style.opacity = '1';
                        planoDetails.style.padding = 'var(--spacing-md)';
                        planoDetails.style.overflow = 'visible';
                        planoDetails.style.visibility = 'visible';
                        planoDetails.style.pointerEvents = 'auto';
                        planoDetails.style.marginBottom = 'var(--spacing-md)';
                        
                        // Permitir que o card cresça para acomodar o conteúdo
                        planoCard.style.height = 'auto';
                        planoCard.style.minHeight = '336px';
                    }, 10);
                }
            });
        });
    });

    // ========================================
    // MOBILE PILL CONTAINER E SCROLL HINT
    // ========================================
    const scrollHint = document.getElementById('scrollHint');
    const scrollHintText = document.getElementById('scrollHintText');
    const mobilePillWrapper = document.getElementById('mobilePillContainer'); // ID mantido, mas agora é wrapper
    const whatsappFloat = document.querySelector('.whatsapp-float');
    const heroSection = document.querySelector('.hero');
    const pillButtonLeft = document.getElementById('pillButtonLeft');
    const pillButtonRight = document.getElementById('pillButtonRight');
    
    // Variáveis para timer do scroll hint
    let scrollHintTimer = null;
    let scrollHintIconTimer = null;
    let hasScrolled = false;
    let scrollHintTimerStarted = false;
    let desktopScrollHintShown = false; // Flag para desktop: scroll hint só aparece uma vez
    
    // Função auxiliar para obter o wrapper do ícone
    function getScrollHintIconWrapper() {
        if (!scrollHint) return null;
        return scrollHint.querySelector('.scroll-hint-icon-wrapper');
    }
    
    // Verificar se estamos em mobile e se os elementos existem
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Garantir visibilidade dos botões e scroll-hint - FUNÇÃO CRÍTICA (APENAS MOBILE)
    function ensureButtonsVisible() {
        // Só executar se for mobile
        if (!isMobile()) {
            return;
        }
        
        // Garantir que scroll-hint seja visível (a menos que tenha classe hidden)
        if (scrollHint && !scrollHint.classList.contains('hidden')) {
            scrollHint.style.display = 'flex';
            scrollHint.style.visibility = 'visible';
            scrollHint.style.opacity = '1';
        }
        
        if (pillButtonLeft) {
            pillButtonLeft.style.display = 'flex';
            pillButtonLeft.style.opacity = '1';
            pillButtonLeft.style.visibility = 'visible';
            pillButtonLeft.style.transform = 'translateX(0) scale(1)';
        }
        if (pillButtonRight) {
            pillButtonRight.style.display = 'flex';
            pillButtonRight.style.opacity = '1';
            pillButtonRight.style.visibility = 'visible';
            pillButtonRight.style.transform = 'translateX(0) scale(1)';
        }
    }
    
    // Esconder elementos mobile quando detectar desktop
    function hideMobileElements() {
        if (!isMobile()) {
            // NOTA: scroll-hint NÃO é escondido - CSS cuida do estilo desktop em @media (min-width: 1024px)
            
            // Esconder wrapper de botões - FORÇAR OCULTAÇÃO TOTAL
            if (mobilePillWrapper) {
                mobilePillWrapper.style.display = 'none';
                mobilePillWrapper.style.visibility = 'hidden';
                mobilePillWrapper.style.opacity = '0';
                mobilePillWrapper.style.position = 'absolute';
                mobilePillWrapper.style.left = '-9999px';
                mobilePillWrapper.style.top = '-9999px';
            }
            
            // Esconder botões individuais - FORÇAR OCULTAÇÃO TOTAL
            if (pillButtonLeft) {
                pillButtonLeft.style.display = 'none';
                pillButtonLeft.style.visibility = 'hidden';
                pillButtonLeft.style.opacity = '0';
                pillButtonLeft.style.position = 'absolute';
                pillButtonLeft.style.left = '-9999px';
                pillButtonLeft.style.top = '-9999px';
            }
            if (pillButtonRight) {
                pillButtonRight.style.display = 'none';
                pillButtonRight.style.visibility = 'hidden';
                pillButtonRight.style.opacity = '0';
                pillButtonRight.style.position = 'absolute';
                pillButtonRight.style.left = '-9999px';
                pillButtonRight.style.top = '-9999px';
            }
            
            // Garantir WhatsApp visível em desktop
            if (whatsappFloat) {
                whatsappFloat.classList.remove('hidden-top');
                whatsappFloat.style.opacity = '';
                whatsappFloat.style.pointerEvents = '';
                whatsappFloat.style.transform = '';
                whatsappFloat.style.display = '';
                whatsappFloat.style.visibility = '';
            }
        }
    }
    
    // Executar verificações apenas se for mobile
    if (isMobile()) {
        ensureButtonsVisible();
        
        // Executar após DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', ensureButtonsVisible);
        } else {
            ensureButtonsVisible();
        }
        
        // Executar após delay consolidado (otimizado)
        setTimeout(ensureButtonsVisible, 300);
    } else {
        // Se não for mobile, esconder elementos mobile imediatamente
        hideMobileElements();
    }
    
    // Função para iniciar timer do scroll hint (mobile e desktop)
    function startScrollHintTimer() {
        // Limpar timers existentes
        if (scrollHintTimer) {
            clearTimeout(scrollHintTimer);
        }
        if (scrollHintIconTimer) {
            clearTimeout(scrollHintIconTimer);
        }
        
        // Resetar flag
        hasScrolled = false;
        
        // Iniciar timer de 3 segundos para mostrar o ícone
        scrollHintIconTimer = setTimeout(() => {
            if (!hasScrolled) {
                const iconWrapper = getScrollHintIconWrapper();
                if (iconWrapper) {
                    iconWrapper.classList.add('show');
                }
            }
        }, 3000);
        
        // Iniciar timer de 6 segundos para mostrar o texto
        scrollHintTimer = setTimeout(() => {
            if (!hasScrolled) {
                // Mostrar texto "Role para baixo" (mobile e desktop usam o mesmo elemento)
                if (scrollHintText) {
                    scrollHintText.classList.add('show');
                    if (scrollHint) scrollHint.classList.add('has-text');
                }
            }
        }, 6000);
        
        scrollHintTimerStarted = true;
    }
    
    // Função para resetar timer quando usuário rola
    function resetScrollHintTimer() {
        hasScrolled = true;
        if (scrollHintTimer) {
            clearTimeout(scrollHintTimer);
            scrollHintTimer = null;
        }
        if (scrollHintIconTimer) {
            clearTimeout(scrollHintIconTimer);
            scrollHintIconTimer = null;
        }
        // Remover classe show do ícone
        const iconWrapper = getScrollHintIconWrapper();
        if (iconWrapper) {
            iconWrapper.classList.remove('show');
        }
        // Remover texto "Role para baixo" (mobile e desktop usam o mesmo elemento)
        if (scrollHintText) {
            scrollHintText.classList.remove('show');
            if (scrollHint) scrollHint.classList.remove('has-text');
        }
    }
    
    function handleMobileScroll() {
        // Verificar se estamos em mobile primeiro
        if (!isMobile()) {
            return;
        }
        
        const scrollY = window.pageYOffset || window.scrollY;
        const scrollThreshold = 50; // Limite aumentado para evitar desaparecimento acidental no topo
        
        // Lógica simplificada:
        // 1. Se estiver no topo (< 50px), MOSTRAR TUDO
        // 2. Se estiver rolando para baixo, ESCONDER
        // 3. Se não, manter estado atual (ou podemos implementar "rolar para cima mostra")
        
        if (scrollY > scrollThreshold) {
            // Usuário rolou para baixo além do limite
            if (!hasScrolled) {
                resetScrollHintTimer();
            }
            
            if (scrollHint && !scrollHint.classList.contains('hidden')) {
                // FadeOut e esconder
                scrollHint.style.opacity = '0';
                scrollHint.style.transform = 'translateX(-50%) translateY(20px)';
                scrollHint.style.pointerEvents = 'none';
                
                // Adicionar classe hidden após transição
                if (hideHintTimeout) clearTimeout(hideHintTimeout);
                hideHintTimeout = setTimeout(() => {
                    scrollHint.classList.add('hidden');
                }, 300);
            }
            
            if (mobilePillWrapper) {
                mobilePillWrapper.classList.add('split-mode');
            }
            
            // WhatsApp reaparece ao rolar para baixo (comportamento padrão de botão flutuante)
            if (whatsappFloat) {
                whatsappFloat.classList.remove('hidden-top');
                whatsappFloat.style.opacity = '1';
                whatsappFloat.style.pointerEvents = 'auto';
                whatsappFloat.style.transform = 'translateY(0)';
            }
            
            // SINCRONIZAR: Mostrar seção de planos junto com WhatsApp
            const planosSection = document.querySelector('.planos-section');
            if (planosSection && !planosSection.classList.contains('revealed')) {
                planosSection.classList.add('revealed');
                // Remover estilos inline que previnem FOUC
                planosSection.style.opacity = '';
                planosSection.style.visibility = '';
            }
        } else {
            // Usuário está no topo da página (Hero Section)
            
            // Cancelar qualquer timeout de ocultação pendente
            if (hideHintTimeout) {
                clearTimeout(hideHintTimeout);
                hideHintTimeout = null;
            }

            // Mostrar Scroll Hint
            if (scrollHint) {
                scrollHint.classList.remove('hidden');
                requestAnimationFrame(() => {
                    scrollHint.style.display = 'flex';
                    scrollHint.style.visibility = 'visible';
                    scrollHint.style.opacity = '1';
                    scrollHint.style.transform = 'translateX(-50%) translateY(0)';
                    scrollHint.style.pointerEvents = 'auto';
                });
            }
            
            // Reiniciar timer do hint se necessário
            if (!scrollHintTimerStarted || scrollY === 0) {
                startScrollHintTimer();
            }
            
            // Restaurar botões da pílula (unir novamente)
            if (mobilePillWrapper) {
                mobilePillWrapper.classList.remove('split-mode');
                ensureButtonsVisible(); // Forçar visibilidade dos botões
            }
            
            // Esconder WhatsApp no topo (para não poluir a hero)
            if (whatsappFloat) {
                whatsappFloat.classList.add('hidden-top');
                whatsappFloat.style.opacity = '0';
                whatsappFloat.style.pointerEvents = 'none';
                whatsappFloat.style.transform = 'translateY(20px)';
            }
            
            // SINCRONIZAR: Esconder seção de planos quando voltar ao topo
            const planosSection = document.querySelector('.planos-section');
            if (planosSection && planosSection.classList.contains('revealed')) {
                planosSection.classList.remove('revealed');
                // Reforçar ocultação com inline styles
                planosSection.style.opacity = '0';
                planosSection.style.visibility = 'hidden';
            }
        }
    }
    
    // Função para handle scroll desktop
    function handleDesktopScroll() {
        if (isMobile()) {
            return;
        }
        
        const scrollY = window.pageYOffset || window.scrollY;
        const scrollThreshold = 50;
        
        if (scrollY > scrollThreshold) {
            // Marcar que usuário já rolou (desktop: scroll hint não aparece mais)
            desktopScrollHintShown = true;
            
            if (!hasScrolled) {
                resetScrollHintTimer();
            }
            // Esconder scroll hint ao rolar para baixo (desktop)
            if (scrollHint) {
                scrollHint.classList.add('scrolled-down');
            }
            // Esconder texto imediatamente ao rolar
            if (scrollHintText) {
                scrollHintText.classList.remove('show');
                if (scrollHint) scrollHint.classList.remove('has-text');
            }
        } else {
            // Se já rolou antes, não mostrar mais o scroll hint (desktop)
            if (desktopScrollHintShown) {
                if (scrollHint) {
                    scrollHint.classList.add('scrolled-down');
                }
                if (scrollHintText) {
                    scrollHintText.classList.remove('show');
                    if (scrollHint) scrollHint.classList.remove('has-text');
                }
                return;
            }
            
            // Mostrar scroll hint no topo (desktop) - apenas se ainda não rolou
            if (scrollHint) {
                scrollHint.classList.remove('scrolled-down');
            }
            // Reiniciar timer se voltou ao topo (ícone aparecerá após 3 segundos, texto após 6 segundos)
            if (!scrollHintTimerStarted || scrollY === 0) {
                // Esconder ícone e texto ao voltar ao topo (serão mostrados após os timers)
                const iconWrapper = getScrollHintIconWrapper();
                if (iconWrapper) {
                    iconWrapper.classList.remove('show');
                }
                if (scrollHintText) {
                    scrollHintText.classList.remove('show');
                    if (scrollHint) scrollHint.classList.remove('has-text');
                }
                startScrollHintTimer();
            }
        }
    }
    
    // Função para posicionar scroll hint abaixo do banner (mobile)
    function positionScrollHintBelowBanner() {
        if (!isMobile() || !scrollHint || !heroSection) return;
        
        // Calcular altura do banner
        const heroImage = heroSection.querySelector('.hero-image');
        let bannerHeight = 0;
        
        if (heroImage) {
            // Usar altura natural da imagem ou altura renderizada
            bannerHeight = heroImage.offsetHeight;
        }
        
        if (!bannerHeight) {
             // Fallback se imagem não carregou ou altura zero
             return;
        }
        
        // Adicionar pequeno espaçamento
        const spacing = 32; // 2rem
        const topPos = bannerHeight + spacing;
        
        // Posicionar scroll hint logo abaixo do banner
        scrollHint.style.top = topPos + 'px';
        scrollHint.style.position = 'absolute';
        
        // A visibilidade do texto agora é controlada via CSS (@media max-height)
        // para garantir performance e evitar cálculos excessivos de layout
        const scrollHintText = document.getElementById('scrollHintText');
        if (scrollHintText) {
            // Resetar estilos inline para permitir que o CSS controle
            scrollHintText.style.display = '';
            scrollHintText.style.opacity = '';
            scrollHintText.style.visibility = '';
        }
    }
    
    // Chamar a função imediatamente ao carregar para verificar estado inicial
    if (isMobile()) {
        // Posicionar scroll hint abaixo do banner
        positionScrollHintBelowBanner();
        
        // Reposicionar quando a imagem carregar completamente
        const heroImage = heroSection ? heroSection.querySelector('.hero-image') : null;
        if (heroImage) {
            if (heroImage.complete) {
                // Imagem já carregada
                setTimeout(positionScrollHintBelowBanner, 100);
            } else {
                // Aguardar carregamento da imagem
                heroImage.addEventListener('load', () => {
                    setTimeout(positionScrollHintBelowBanner, 100);
                });
            }
        }
        
        // Reposicionar quando a página carregar completamente
        window.addEventListener('load', () => {
            setTimeout(positionScrollHintBelowBanner, 200);
        });
        
        // Reposicionar ao redimensionar (com debounce)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(positionScrollHintBelowBanner, 150);
        });
        
        handleMobileScroll();
        // Garantir que scroll-hint seja visível na inicialização
        if (scrollHint) {
            const scrollY = window.pageYOffset || window.scrollY;
            if (scrollY <= 50) {
                scrollHint.classList.remove('hidden');
                scrollHint.style.display = 'flex';
                scrollHint.style.visibility = 'visible';
                scrollHint.style.opacity = '1';
                // Garantir que ícone e texto comecem escondidos
                const iconWrapper = getScrollHintIconWrapper();
                if (iconWrapper) {
                    iconWrapper.classList.remove('show');
                }
                if (scrollHintText) {
                    scrollHintText.classList.remove('show');
                    if (scrollHint) scrollHint.classList.remove('has-text');
                }
                // Iniciar timer quando página carregar no topo
                startScrollHintTimer();
            }
        }
    } else {
        // Desktop: usar o mesmo elemento .scroll-hint (CSS cuida do estilo)
        handleDesktopScroll();
        // Garantir que comece visível no topo (mas ícone e texto escondidos até os timers)
        // Apenas se ainda não rolou (desktopScrollHintShown = false)
        if (scrollHint && !desktopScrollHintShown) {
            scrollHint.classList.remove('scrolled-down');
            // Garantir que ícone e texto comecem escondidos
            const iconWrapper = getScrollHintIconWrapper();
            if (iconWrapper) {
                iconWrapper.classList.remove('show');
            }
            if (scrollHintText) {
                scrollHintText.classList.remove('show');
                if (scrollHint) scrollHint.classList.remove('has-text');
            }
            const scrollY = window.pageYOffset || window.scrollY;
            if (scrollY <= 50) {
                startScrollHintTimer();
            }
        }
    }
    
    // Inicializar estado no carregamento - ANTES de qualquer renderização
    if (isMobile() && whatsappFloat) {
        // Garantir que o botão comece escondido IMEDIATAMENTE (apenas mobile)
        whatsappFloat.classList.add('hidden-top');
        // Forçar estilo inline para evitar flash
        whatsappFloat.style.opacity = '0';
        whatsappFloat.style.pointerEvents = 'none';
        whatsappFloat.style.transform = 'translateY(20px)';
    } else if (!isMobile() && whatsappFloat) {
        // Em desktop, garantir que WhatsApp esteja sempre visível
        whatsappFloat.classList.remove('hidden-top');
        whatsappFloat.style.opacity = '';
        whatsappFloat.style.pointerEvents = '';
        whatsappFloat.style.transform = '';
    }
    
    // CRÍTICO: Garantir que seção de planos comece escondida em mobile
    if (isMobile()) {
        const planosSection = document.querySelector('.planos-section');
        if (planosSection) {
            planosSection.classList.remove('revealed');
        }
    }
    
    // Garantir que a página comece no topo
    if (isMobile()) {
        window.scrollTo(0, 0);
        // Forçar scroll para o topo após um pequeno delay (para garantir que o layout esteja pronto)
        setTimeout(() => {
            window.scrollTo(0, 0);
            // Verificar novamente o estado do WhatsApp após layout
            if (whatsappFloat && isMobile()) {
                const scrollY = window.pageYOffset || window.scrollY;
                if (scrollY <= 50) {
                    whatsappFloat.classList.add('hidden-top');
                    whatsappFloat.style.opacity = '0';
                    whatsappFloat.style.pointerEvents = 'none';
                    whatsappFloat.style.transform = 'translateY(20px)';
                }
            }
        }, 50);
    }
    
    // ========================================
    // BANNER RESPONSIVO - FALLBACK JAVASCRIPT OTIMIZADO
    // Verificar apenas se necessário, evitando carregamento duplo
    // ========================================
    let lastBannerCheck = {
        width: window.innerWidth,
        src: null
    };
    
    function updateHeroBanner() {
        const heroBannerImage = document.getElementById('heroBannerImage');
        if (!heroBannerImage) {
            return; // Não tentar novamente, o script inline já definiu
        }
        
        const currentWidth = window.innerWidth;
        const isMobileDevice = currentWidth <= 768;
        const mobileSrc = heroBannerImage.getAttribute('data-mobile');
        const desktopSrc = heroBannerImage.getAttribute('data-desktop');
        
        if (!mobileSrc || !desktopSrc) return;
        
        // Obter o caminho relativo da imagem atual
        const currentSrc = heroBannerImage.src;
        let currentPath = '';
        try {
            const url = new URL(currentSrc);
            currentPath = url.pathname;
        } catch (e) {
            currentPath = currentSrc.split(window.location.origin)[1] || currentSrc;
        }
        
        // Verificar se já está com a imagem correta
        const isCurrentlyMobile = currentPath.includes('mobile') || currentPath.includes('Banner mobile');
        const isCurrentlyDesktop = currentPath.includes('web') || currentPath.includes('Banner web');
        
        // Só atualizar se necessário e se a largura mudou significativamente
        const widthChanged = Math.abs(currentWidth - lastBannerCheck.width) > 50;
        const needsUpdate = (isMobileDevice && !isCurrentlyMobile) || (!isMobileDevice && !isCurrentlyDesktop);
        
        if (needsUpdate && (widthChanged || !lastBannerCheck.src)) {
            const newSrc = isMobileDevice ? mobileSrc : desktopSrc;
            heroBannerImage.src = newSrc;
            lastBannerCheck = {
                width: currentWidth,
                src: newSrc
            };
            // Log apenas em desenvolvimento
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log(isMobileDevice ? '📱 Banner mobile atualizado' : '🖥️ Banner desktop atualizado');
            }
        } else {
            // Atualizar cache mesmo se não mudou
            lastBannerCheck.width = currentWidth;
            lastBannerCheck.src = currentSrc;
        }
    }
    
    // Executar apenas uma vez após DOM estar pronto (o script inline já definiu o src)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Verificar apenas uma vez após um pequeno delay
            setTimeout(updateHeroBanner, 50);
        });
    } else {
        // DOM já está pronto, verificar uma vez
        setTimeout(updateHeroBanner, 50);
    }
    
    // Executar ao redimensionar a janela (com debounce maior para evitar verificações excessivas)
    let bannerResizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(bannerResizeTimeout);
        bannerResizeTimeout = setTimeout(updateHeroBanner, 300);
    }, { passive: true });
    
    // Listener de scroll com throttling
    let ticking = false;
    function requestScrollTick() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (isMobile()) {
                    handleMobileScroll();
                } else {
                    handleDesktopScroll();
                }
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollTick, { passive: true });
    
    // Detectar scroll para resetar timer (já está sendo tratado no requestScrollTick)
    // Removido para evitar duplicação
    
    // Verificar ao redimensionar a janela
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (isMobile()) {
                // Comportamento mobile
                if (whatsappFloat) {
                    const scrollY = window.pageYOffset || window.scrollY;
                    if (scrollY <= 50) {
                        whatsappFloat.classList.add('hidden-top');
                        whatsappFloat.style.opacity = '0';
                        whatsappFloat.style.pointerEvents = 'none';
                        whatsappFloat.style.transform = 'translateY(20px)';
                    }
                }
                // Garantir visibilidade dos botões mobile
                ensureButtonsVisible();
            } else {
                // Comportamento desktop - esconder elementos mobile e mostrar WhatsApp
                hideMobileElements();
                
                // Garantir WhatsApp visível em desktop
                if (whatsappFloat) {
                    whatsappFloat.classList.remove('hidden-top');
                    whatsappFloat.style.opacity = '';
                    whatsappFloat.style.pointerEvents = '';
                    whatsappFloat.style.transform = '';
                    whatsappFloat.style.display = '';
                    whatsappFloat.style.visibility = '';
                }
                
                // Garantir que elementos mobile estejam completamente escondidos (dupla verificação)
                // NOTA: scrollHint NÃO é escondido - CSS cuida do estilo desktop em @media (min-width: 1024px)
                if (mobilePillWrapper) {
                    mobilePillWrapper.style.display = 'none';
                    mobilePillWrapper.style.visibility = 'hidden';
                    mobilePillWrapper.style.opacity = '0';
                }
                if (pillButtonLeft) {
                    pillButtonLeft.style.display = 'none';
                    pillButtonLeft.style.visibility = 'hidden';
                    pillButtonLeft.style.opacity = '0';
                }
                if (pillButtonRight) {
                    pillButtonRight.style.display = 'none';
                    pillButtonRight.style.visibility = 'hidden';
                    pillButtonRight.style.opacity = '0';
                }
            }
        }, 150);
    });
});

