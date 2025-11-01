// ========================================
// COBERTURA PAGE - GOOGLE MAPS INTEGRATED SEARCH
// Solução que funciona sem API key usando iframe + busca externa
// ========================================
let searchMarkerData = null;
let coveragePolygonsData = null;
let coverageSVG = null;
let mapBounds = {
    minLat: -5.6,
    maxLat: -4.6,
    minLng: -43.5,
    maxLng: -42.0,
    centerLat: -5.09,
    centerLng: -42.8
};

document.addEventListener('DOMContentLoaded', function() {
    loadCoverageData();
    setupSearch();
    setupScrollReveal();
    // Aguardar um pouco para garantir que o iframe carregou
    setTimeout(() => {
        drawCoveragePolygons();
    }, 2000);
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
// MELHORAR QUERY DE BUSCA (mesma função do Leaflet)
// ========================================
function improveSearchQuery(query) {
    if (!query || typeof query !== 'string') {
        return query;
    }
    
    let improvedQuery = query.trim();
    
    // Se já contém "Teresina", não adicionar novamente
    const hasTeresina = /teresina/i.test(improvedQuery);
    const hasPI = /\bPI\b/i.test(improvedQuery) || /\bPiau[ií]\b/i.test(improvedQuery);
    const hasBrasil = /brasil/i.test(improvedQuery);
    
    // Detectar padrões de endereço com número
    const addressPatterns = [
        /^(\d+)\s+([a-záàâãéêíóôõúç\s]+)/i, // "1234 Rua Exemplo"
        /([a-záàâãéêíóôõúç\s]+),\s*(\d+)/i, // "Rua Exemplo, 1234"
        /([a-záàâãéêíóôõúç\s]+)\s+(\d+)$/i  // "Rua Exemplo 1234"
    ];
    
    let streetName = '';
    let houseNumber = '';
    
    // Tentar extrair rua e número
    for (let pattern of addressPatterns) {
        const match = improvedQuery.match(pattern);
        if (match) {
            if (pattern === addressPatterns[0]) {
                houseNumber = match[1].trim();
                streetName = match[2].trim();
            } else {
                streetName = match[1].trim();
                houseNumber = match[2].trim();
            }
            break;
        }
    }
    
    // Se detectou rua e número separados, construir query estruturada
    if (streetName && houseNumber) {
        improvedQuery = `${streetName}, ${houseNumber}`;
        if (!hasTeresina) improvedQuery += ', Teresina';
        if (!hasPI) improvedQuery += ', PI';
        if (!hasBrasil) improvedQuery += ', Brasil';
        console.log('✅ Endereço detectado com número:', { streetName, houseNumber, improvedQuery });
    } else {
        improvedQuery = improvedQuery.replace(/\s+/g, ' ');
        
        if (/^\d+$/.test(improvedQuery)) {
            improvedQuery = `Rua ${improvedQuery}`;
            if (!hasTeresina) improvedQuery += ', Teresina';
            if (!hasPI) improvedQuery += ', PI';
        } else {
            if (!hasTeresina) improvedQuery += ', Teresina';
            if (!hasPI) improvedQuery += ', PI';
            if (!hasBrasil) improvedQuery += ', Brasil';
        }
    }
    
    improvedQuery = improvedQuery.replace(/,+/g, ',');
    improvedQuery = improvedQuery.replace(/\s*,\s*/g, ', ');
    improvedQuery = improvedQuery.trim();
    
    return improvedQuery;
}

// ========================================
// REALIZAR BUSCA DE GEOCODING
// ========================================
function performGeocodeSearch(query) {
    const searchBtn = document.getElementById('integratedSearchBtn');
    const searchInput = document.getElementById('integratedSearchInput');
    
    // Melhorar query antes de buscar
    const improvedQuery = improveSearchQuery(query);
    console.log('🔍 Query original:', query);
    console.log('🔍 Query melhorada:', improvedQuery);
    
    // Feedback visual
    searchBtn.innerHTML = '<span>Buscando...</span>';
    searchBtn.disabled = true;
    searchInput.disabled = true;
    
    clearSearchMessage();
    
    // Extrair componentes para busca estruturada
    const queryParts = improvedQuery.split(',').map(p => p.trim());
    let street = '';
    let housenumber = '';
    let city = 'Teresina';
    let state = 'PI';
    
    for (let i = 0; i < queryParts.length; i++) {
        const part = queryParts[i];
        if (/^\d+$/.test(part)) {
            if (!housenumber && queryParts[i-1]) {
                housenumber = part;
                street = queryParts[i-1];
            }
        } else if (/teresina/i.test(part)) {
            city = 'Teresina';
        } else if (/PI|Piau[ií]/i.test(part)) {
            state = 'PI';
        }
    }
    
    // Construir URL otimizada
    let nominatimUrl;
    if (street && housenumber) {
        // Busca estruturada com rua e número
        nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&street=${encodeURIComponent(housenumber + ' ' + street)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=Brasil&limit=15&addressdetails=1&accept-language=pt-BR&viewbox=-43.2,-5.3,-42.5,-4.9&bounded=0&extratags=1`;
        console.log('🔍 Busca estruturada (rua + número)');
    } else {
        // Busca geral melhorada
        nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(improvedQuery)}&limit=15&countrycodes=br&addressdetails=1&accept-language=pt-BR&viewbox=-43.2,-5.3,-42.5,-4.9&bounded=0&extratags=1&namedetails=1`;
        console.log('🔍 Busca geral otimizada');
    }
    
    fetch(nominatimUrl, {
        headers: {
            'User-Agent': 'Amplanet-Cobertura-Map/1.0'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.length > 0) {
            // Pegar o primeiro resultado mais relevante
            let bestResult = data[0];
            
            // Se houver múltiplos resultados, preferir o que está em Teresina
            if (data.length > 1) {
                const teresinaResult = data.find(r => 
                    (r.address && r.address.city && /teresina/i.test(r.address.city)) ||
                    (r.display_name && /teresina/i.test(r.display_name))
                );
                if (teresinaResult) {
                    bestResult = teresinaResult;
                }
            }
            
            const lat = parseFloat(bestResult.lat);
            const lng = parseFloat(bestResult.lon);
            
            // Validar coordenadas
            if (isNaN(lat) || isNaN(lng)) {
                showSearchMessage('Erro: Coordenadas inválidas. Tente novamente.', 'error');
                return;
            }
            
            // Verificar se está em Teresina (aproximado)
            if (lat < -5.5 || lat > -4.8 || lng < -43.3 || lng > -42.2) {
                showSearchMessage('⚠️ Localização fora de Teresina. Verifique se o endereço está correto.', 'warning');
            }
            
            // Verificar cobertura PRECISAMENTE
            const coverageResult = checkCoverage(lat, lng);
            console.log('🔍 Verificação de cobertura:', {
                lat,
                lng,
                isCovered: coverageResult.isCovered,
                address: formatAddress(bestResult)
            });
            
            // Salvar dados do marcador
            searchMarkerData = {
                lat: lat,
                lng: lng,
                address: formatAddress(bestResult),
                coverage: coverageResult,
                displayName: bestResult.display_name || ''
            };
            
            // Atualizar iframe do Google Maps com coordenadas
            updateGoogleMapFrame(lat, lng);
            
            // Mostrar resultado
            showSearchResult(searchMarkerData);
            
            // Mensagem de sucesso com status de cobertura
            const addressPreview = searchMarkerData.address.split(',')[0];
            const coverageStatus = coverageResult.isCovered ? '✓ Área Coberta' : '⚠ Fora da Cobertura';
            showSearchMessage(`${coverageStatus}: ${addressPreview}`, coverageResult.isCovered ? 'success' : 'warning');
            
        } else {
            showSearchMessage('❌ Localização não encontrada. Tente uma busca mais específica. Ex: "Av. Ininga, 1234"', 'error');
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
// POSICIONAR MARCADOR VISUAL PRECISO
// ========================================
function positionVisualMarker(lat, lng) {
    // Remover marcador anterior
    const existingMarker = document.getElementById('visualMarker');
    if (existingMarker) {
        existingMarker.remove();
    }
    
    const mapContainer = document.querySelector('#mapVisualLayer');
    if (!mapContainer) return;
    
    // Criar marcador visual profissional
    const marker = document.createElement('div');
    marker.id = 'visualMarker';
    marker.className = 'visual-marker-precise';
    marker.innerHTML = `
        <div class="marker-pin">
            <div class="marker-pin-inner">📍</div>
            <div class="marker-pin-shadow"></div>
        </div>
    `;
    marker.title = 'Localização encontrada';
    
    // Usar função de conversão precisa
    const mapWidth = mapContainer.offsetWidth || 1000;
    const mapHeight = mapContainer.offsetHeight || 650;
    
    // Converter coordenadas geográficas para pixels usando a mesma função dos polígonos
    const left = latLngToPixel(lat, lng, mapWidth, mapHeight);
    const top = latLngToPixelY(lat, lng, mapWidth, mapHeight);
    
    marker.style.position = 'absolute';
    marker.style.top = `${Math.max(0, Math.min(mapHeight, top))}px`;
    marker.style.left = `${Math.max(0, Math.min(mapWidth, left))}px`;
    marker.style.transform = 'translate(-50%, -100%)';
    marker.style.zIndex = '1000';
    marker.style.cursor = 'pointer';
    marker.style.pointerEvents = 'all';
    
    // Animação de entrada
    marker.style.opacity = '0';
    marker.style.transform = 'translate(-50%, -100%) scale(0)';
    
    mapContainer.appendChild(marker);
    
    // Animação de entrada
    setTimeout(() => {
        marker.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        marker.style.opacity = '1';
        marker.style.transform = 'translate(-50%, -100%) scale(1)';
    }, 100);
    
    // Clique no marcador
    marker.addEventListener('click', function() {
        const overlay = document.getElementById('markerOverlay');
        if (overlay) {
            overlay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
    
    // Adicionar pulso animado
    marker.addEventListener('mouseenter', function() {
        this.style.transform = 'translate(-50%, -100%) scale(1.2)';
    });
    
    marker.addEventListener('mouseleave', function() {
        this.style.transform = 'translate(-50%, -100%) scale(1)';
    });
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
    // Tentar carregar GeoJSON embutido primeiro
    if (typeof COBERTURA_GEOJSON !== 'undefined') {
        console.log('✅ GeoJSON embutido encontrado');
        coveragePolygonsData = COBERTURA_GEOJSON;
        // Desenhar polígonos após carregar
        setTimeout(() => {
            drawCoveragePolygons();
        }, 1000);
        return;
    }
    
    // Fallback: tentar carregar do arquivo
    fetch('assets/Map/map.geojson')
        .then(response => response.json())
        .then(data => {
            coveragePolygonsData = data;
            console.log('✅ GeoJSON carregado do arquivo');
            setTimeout(() => {
                drawCoveragePolygons();
            }, 1000);
        })
        .catch(error => {
            console.error('Erro ao carregar GeoJSON:', error);
        });
}

// ========================================
// DESENHAR POLÍGONOS DE COBERTURA SOBRE O IFRAME
// ========================================
function drawCoveragePolygons() {
    if (!coveragePolygonsData || !coveragePolygonsData.features) {
        console.warn('⚠️ GeoJSON não carregado ainda');
        setTimeout(drawCoveragePolygons, 500);
        return;
    }
    
    const mapContainer = document.querySelector('#mapVisualLayer');
    if (!mapContainer) {
        console.warn('⚠️ Container do mapa não encontrado');
        setTimeout(drawCoveragePolygons, 500);
        return;
    }
    
    // Remover SVG anterior se existir
    const existingSVG = document.getElementById('coveragePolygonsSVG');
    if (existingSVG) {
        existingSVG.remove();
    }
    
    // Criar SVG para desenhar os polígonos
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'coveragePolygonsSVG';
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '50';
    
    const containerWidth = mapContainer.offsetWidth || 1000;
    const containerHeight = mapContainer.offsetHeight || 650;
    
    // Desenhar cada polígono de cobertura
    coveragePolygonsData.features.forEach((feature, index) => {
        if (feature.geometry.type === 'Polygon') {
            const coordinates = feature.geometry.coordinates[0];
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            
            // Converter coordenadas geográficas para pixels
            const points = coordinates.map(coord => {
                const [lng, lat] = coord;
                const x = latLngToPixel(lat, lng, containerWidth, containerHeight);
                const y = latLngToPixelY(lat, lng, containerWidth, containerHeight);
                return `${x},${y}`;
            }).join(' ');
            
            polygon.setAttribute('points', points);
            polygon.setAttribute('fill', 'rgba(16, 185, 129, 0.35)');
            polygon.setAttribute('stroke', '#10b981');
            polygon.setAttribute('stroke-width', '2.5');
            polygon.setAttribute('fill-opacity', '0.4');
            polygon.style.pointerEvents = 'none';
            
            svg.appendChild(polygon);
        }
    });
    
    mapContainer.appendChild(svg);
    coverageSVG = svg;
    console.log('✅ Polígonos de cobertura desenhados:', coveragePolygonsData.features.length);
}

// ========================================
// CONVERTER COORDENADAS GEOGRÁFICAS PARA PIXELS
// ========================================
function latLngToPixel(lat, lng, width, height) {
    const latRange = mapBounds.maxLat - mapBounds.minLat;
    const lngRange = mapBounds.maxLng - mapBounds.minLng;
    
    const normalizedLng = (lng - mapBounds.minLng) / lngRange;
    return normalizedLng * width;
}

function latLngToPixelY(lat, lng, width, height) {
    const latRange = mapBounds.maxLat - mapBounds.minLat;
    const normalizedLat = (mapBounds.maxLat - lat) / latRange; // Invertido porque Y começa no topo
    return normalizedLat * height;
}

// ========================================
// VERIFICAR COBERTURA (ALGORITMO RAY CASTING)
// ========================================
function checkCoverage(lat, lng) {
    if (!coveragePolygonsData || !coveragePolygonsData.features) {
        return { isCovered: false };
    }
    
    // Algoritmo Ray Casting para verificar se ponto está dentro do polígono
    for (let i = 0; i < coveragePolygonsData.features.length; i++) {
        const feature = coveragePolygonsData.features[i];
        if (feature.geometry.type !== 'Polygon') continue;
        
        const coordinates = feature.geometry.coordinates[0];
        
        let inside = false;
        for (let j = 0, k = coordinates.length - 1; j < coordinates.length; k = j++) {
            const [xi, yi] = coordinates[j];
            const [xj, yj] = coordinates[k];
            
            // Ray casting algorithm
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
