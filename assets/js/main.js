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
    const mobilePillContainer = document.getElementById('mobilePillContainer');
    const whatsappFloat = document.querySelector('.whatsapp-float');
    const heroSection = document.querySelector('.hero');
    
    // Verificar se estamos em mobile e se os elementos existem
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    function handleMobileScroll() {
        if (!isMobile() || !scrollHint || !mobilePillContainer || !whatsappFloat || !heroSection) {
            return;
        }
        
        const scrollY = window.pageYOffset || window.scrollY;
        const scrollThreshold = 100; // Aumentado para dar mais espaço antes de ativar
        const heroHeight = heroSection.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // Verificar se passou do threshold de scroll (saiu da área do hero)
        if (scrollY > scrollThreshold || scrollY > (heroHeight - viewportHeight * 0.2)) {
            // Scroll para baixo: esconder hint, esconder cápsula (split-mode), mostrar WhatsApp
            if (scrollHint && !scrollHint.classList.contains('hidden')) {
                scrollHint.classList.add('hidden');
            }
            if (mobilePillContainer && !mobilePillContainer.classList.contains('split-mode')) {
                mobilePillContainer.classList.add('split-mode');
            }
            if (whatsappFloat && whatsappFloat.classList.contains('hidden-top')) {
                whatsappFloat.classList.remove('hidden-top');
            }
        } else {
            // Voltar ao topo: mostrar hint, mostrar cápsula, esconder WhatsApp
            if (scrollHint && scrollHint.classList.contains('hidden')) {
                scrollHint.classList.remove('hidden');
            }
            if (mobilePillContainer && mobilePillContainer.classList.contains('split-mode')) {
                mobilePillContainer.classList.remove('split-mode');
            }
            if (whatsappFloat && !whatsappFloat.classList.contains('hidden-top')) {
                whatsappFloat.classList.add('hidden-top');
            }
        }
    }
    
    // Inicializar estado no carregamento
    if (isMobile()) {
        // Esconder WhatsApp flutuante no topo
        if (whatsappFloat) {
            whatsappFloat.classList.add('hidden-top');
        }
        // Garantir que a página comece no topo
        window.scrollTo(0, 0);
        // Forçar scroll para o topo após um pequeno delay (para garantir que o layout esteja pronto)
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
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
    window.addEventListener('resize', function() {
        // Atualizar visibilidade do WhatsApp
        if (isMobile() && whatsappFloat) {
            const scrollY = window.pageYOffset || window.scrollY;
            if (scrollY <= 50) {
                whatsappFloat.classList.add('hidden-top');
            }
        } else if (whatsappFloat) {
            whatsappFloat.classList.remove('hidden-top');
        }
        // Nota: A tag <picture> gerencia automaticamente a troca de banner
    });
});

