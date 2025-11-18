// ========================================
// HEADER SCROLL EFFECT
// ========================================
let lastScroll = 0;
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
function adjustBodyPaddingForHeader() {
    const headerElement = document.querySelector('.header');
    const bodyElement = document.body;
    
    if (headerElement && bodyElement) {
        // Calcular altura real do header (incluindo padding, margin, etc)
        const headerHeight = headerElement.offsetHeight;
        
        // Aplicar padding-top no body igual à altura do header
        // Isso garante que todo o conteúdo comece após o header
        bodyElement.style.paddingTop = headerHeight + 'px';
    }
}

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Ajustar imediatamente
    adjustBodyPaddingForHeader();
    
    // Ajustar após um pequeno delay para garantir que imagens/logos carregaram
    setTimeout(adjustBodyPaddingForHeader, 100);
    setTimeout(adjustBodyPaddingForHeader, 500);
});

// Ajustar ao redimensionar a janela
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(adjustBodyPaddingForHeader, 100);
});

// Ajustar quando a página terminar de carregar (incluindo imagens)
window.addEventListener('load', function() {
    adjustBodyPaddingForHeader();
});

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
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Add revealed class with a small delay for smooth animation
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, 50);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add scroll-reveal class to sections, titles, and cards
    const revealElements = document.querySelectorAll(`
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
    `);
    
    revealElements.forEach(el => {
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
    // PLANOS EXPANSÃO/COLAPSO
    // ========================================
    const maisInfoButtons = document.querySelectorAll('.btn-mais-info');
    
    maisInfoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planoCard = this.closest('.plano-card');
            const planoDetails = planoCard.querySelector('.plano-details');
            
            if (planoCard.classList.contains('expanded')) {
                // Colapsar
                planoCard.classList.remove('expanded');
                planoDetails.style.maxHeight = '0';
                planoDetails.style.opacity = '0';
                planoDetails.style.paddingTop = '0';
                planoDetails.style.paddingBottom = '0';
                planoDetails.style.marginBottom = '0';
            } else {
                // Expandir
                planoCard.classList.add('expanded');
                // Calcular altura real do conteúdo com padding
                const tempHeight = planoDetails.scrollHeight;
                // Adicionar espaço extra para garantir que tudo seja visível
                const contentHeight = tempHeight + 40; // Espaço extra para garantir visibilidade
                planoDetails.style.maxHeight = contentHeight + 'px';
                planoDetails.style.opacity = '1';
                planoDetails.style.paddingTop = '';
                planoDetails.style.paddingBottom = '';
                planoDetails.style.marginBottom = '';
            }
        });
    });

    // ========================================
    // MOBILE PILL CONTAINER E SCROLL HINT
    // ========================================
    const scrollHint = document.getElementById('scrollHint');
    const mobilePillWrapper = document.getElementById('mobilePillContainer'); // ID mantido, mas agora é wrapper
    const whatsappFloat = document.querySelector('.whatsapp-float');
    const heroSection = document.querySelector('.hero');
    const pillButtonLeft = document.getElementById('pillButtonLeft');
    const pillButtonRight = document.getElementById('pillButtonRight');
    
    // Verificar se estamos em mobile e se os elementos existem
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Garantir visibilidade dos botões - FUNÇÃO CRÍTICA (APENAS MOBILE)
    function ensureButtonsVisible() {
        // Só executar se for mobile
        if (!isMobile()) {
            return;
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
            // Esconder scroll hint - FORÇAR OCULTAÇÃO TOTAL
            if (scrollHint) {
                scrollHint.style.display = 'none';
                scrollHint.style.visibility = 'hidden';
                scrollHint.style.opacity = '0';
                scrollHint.style.position = 'absolute';
                scrollHint.style.left = '-9999px';
                scrollHint.style.top = '-9999px';
            }
            
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
        
        // Executar após delays para garantir (múltiplas verificações)
        setTimeout(ensureButtonsVisible, 100);
        setTimeout(ensureButtonsVisible, 500);
        setTimeout(ensureButtonsVisible, 1000);
    } else {
        // Se não for mobile, esconder elementos mobile imediatamente
        hideMobileElements();
    }
    
    function handleMobileScroll() {
        // Verificar se estamos em mobile primeiro
        if (!isMobile()) {
            return;
        }
        
        const scrollY = window.pageYOffset || window.scrollY;
        const scrollThreshold = 50; // Gatilho quando rolar mais de 50px
        
        // Verificar se passou do threshold de scroll
        if (scrollY > scrollThreshold) {
            // Scroll para baixo: esconder hint, ativar split-mode na cápsula, mostrar WhatsApp
            if (scrollHint) {
                scrollHint.classList.add('hidden');
            }
            if (mobilePillWrapper) {
                mobilePillWrapper.classList.add('split-mode');
            }
            if (whatsappFloat && isMobile()) {
                whatsappFloat.classList.remove('hidden-top');
                // Remover estilos inline para permitir CSS
                whatsappFloat.style.opacity = '';
                whatsappFloat.style.pointerEvents = '';
                whatsappFloat.style.transform = '';
            }
        } else {
            // Voltar ao topo: mostrar hint, remover split-mode da cápsula, esconder WhatsApp
            if (scrollHint) {
                scrollHint.classList.remove('hidden');
            }
            if (mobilePillWrapper) {
                mobilePillWrapper.classList.remove('split-mode');
                // Garantir que ambos os botões sejam visíveis ao remover split-mode
                ensureButtonsVisible();
            }
            if (whatsappFloat && isMobile()) {
                whatsappFloat.classList.add('hidden-top');
                // Forçar estilo inline para garantir que fique escondido
                whatsappFloat.style.opacity = '0';
                whatsappFloat.style.pointerEvents = 'none';
                whatsappFloat.style.transform = 'translateY(20px)';
            }
        }
    }
    
    // Chamar a função imediatamente ao carregar para verificar estado inicial
    if (isMobile()) {
        handleMobileScroll();
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
    // BANNER MOBILE - REMOVIDO
    // A tag <picture> nativa do HTML já gerencia isso automaticamente
    // Não precisamos de JavaScript para isso, evitando carregamento duplo
    // ========================================
    
    // Listener de scroll com throttling
    let ticking = false;
    function requestScrollTick() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleMobileScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollTick, { passive: true });
    
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
                if (scrollHint) {
                    scrollHint.style.display = 'none';
                    scrollHint.style.visibility = 'hidden';
                    scrollHint.style.opacity = '0';
                }
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

