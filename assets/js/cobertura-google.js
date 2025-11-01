// ========================================
// COBERTURA PAGE - GOOGLE MAPS INTEGRATED SEARCH
// Solução que funciona sem API key usando iframe + busca externa
// ========================================
let searchMarkerData = null;
let coveragePolygonsData = null;

document.addEventListener('DOMContentLoaded', function() {
    loadCoverageData();
    setupSearch();
    setupScrollReveal();
});

// ========================================
// CONFIGURAR BUSCA INTEGRADA
// ========================================
function setupSearch() {
    const searchInput = document.getElementById('integratedSearchInput');
    const searchBtn = document.getElementById('integratedSearchBtn');
    
    if (!searchInput || !searchBtn) return;
    
    // Buscar localização usando Nominatim (gratuito, não precisa API key)
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            performGeocodeSearch(query);
        } else {
            showSearchMessage('Por favor, digite um endereço ou localização.', 'warning');
        }
    });
    
    // Enter no campo
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                performGeocodeSearch(query);
            }
        }
    });
    
    // Feedback visual
    searchInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            this.classList.add('has-content');
        } else {
            this.classList.remove('has-content');
        }
    });
}

// ========================================
// REALIZAR BUSCA DE GEOCODING
// ========================================
function performGeocodeSearch(query) {
    const searchBtn = document.getElementById('integratedSearchBtn');
    const searchInput = document.getElementById('integratedSearchInput');
    
    // Preparar query
    let searchQuery = query.trim();
    if (!searchQuery.toLowerCase().includes('teresina') && !searchQuery.toLowerCase().includes('pi')) {
        searchQuery += ', Teresina, PI, Brasil';
    }
    
    // Feedback visual
    searchBtn.innerHTML = '<span>Buscando...</span>';
    searchBtn.disabled = true;
    searchInput.disabled = true;
    
    clearSearchMessage();
    
    // Buscar usando Nominatim (OpenStreetMap - gratuito)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1&countrycodes=br`;
    
    fetch(nominatimUrl, {
        headers: {
            'User-Agent': 'Amplanet-Cobertura-Map'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            
            // Salvar dados do marcador
            searchMarkerData = {
                lat: lat,
                lng: lng,
                address: formatAddress(result),
                coverage: checkCoverage(lat, lng)
            };
            
            // Atualizar iframe do Google Maps com coordenadas
            updateGoogleMapFrame(lat, lng);
            
            // Mostrar resultado
            showSearchResult(searchMarkerData);
            
            // Mensagem de sucesso
            showSearchMessage(`Localização encontrada: ${searchMarkerData.address.split(',')[0]}`, 'success');
            
        } else {
            showSearchMessage('Localização não encontrada. Tente uma busca mais específica.', 'error');
        }
    })
    .catch(error => {
        console.error('Erro na busca:', error);
        showSearchMessage('Erro ao buscar localização. Tente novamente.', 'error');
    })
    .finally(() => {
        searchBtn.innerHTML = '<span>Pesquisar</span>';
        searchBtn.disabled = false;
        searchInput.disabled = false;
    });
}

// ========================================
// ATUALIZAR IFRAME DO GOOGLE MAPS
// ========================================
function updateGoogleMapFrame(lat, lng) {
    // Como não podemos modificar diretamente o iframe do Google My Maps,
    // vamos criar um overlay visual com marcador e informações
    showMarkerOverlay(lat, lng);
    
    // Também podemos tentar atualizar o iframe se possível (limitado)
    // Mas o overlay é mais confiável
}

// ========================================
// MOSTRAR OVERLAY DO MARCADOR
// ========================================
function showMarkerOverlay(lat, lng) {
    // Remover overlay anterior se existir
    const existingOverlay = document.getElementById('markerOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.id = 'markerOverlay';
    overlay.className = 'marker-overlay';
    
    const data = searchMarkerData || {
        lat: lat,
        lng: lng,
        address: 'Localização encontrada',
        coverage: checkCoverage(lat, lng)
    };
    
    overlay.innerHTML = `
        <div class="marker-overlay-content">
            <button class="marker-overlay-close" onclick="this.closest('#markerOverlay').remove()">&times;</button>
            <div class="marker-overlay-header">
                <div class="marker-icon-large">📍</div>
                <div>
                    <h3 class="marker-overlay-title">${data.address}</h3>
                    <p class="marker-overlay-subtitle">Teresina, PI</p>
                </div>
            </div>
            <div class="marker-overlay-body">
                ${data.coverage.isCovered 
                    ? `<div class="coverage-status coverage-covered">
                        <div class="coverage-icon">✓</div>
                        <div>
                            <div class="coverage-title">Área Coberta</div>
                            <div class="coverage-text">Você pode contratar nossos planos de internet fibra óptica!</div>
                        </div>
                    </div>` 
                    : `<div class="coverage-status coverage-none">
                        <div class="coverage-icon">⚠</div>
                        <div>
                            <div class="coverage-title">Fora da Cobertura</div>
                            <div class="coverage-text">Entre em contato para verificar disponibilidade.</div>
                        </div>
                    </div>`}
            </div>
            <div class="marker-overlay-footer">
                <a href="https://wa.me/55869988230492?text=Olá!%20Gostaria%20de%20verificar%20cobertura%20em%20${encodeURIComponent(data.address)}" 
                   class="btn btn-primary btn-small" target="_blank">Verificar pelo WhatsApp</a>
            </div>
        </div>
    `;
    
    document.querySelector('.map-wrapper-google-integrated').appendChild(overlay);
    
    // Posicionar o marcador visual no mapa (aproximado)
    positionVisualMarker(lat, lng);
}

// ========================================
// POSICIONAR MARCADOR VISUAL
// ========================================
function positionVisualMarker(lat, lng) {
    // Remover marcador anterior
    const existingMarker = document.getElementById('visualMarker');
    if (existingMarker) {
        existingMarker.remove();
    }
    
    // Como não temos acesso ao iframe, vamos criar um marcador visual
    // que aparece sobre o mapa (apenas visual, não interativo com o iframe)
    const marker = document.createElement('div');
    marker.id = 'visualMarker';
    marker.className = 'visual-marker';
    marker.innerHTML = '📍';
    marker.title = 'Localização encontrada';
    
    // Posicionamento aproximado (funciona melhor se o mapa estiver no zoom padrão)
    // Isso é uma aproximação visual
    const mapContainer = document.querySelector('.google-map-container');
    if (mapContainer) {
        mapContainer.style.position = 'relative';
        mapContainer.appendChild(marker);
        
        // Tentar posicionar baseado nas coordenadas (aproximado)
        // Isso é limitado porque não temos controle total do iframe
        marker.style.position = 'absolute';
        marker.style.zIndex = '1000';
        marker.style.cursor = 'pointer';
        
        // Por enquanto, centralizar visualmente
        marker.style.top = '45%';
        marker.style.left = '50%';
        marker.style.transform = 'translate(-50%, -50%)';
        marker.style.fontSize = '2rem';
        marker.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
        
        marker.addEventListener('click', function() {
            const overlay = document.getElementById('markerOverlay');
            if (overlay) {
                overlay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
}

// ========================================
// MOSTRAR RESULTADO DA BUSCA
// ========================================
function showSearchResult(data) {
    // Scroll suave para o overlay
    setTimeout(() => {
        const overlay = document.getElementById('markerOverlay');
        if (overlay) {
            overlay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}

// ========================================
// FORMATAR ENDEREÇO
// ========================================
function formatAddress(result) {
    const address = result.address || {};
    const parts = [];
    
    if (address.road) parts.push(address.road);
    if (address.house_number) parts.push(`nº ${address.house_number}`);
    if (address.neighbourhood || address.suburb) parts.push(address.neighbourhood || address.suburb);
    if (address.city_district) parts.push(address.city_district);
    
    if (parts.length > 0) {
        return parts.join(', ') + (address.city ? `, ${address.city}` : '');
    }
    
    return result.display_name || 'Localização encontrada';
}

// ========================================
// CARREGAR DADOS DE COBERTURA
// ========================================
function loadCoverageData() {
    fetch('assets/Map/map.geojson')
        .then(response => response.json())
        .then(data => {
            coveragePolygonsData = data;
        })
        .catch(error => {
            console.error('Erro ao carregar GeoJSON:', error);
        });
}

// ========================================
// VERIFICAR COBERTURA
// ========================================
function checkCoverage(lat, lng) {
    if (!coveragePolygonsData) {
        return { isCovered: false };
    }
    
    // Algoritmo Ray Casting para verificar se ponto está dentro do polígono
    for (let i = 0; i < coveragePolygonsData.features.length; i++) {
        const feature = coveragePolygonsData.features[i];
        const coordinates = feature.geometry.coordinates[0];
        
        let inside = false;
        for (let j = 0, k = coordinates.length - 1; j < coordinates.length; k = j++) {
            const xi = coordinates[j][0];
            const yi = coordinates[j][1];
            const xj = coordinates[k][0];
            const yj = coordinates[k][1];
            
            const intersect = ((yi > lat) !== (yj > lat)) &&
                (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        if (inside) {
            return { isCovered: true };
        }
    }
    
    return { isCovered: false };
}

// ========================================
// MENSAGENS DE FEEDBACK
// ========================================
function showSearchMessage(message, type) {
    clearSearchMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'searchMessageGoogle';
    messageDiv.className = `search-message-google search-message-google-${type}`;
    messageDiv.textContent = message;
    
    const searchOverlay = document.querySelector('.map-search-overlay');
    if (searchOverlay) {
        searchOverlay.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 5000);
    }
}

function clearSearchMessage() {
    const existingMessage = document.getElementById('searchMessageGoogle');
    if (existingMessage) {
        existingMessage.remove();
    }
}

// ========================================
// SCROLL REVEAL
// ========================================
function setupScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.info-card, .instruction-item, .cobertura-cta');
    revealElements.forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });
}
