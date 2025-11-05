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
    // CARROSSEL DE BANNERS - DESKTOP
    // ========================================
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    const carouselIndicators = document.getElementById('carouselIndicators');
    
    if (carouselTrack && carouselPrev && carouselNext) {
        const slides = carouselTrack.querySelectorAll('.carousel-slide');
        let currentIndex = 0;
        let autoplayInterval = null;
        const autoplayDelay = 5000; // 5 segundos
        
        // Criar indicadores
        if (carouselIndicators && slides.length > 0) {
            slides.forEach((slide, index) => {
                const indicator = document.createElement('button');
                indicator.classList.add('carousel-indicator');
                if (index === 0) indicator.classList.add('active');
                indicator.setAttribute('aria-label', `Ir para banner ${index + 1}`);
                indicator.addEventListener('click', () => goToSlide(index));
                carouselIndicators.appendChild(indicator);
            });
        }
        
        // Função para atualizar o carrossel
        function updateCarousel() {
            carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Atualizar indicadores
            if (carouselIndicators) {
                const indicators = carouselIndicators.querySelectorAll('.carousel-indicator');
                indicators.forEach((indicator, index) => {
                    if (index === currentIndex) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
            }
        }
        
        // Função para ir para um slide específico
        function goToSlide(index) {
            currentIndex = index;
            if (currentIndex < 0) {
                currentIndex = slides.length - 1;
            } else if (currentIndex >= slides.length) {
                currentIndex = 0;
            }
            updateCarousel();
            resetAutoplay();
        }
        
        // Função para próximo slide
        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
            resetAutoplay();
        }
        
        // Função para slide anterior
        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
            resetAutoplay();
        }
        
        // Função para resetar autoplay
        function resetAutoplay() {
            clearInterval(autoplayInterval);
            startAutoplay();
        }
        
        // Função para iniciar autoplay
        function startAutoplay() {
            // Só funciona em desktop
            if (window.innerWidth >= 768) {
                autoplayInterval = setInterval(nextSlide, autoplayDelay);
            }
        }
        
        // Event listeners
        carouselNext.addEventListener('click', nextSlide);
        carouselPrev.addEventListener('click', prevSlide);
        
        // Pausar autoplay ao passar o mouse
        const carouselContainer = document.querySelector('.hero-carousel-desktop');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => {
                clearInterval(autoplayInterval);
            });
            
            carouselContainer.addEventListener('mouseleave', () => {
                startAutoplay();
            });
        }
        
        // Iniciar autoplay
        startAutoplay();
        
        // Reiniciar autoplay ao redimensionar (para mudanças mobile/desktop)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                clearInterval(autoplayInterval);
                if (window.innerWidth >= 768) {
                    startAutoplay();
                }
            }, 250);
        });
        
        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (window.innerWidth >= 768 && carouselContainer && carouselContainer.offsetParent !== null) {
                if (e.key === 'ArrowLeft') {
                    prevSlide();
                } else if (e.key === 'ArrowRight') {
                    nextSlide();
                }
            }
        });
    }

    // ========================================
    // PARALLAX EFFECT FOR HERO BANNER MOBILE (Suave)
    // ========================================
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
});

