// ========================================
// COBERTURA PAGE - GOOGLE MAPS INTEGRATED SEARCH
// Versão INDEPENDENTE do Leaflet - não compartilha código
// ========================================

// GeoJSON embutido diretamente (não compartilha com Leaflet)
const GOOGLE_COBERTURA_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": [[[-42.823044082495414, -5.0857136184084055], [-42.81518839692427, -5.09760455068546], [-42.81426763522464, -5.116557250165101], [-42.80871645278651, -5.129589135242512], [-42.79940245939349, -5.124652447991139], [-42.77882923669381, -5.115021271635186], [-42.77921431940055, -5.104739376230455], [-42.78237221438607, -5.093612840768145], [-42.79623981458474, -5.082488102452459], [-42.80478759711036, -5.081589510292517], [-42.82025994497755, -5.08058853626936], [-42.823044082495414, -5.0857136184084055]]],
                "type": "Polygon"
            },
            "id": 0
        },
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": [[[-42.799631358664385, -5.072449535319777], [-42.790988751934464, -5.08586065935522], [-42.777278045830826, -5.089502798567139], [-42.755465243694914, -5.0773497348858285], [-42.794315759112266, -5.0676683914009715], [-42.799631358664385, -5.072449535319777]]],
                "type": "Polygon"
            },
            "id": 1
        }
    ]
};

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
    setupGeolocationButton();
    setupScrollReveal();
    // POLÍGONOS SVG PERMANENTEMENTE DESABILITADOS - causavam rabiscos verdes
    // A verificação de cobertura funciona internamente sem necessidade de desenhar polígonos
    // Os polígonos são usados apenas para cálculo matemático (Ray Casting)
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
            
            // Atualizar iframe do Google Maps para mostrar a localização buscada
            tryUpdateIframeWithLocation(lat, lng);
            
            // Mostrar marcador e overlay
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
// TENTAR ATUALIZAR IFRAME COM LOCALIZAÇÃO (LIMITADO)
// ========================================
function tryUpdateIframeWithLocation(lat, lng) {
    const iframe = document.getElementById('googleMapFrame');
    if (!iframe) return;
    
    // Construir URL do Google Maps que mostra a localização (funciona sem API key)
    // Formato do Google Maps Embed que funciona direto
    const embedUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=pt-BR&z=16&output=embed`;
    
    // Atualizar o src do iframe para mostrar a localização
    // Isso funciona porque estamos mudando a URL do iframe diretamente
    try {
        iframe.src = embedUrl;
        console.log('✅ Iframe atualizado para mostrar localização:', lat, lng);
        console.log('📍 URL do mapa:', embedUrl);
        
        // Aguardar iframe carregar e restaurar o overlay
        iframe.addEventListener('load', function() {
            // Restaurar overlay do header após carregar
            setTimeout(() => {
                const overlay = document.querySelector('.google-maps-header-overlay');
                if (overlay) {
                    overlay.style.display = 'block';
                }
            }, 500);
        }, { once: true });
    } catch (error) {
        console.warn('⚠️ Não foi possível atualizar iframe:', error);
    }
}

// ========================================
// ATUALIZAR IFRAME DO GOOGLE MAPS COM LOCALIZAÇÃO
// ========================================
function updateGoogleMapFrame(lat, lng) {
    // Tentar atualizar iframe
    tryUpdateIframeWithLocation(lat, lng);
    
    // Mostrar marcador visual sobre o iframe
    showMarkerOverlay(lat, lng);
    
    // Posicionar marcador visual preciso
    positionVisualMarker(lat, lng);
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
    // Usar GeoJSON embutido (não compartilha com Leaflet)
        coveragePolygonsData = GOOGLE_COBERTURA_GEOJSON;
        console.log('✅ GeoJSON carregado (versão Google Maps)');
        // NÃO desenhar polígonos SVG - apenas usar para verificação interna
        console.log('📊 Polígonos carregados para verificação matemática:', coveragePolygonsData.features.length);
}

// ========================================
// DESENHAR POLÍGONOS DE COBERTURA - DESABILITADO
// ========================================
// Função desabilitada para evitar rabiscos verdes no mapa
// A verificação de cobertura funciona apenas matematicamente (Ray Casting)
function drawCoveragePolygons() {
    // FUNÇÃO COMPLETAMENTE DESABILITADA
    // Os polígonos SVG causavam rabiscos verdes no mapa
    // A verificação de cobertura funciona apenas matematicamente (Ray Casting), sem desenhar
    console.log('⚠️ Desenho de polígonos SVG desabilitado para evitar rabiscos verdes');
    
    // Remover qualquer SVG existente
    const existingSVG = document.getElementById('coveragePolygonsSVG');
    if (existingSVG) {
        existingSVG.remove();
        console.log('✅ SVG removido');
    }
    
    return;
    
    /* CÓDIGO ORIGINAL COMENTADO
    if (!coveragePolygonsData || !coveragePolygonsData.features) {
        console.warn('⚠️ GeoJSON não carregado ainda');
        return;
    }
    
    const mapContainer = document.querySelector('#mapVisualLayer');
    if (!mapContainer) {
        console.warn('⚠️ Container do mapa não encontrado');
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
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '50';
    svg.style.overflow = 'hidden';
    
    const containerWidth = mapContainer.offsetWidth || 1000;
    const containerHeight = mapContainer.offsetHeight || 650;
    
    // Desenhar cada polígono de cobertura
    coveragePolygonsData.features.forEach((feature, index) => {
        if (feature.geometry.type === 'Polygon') {
            const coordinates = feature.geometry.coordinates[0];
            if (!coordinates || coordinates.length < 3) {
                console.warn('⚠️ Polígono inválido:', index);
                return;
            }
            
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            
            // Converter coordenadas geográficas para pixels
            // GeoJSON formato: [lng, lat]
            const points = coordinates.map(coord => {
                const [lng, lat] = coord;
                const x = latLngToPixel(lat, lng, containerWidth, containerHeight);
                const y = latLngToPixelY(lat, lng, containerWidth, containerHeight);
                // Validar pontos
                if (isNaN(x) || isNaN(y)) {
                    console.warn('⚠️ Coordenada inválida:', coord);
                    return null;
                }
                return `${x},${y}`;
            }).filter(p => p !== null).join(' ');
            
            // Validar se temos pontos suficientes
            if (!points || points.split(' ').length < 3) {
                console.warn('⚠️ Não há pontos suficientes para desenhar polígono:', index);
                return;
            }
            
            polygon.setAttribute('points', points);
            polygon.setAttribute('fill', 'rgba(16, 185, 129, 0.35)');
            polygon.setAttribute('stroke', '#10b981');
            polygon.setAttribute('stroke-width', '2.5');
            polygon.setAttribute('fill-opacity', '0.4');
            polygon.style.pointerEvents = 'none';
            polygon.style.vectorEffect = 'non-scaling-stroke';
            
            svg.appendChild(polygon);
            console.log('✅ Polígono desenhado:', index, 'com', coordinates.length, 'pontos');
        }
    });
    
    mapContainer.appendChild(svg);
    coverageSVG = svg;
    console.log('✅ Polígonos de cobertura desenhados:', coveragePolygonsData.features.length);
    */
}

// ========================================
// CONVERTER COORDENADAS GEOGRÁFICAS PARA PIXELS (CORRIGIDO)
// ========================================
function latLngToPixel(lat, lng, width, height) {
    const latRange = mapBounds.maxLat - mapBounds.minLat;
    const lngRange = mapBounds.maxLng - mapBounds.minLng;
    
    // Normalizar longitude (x)
    const normalizedLng = (lng - mapBounds.minLng) / lngRange;
    const x = normalizedLng * width;
    
    // Garantir que está dentro dos limites
    return Math.max(0, Math.min(width, x));
}

function latLngToPixelY(lat, lng, width, height) {
    const latRange = mapBounds.maxLat - mapBounds.minLat;
    
    // Normalizar latitude (y) - invertido porque Y começa no topo
    const normalizedLat = (mapBounds.maxLat - lat) / latRange;
    const y = normalizedLat * height;
    
    // Garantir que está dentro dos limites
    return Math.max(0, Math.min(height, y));
}

// ========================================
// VERIFICAR COBERTURA (ALGORITMO RAY CASTING CORRIGIDO)
// ========================================
function checkCoverage(lat, lng) {
    if (!coveragePolygonsData || !coveragePolygonsData.features) {
        console.log('⚠️ GeoJSON não carregado para verificação');
        return { isCovered: false };
    }
    
    console.log('🔍 Verificando cobertura para:', lat, lng);
    console.log('📊 Total de polígonos:', coveragePolygonsData.features.length);
    
    // Algoritmo Ray Casting para verificar se ponto está dentro do polígono
    for (let i = 0; i < coveragePolygonsData.features.length; i++) {
        const feature = coveragePolygonsData.features[i];
        if (feature.geometry.type !== 'Polygon') continue;
        
        const coordinates = feature.geometry.coordinates[0];
        if (!coordinates || coordinates.length === 0) continue;
        
        let inside = false;
        
        // Ray casting algorithm corrigido
        // GeoJSON formato: [lng, lat] = [x, y]
        let intersections = 0;
        
        for (let j = 0, k = coordinates.length - 1; j < coordinates.length; k = j++) {
            const point1 = coordinates[k]; // Ponto anterior
            const point2 = coordinates[j]; // Ponto atual
            
            // Extrair coordenadas
            const x1 = point1[0]; // longitude do ponto 1
            const y1 = point1[1]; // latitude do ponto 1
            const x2 = point2[0]; // longitude do ponto 2
            const y2 = point2[1]; // latitude do ponto 2
            
            // Verificar se a aresta cruza o raio horizontal que vai do ponto até o infinito
            // O raio vai da posição (lng, lat) para a direita (lng +∞)
            const rayY = lat; // Latitude do ponto que queremos verificar
            const rayX = lng; // Longitude do ponto
            
            // Verificar se a aresta cruza o raio
            if ((y1 > rayY) !== (y2 > rayY)) {
                // A aresta cruza a linha horizontal do raio
                // Calcular a interseção
                const intersectX = (rayY - y1) * (x2 - x1) / (y2 - y1) + x1;
                
                // Se a interseção está à direita do ponto (raio vai para direita)
                if (rayX < intersectX) {
                    intersections++;
                }
            }
        }
        
        // Se número de interseções é ímpar, ponto está dentro
        inside = (intersections % 2) === 1;
        
        if (inside) {
            console.log('✅ Ponto está DENTRO do polígono', i);
            return { isCovered: true };
        }
    }
    
    console.log('❌ Ponto está FORA de todos os polígonos');
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
// GEOLOCALIZAÇÃO - OBTER LOCALIZAÇÃO ATUAL
// ========================================
function setupGeolocationButton() {
    // Verificar se o navegador suporta geolocalização
    if (!navigator.geolocation) {
        console.warn('⚠️ Geolocalização não suportada pelo navegador');
        return;
    }
    
    console.log('✅ Geolocalização disponível');
    
    // Criar botão de geolocalização no overlay da busca
    const searchOverlay = document.querySelector('.map-search-overlay');
    if (!searchOverlay) return;
    
    // Criar container para o botão - posicionar no canto superior direito, acima da busca
    const geoButtonContainer = document.createElement('div');
    geoButtonContainer.className = 'geo-button-container-google';
    // Posicionar bem acima da barra de busca
    geoButtonContainer.style.cssText = `
        position: absolute;
        top: -10px;
        right: 20px;
        z-index: 302;
    `;
    
    const button = document.createElement('button');
    button.className = 'geo-location-btn-google';
    button.setAttribute('title', 'Usar minha localização atual');
    button.setAttribute('aria-label', 'Usar localização atual');
    button.innerHTML = '<span style="font-size: 1.25rem;">📍</span>';
    
    // Adicionar indicador de loading
    const loadingIndicator = document.createElement('span');
    loadingIndicator.className = 'geo-loading-indicator-google';
    loadingIndicator.innerHTML = '⏳';
    loadingIndicator.style.cssText = 'display: none; margin-left: 4px;';
    button.appendChild(loadingIndicator);
    
    button.addEventListener('click', function() {
        // Mostrar loading
        loadingIndicator.style.display = 'inline';
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'wait';
        
        getCurrentLocationGoogle(function() {
            // Esconder loading quando terminar
            loadingIndicator.style.display = 'none';
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        });
    });
    
    geoButtonContainer.appendChild(button);
    searchOverlay.appendChild(geoButtonContainer);
}

function getCurrentLocationGoogle(onComplete) {
    console.log('🌍 Solicitando localização atual...');
    
    // Verificar se já temos permissão armazenada
    const hasPermission = sessionStorage.getItem('geolocation_permission_granted_google');
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
    };
    
    const complete = function() {
        if (typeof onComplete === 'function') {
            onComplete();
        }
    };
    
    // Se já tiver permissão, buscar automaticamente
    if (hasPermission === 'true') {
        console.log('✅ Permissão já concedida, buscando localização...');
        navigator.geolocation.getCurrentPosition(
            function(position) {
                handleLocationSuccessGoogle(position);
                complete();
            },
            function(error) {
                handleLocationErrorGoogle(error);
                complete();
            },
            options
        );
        return;
    }
    
    // Se não tiver permissão ainda, pedir uma vez
    navigator.geolocation.getCurrentPosition(
        function(position) {
            sessionStorage.setItem('geolocation_permission_granted_google', 'true');
            handleLocationSuccessGoogle(position);
            complete();
        },
        function(error) {
            if (error.code === error.PERMISSION_DENIED) {
                sessionStorage.setItem('geolocation_permission_granted_google', 'false');
            }
            handleLocationErrorGoogle(error);
            complete();
        },
        options
    );
}

function handleLocationSuccessGoogle(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    console.log('✅ Localização obtida:', lat, lng);
    
    // Verificar se está em Teresina (aproximado)
    if (lat >= -5.5 && lat <= -4.8 && lng >= -43.3 && lng <= -42.2) {
        // Verificar cobertura
        const coverageResult = checkCoverage(lat, lng);
        console.log('🔍 Verificação de cobertura (geolocalização):', coverageResult);
        
        // Salvar dados
        searchMarkerData = {
            lat: lat,
            lng: lng,
            address: 'Sua localização atual',
            coverage: coverageResult,
            displayName: 'Sua localização atual'
        };
        
        // Buscar endereço reverso
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                // Formatar endereço
                let address = 'Sua localização atual';
                
                if (data.address) {
                    const addr = data.address;
                    const parts = [];
                    
                    if (addr.road || addr.pedestrian) {
                        parts.push(addr.road || addr.pedestrian);
                    }
                    if (addr.house_number) {
                        parts.push(addr.house_number);
                    }
                    if (addr.neighbourhood || addr.suburb || addr.quarter) {
                        parts.push(addr.neighbourhood || addr.suburb || addr.quarter);
                    }
                    if (addr.postcode) {
                        parts.push(addr.postcode);
                    }
                    
                    if (parts.length > 0) {
                        address = parts.join(', ');
                        address += ', Teresina - PI';
                    } else if (data.display_name) {
                        const displayParts = data.display_name.split(',');
                        address = displayParts.slice(0, 3).join(',');
                    }
                } else if (data.display_name) {
                    const displayParts = data.display_name.split(',');
                    address = displayParts.slice(0, 3).join(',');
                }
                
                // Atualizar dados do marcador
                searchMarkerData.address = address;
                
                // Mostrar resultado
                updateGoogleMapFrame(lat, lng);
                showMarkerOverlay(lat, lng);
                showSearchResult(searchMarkerData);
                
                // Mensagem de sucesso
                const coverageStatus = coverageResult.isCovered ? '✓ Área Coberta' : '⚠ Fora da Cobertura';
                showSearchMessage(`${coverageStatus}: ${address.split(',')[0]}`, coverageResult.isCovered ? 'success' : 'warning');
            })
            .catch(error => {
                console.error('Erro ao buscar endereço:', error);
                // Mostrar mesmo sem endereço
                updateGoogleMapFrame(lat, lng);
                showMarkerOverlay(lat, lng);
                showSearchResult(searchMarkerData);
            });
    } else {
        showSearchMessage('⚠️ Você não está em Teresina, PI. Esta ferramenta verifica cobertura apenas em Teresina.', 'warning');
    }
}

function handleLocationErrorGoogle(error) {
    console.error('❌ Erro ao obter localização:', error);
    let message = 'Não foi possível obter sua localização. ';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message += 'Permissão negada. Por favor, permita acesso à localização no navegador.';
            sessionStorage.setItem('geolocation_permission_granted_google', 'false');
            break;
        case error.POSITION_UNAVAILABLE:
            message += 'Localização indisponível.';
            break;
        case error.TIMEOUT:
            message += 'Tempo esgotado ao buscar localização.';
            break;
    }
    showSearchMessage(message, 'error');
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
