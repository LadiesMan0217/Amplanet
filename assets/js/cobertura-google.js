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
let currentPinCoordinates = null; // Armazenar coordenadas do pin para recalcular posição
let mapBounds = {
    minLat: -5.6,
    maxLat: -4.6,
    minLng: -43.5,
    maxLng: -42.0,
    centerLat: -5.09,
    centerLng: -42.8
};

    document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está em file:// e mostrar aviso
    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) {
        const warningDiv = document.getElementById('fileProtocolWarning');
        if (warningDiv) {
            warningDiv.style.display = 'block';
        }
        console.warn('⚠️ Arquivo aberto via file:// - A busca pode não funcionar devido a CORS');
        console.info('💡 Para usar a busca, use um servidor HTTP local:\n' +
            '  VS Code: Instale "Live Server" → Clique direito → "Open with Live Server"\n' +
            '  Python: python -m http.server 8000 → http://localhost:8000\n' +
            '  Node.js: npx http-server → http://localhost:8080');
    }
    
    loadCoverageData();
    setupSearch();
    setupAutocomplete();
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
            hideAutocompleteDropdown();
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
                hideAutocompleteDropdown();
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
            hideAutocompleteDropdown();
        }
    });
}

// ========================================
// AUTCOMPLETE DE ENDEREÇOS (NOMINATIM)
// ========================================
let autocompleteTimeout = null;
let currentAutocompleteRequest = null;

function setupAutocomplete() {
    const searchInput = document.getElementById('integratedSearchInput');
    const dropdown = document.getElementById('autocompleteDropdown');
    
    if (!searchInput || !dropdown) return;
    
    // Buscar sugestões conforme digita (com debounce)
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Limpar timeout anterior
        if (autocompleteTimeout) {
            clearTimeout(autocompleteTimeout);
        }
        
        // Limpar requisição anterior se ainda estiver pendente
        if (currentAutocompleteRequest) {
            currentAutocompleteRequest.abort();
            currentAutocompleteRequest = null;
        }
        
        if (query.length < 3) {
            hideAutocompleteDropdown();
            return;
        }
        
        // Debounce de 300ms
        autocompleteTimeout = setTimeout(() => {
            fetchAutocompleteSuggestions(query);
        }, 300);
    });
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            hideAutocompleteDropdown();
        }
    });
    
    // Fechar dropdown ao pressionar Escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideAutocompleteDropdown();
        }
    });
}

function fetchAutocompleteSuggestions(query) {
    const dropdown = document.getElementById('autocompleteDropdown');
    if (!dropdown) return;
    
    // Melhorar query para Teresina ou São Luís
    let improvedQuery = improveSearchQuery(query);
    
    // Se a query não mencionar cidade explicitamente, fazer busca mais ampla
    // O filtro depois vai garantir que só mostre Teresina e São Luís
    if (!/teresina|são luís|sao luis|são luiz|sao luiz/i.test(improvedQuery)) {
        // Adicionar contexto de busca para melhorar resultados
        improvedQuery = `${improvedQuery}`;
    }
    
    // Construir URL da API Nominatim
    const params = new URLSearchParams({
        q: improvedQuery,
        format: 'json',
        addressdetails: '1',
        limit: '8',
        countrycodes: 'br',
        'accept-language': 'pt-BR,pt',
        viewbox: '-43.5,-5.6,-42.0,-4.6', // Bounding box cobrindo Teresina e São Luís
        bounded: '0'
    });
    
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    
    // Mostrar loading
    dropdown.innerHTML = '<div class="autocomplete-item autocomplete-loading">Buscando...</div>';
    dropdown.classList.add('show');
    
    // Criar AbortController para cancelar requisição se necessário
    const controller = new AbortController();
    currentAutocompleteRequest = controller;
    
    fetch(url, {
        method: 'GET',
        headers: {
            'User-Agent': 'AmplanetCobertura/1.0'
        },
        signal: controller.signal
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro na requisição');
        return response.json();
    })
    .then(data => {
        // Verificar se a requisição ainda é a atual
        if (currentAutocompleteRequest !== controller) return;
        
        // Filtrar resultados para Teresina, PI e São Luís, MA
        const filteredResults = data.filter(result => {
            const address = result.address || {};
            const city = (address.city || address.town || address.municipality || '').toLowerCase();
            const state = (address.state || '').toLowerCase();
            
            // Verificar se é Teresina, PI
            const isTeresina = (city.includes('teresina') && (state.includes('piauí') || state.includes('pi')));
            
            // Verificar se é São Luís, MA
            const isSaoLuis = (
                (city.includes('são luís') || city.includes('sao luis') || city.includes('são luiz') || city.includes('sao luiz')) &&
                (state.includes('maranhão') || state.includes('ma'))
            );
            
            return isTeresina || isSaoLuis;
        });
        
        if (filteredResults.length === 0) {
            dropdown.innerHTML = '<div class="autocomplete-item autocomplete-no-results">Nenhum resultado encontrado</div>';
            return;
        }
        
        // Renderizar sugestões
        dropdown.innerHTML = '';
        filteredResults.forEach((result, index) => {
            const item = createAutocompleteItem(result, index);
            dropdown.appendChild(item);
        });
    })
    .catch(error => {
        if (error.name === 'AbortError') {
            // Requisição foi cancelada, ignorar
            return;
        }
        console.error('Erro ao buscar sugestões:', error);
        dropdown.innerHTML = '<div class="autocomplete-item autocomplete-error">Erro ao buscar sugestões</div>';
    });
}

function createAutocompleteItem(result, index) {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.setAttribute('data-index', index);
    item.setAttribute('tabindex', '0');
    
    const address = result.address || {};
    const displayName = result.display_name || '';
    
    // Construir endereço formatado
    let formattedAddress = '';
    
    // Tentar construir endereço completo
    const parts = [];
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    if (address.neighbourhood || address.suburb) parts.push(address.neighbourhood || address.suburb);
    if (address.city || address.town) parts.push(address.city || address.town);
    if (address.state) parts.push(address.state);
    
    formattedAddress = parts.length > 0 ? parts.join(', ') : displayName;
    
    // Limitar tamanho do endereço
    if (formattedAddress.length > 80) {
        formattedAddress = formattedAddress.substring(0, 77) + '...';
    }
    
    item.innerHTML = `
        <div class="autocomplete-item-icon">📍</div>
        <div class="autocomplete-item-content">
            <div class="autocomplete-item-main">${formattedAddress}</div>
        </div>
    `;
    
    // Adicionar evento de clique
    item.addEventListener('click', function() {
        selectAutocompleteItem(result);
    });
    
    // Adicionar evento de teclado
    item.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectAutocompleteItem(result);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = dropdown.querySelector(`[data-index="${index + 1}"]`);
            if (next) next.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = dropdown.querySelector(`[data-index="${index - 1}"]`);
            if (prev) prev.focus();
        }
    });
    
    return item;
}

function selectAutocompleteItem(result) {
    const searchInput = document.getElementById('integratedSearchInput');
    if (!searchInput) return;
    
    // Preencher campo com o endereço selecionado
    const displayName = result.display_name || '';
    searchInput.value = displayName;
    
    // Fechar dropdown
    hideAutocompleteDropdown();
    
    // Executar busca
    performGeocodeSearch(displayName);
}

function hideAutocompleteDropdown() {
    const dropdown = document.getElementById('autocompleteDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
        dropdown.innerHTML = '';
    }
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
    
    // ========================================
    // EXPLICAÇÃO DOS BLOQUEIOS:
    // ========================================
    // 1. VIA FILE:// (arquivo local):
    //    - CORS bloqueia porque origem é 'null'
    //    - Navegador não permite requisições de file:// por segurança
    //
    // 2. VIA HTTP (servidor local):
    //    - Nominatim retorna 403 Forbidden
    //    - Motivo: Nominatim exige User-Agent válido
    //    - fetch() NÃO permite enviar User-Agent customizado (limitação do navegador)
    //
    // SOLUÇÃO: Usar proxy CORS que faz requisição do lado do servidor
    // O proxy tem User-Agent válido e retorna os dados sem bloqueios
    // ========================================
    
    // Detectar se está sendo aberto via file:// (arquivo local)
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (isFileProtocol) {
        // Mostrar mensagem clara sobre usar servidor HTTP
        const errorMsg = `⚠️ Para usar a busca, é necessário abrir a página através de um servidor HTTP local.
        
Opções rápidas:
1. VS Code: Instale "Live Server" e clique com botão direito → "Open with Live Server"
2. Python: python -m http.server 8000 (depois acesse http://localhost:8000)
3. Node.js: npx http-server (depois acesse http://localhost:8080)`;
        
        console.error('❌ Arquivo aberto via file:// - CORS bloqueado');
        console.warn('📝 Explicação: O navegador bloqueia requisições de origem "null" (file://) por segurança');
        console.warn(errorMsg);
        showSearchMessage('⚠️ Para usar a busca, abra a página via servidor HTTP local. Veja o console (F12) para instruções.', 'error');
        searchBtn.innerHTML = '<span>🔍</span>';
        searchBtn.disabled = false;
        searchInput.disabled = false;
        return;
    }
    
    // SOLUÇÃO: Usar proxy CORS para contornar restrições do Nominatim
    // O Nominatim bloqueia requisições sem User-Agent apropriado
    // fetch() não permite enviar User-Agent customizado (política do navegador)
    // O proxy faz a requisição do lado do servidor com User-Agent válido
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(nominatimUrl)}`;
    
    console.log('🔍 Usando proxy CORS para buscar:', improvedQuery);
    
    fetch(proxyUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(proxyResponse => {
        // O proxy allorigins.win retorna: { contents: "[...JSON string...]" }
        let data;
        try {
            if (proxyResponse.contents) {
                // O contents é uma string JSON que precisa ser parseada
                data = JSON.parse(proxyResponse.contents);
            } else if (Array.isArray(proxyResponse)) {
                // Se já vier como array (fallback)
                data = proxyResponse;
            } else {
                console.error('❌ Formato de resposta inesperado do proxy:', proxyResponse);
                throw new Error('Formato de resposta inválido do proxy');
            }
        } catch (parseError) {
            console.error('❌ Erro ao parsear resposta do proxy:', parseError);
            console.error('Resposta recebida:', proxyResponse);
            throw new Error('Erro ao processar resposta do serviço de busca');
        }
        
        if (!Array.isArray(data)) {
            console.error('❌ Resposta não é um array:', data);
            throw new Error('Formato de resposta inválido');
        }
        
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
            
            // Verificar se está em Teresina, PI ou São Luís, MA (aproximado)
            const isTeresina = (lat >= -5.5 && lat <= -4.8 && lng >= -43.3 && lng <= -42.2);
            const isSaoLuis = (lat >= -2.7 && lat <= -2.4 && lng >= -44.4 && lng <= -44.1);
            
            if (!isTeresina && !isSaoLuis) {
                showSearchMessage('⚠️ Localização fora de Teresina, PI ou São Luís, MA. Verifique se o endereço está correto.', 'warning');
            }
            
            // Salvar dados do marcador
            searchMarkerData = {
                lat: lat,
                lng: lng,
                address: formatAddress(bestResult),
                displayName: bestResult.display_name || ''
            };
            
            // Atualizar iframe para centralizar na localização (polígonos preservados com mid)
            console.log('📍 Localização encontrada:', lat, lng);
            
            // Atualizar mapa e mostrar marcador
            updateGoogleMapFrame(lat, lng);
            
            // Mensagem de sucesso
            const addressPreview = searchMarkerData.address.split(',')[0];
            showSearchMessage(`✓ Endereço encontrado: ${addressPreview}`, 'success');
            
        } else {
            showSearchMessage('❌ Localização não encontrada. Tente uma busca mais específica. Ex: "Av. Ininga, 1234"', 'error');
        }
    })
    .catch(error => {
        console.error('❌ Erro na busca:', error);
        
        // Mensagens específicas por tipo de erro
        let errorMessage = 'Erro ao buscar localização.';
        
        // Detectar tipo de erro
        const isCORS = error.message.includes('CORS') || error.message.includes('Failed to fetch') || error.message.includes('origin \'null\'');
        const is403 = error.message.includes('403') || error.message.includes('Forbidden');
        
        if (isCORS) {
            const isFileProtocol = window.location.protocol === 'file:';
            if (isFileProtocol) {
                errorMessage = '⚠️ Para usar a busca, abra esta página através de um servidor HTTP local (não via file://). Veja o console (F12) para instruções.';
                console.error('❌ CORS bloqueado - Arquivo aberto via file://');
                console.warn('💡 SOLUÇÃO: Use um servidor HTTP local:\n' +
                    '  • VS Code: Instale "Live Server" → Clique direito → "Open with Live Server"\n' +
                    '  • Python: python -m http.server 8000 → http://localhost:8000\n' +
                    '  • Node.js: npx http-server → http://localhost:8080');
            } else {
                errorMessage = '⚠️ Erro de conexão com o serviço de busca. Verifique sua conexão ou tente novamente em alguns instantes.';
                console.warn('💡 Dica: O Nominatim pode estar bloqueando requisições. Tente novamente em alguns segundos.');
            }
        } else if (is403) {
            errorMessage = '⚠️ Serviço temporariamente indisponível. Por favor, tente novamente em alguns instantes.';
            console.warn('💡 Dica: Muitas requisições podem ter causado bloqueio temporário. Aguarde alguns segundos.');
        }
        
        showSearchMessage(errorMessage, 'error');
    })
    .finally(() => {
        searchBtn.innerHTML = '<span>🔍</span>';
        searchBtn.disabled = false;
        searchInput.disabled = false;
    });
}

// ========================================
// ATUALIZAR IFRAME DO GOOGLE MY MAPS COM LOCALIZAÇÃO
// ========================================
// Usa parâmetros de URL para centralizar mantendo o mapa original (polígonos preservados)
function tryUpdateIframeWithLocation(lat, lng) {
    const iframe = document.getElementById('googleMapFrame');
    if (!iframe) return;
    
    // Google My Maps Embed suporta parâmetros ll (lat,lng) e z (zoom) para centralizar
    // O parâmetro mid (map ID) deve ser mantido para preservar os polígonos
    // Adicionar marcador usando parâmetro q (query) ou marker
    const baseUrl = 'https://www.google.com/maps/d/u/0/embed';
    const mapId = '14iGHLTHtyeRc3mlZo8lNjbmouohSYA0';
    
    // Tentar adicionar marcador na URL usando diferentes formatos
    // Formato 1: Usar ll para centralizar e tentar adicionar marcador
    // Nota: Google My Maps pode não suportar marcadores customizados via URL
    const embedUrl = `${baseUrl}?mid=${mapId}&ehbc=2E312F&noprof=1&ll=${lat},${lng}&z=16`;
    
    try {
        iframe.src = embedUrl;
        console.log('✅ Iframe atualizado para centralizar em:', lat, lng);
        console.log('📍 URL:', embedUrl);
        
        // Restaurar overlay do header após carregar
        iframe.addEventListener('load', function() {
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
// ATUALIZAR VISUALIZAÇÃO DO MAPA
// ========================================
function updateGoogleMapFrame(lat, lng) {
    // Atualizar iframe para centralizar na localização (mantendo polígonos com mid)
    tryUpdateIframeWithLocation(lat, lng);
    
    // Aguardar o iframe carregar antes de posicionar o pin
    const iframe = document.getElementById('googleMapFrame');
    if (iframe) {
        const positionPinAfterLoad = function() {
            // Posicionar marcador visual preciso (apenas pin, sem overlay)
            positionVisualMarker(lat, lng);
            // Remover listener após usar
            iframe.removeEventListener('load', positionPinAfterLoad);
        };
        
        iframe.addEventListener('load', positionPinAfterLoad, { once: true });
        
        // Se o iframe já carregou, posicionar após um pequeno delay
        setTimeout(() => {
            if (document.getElementById('visualMarker')) {
                // Se já existe um marker, apenas atualizar posição
                const marker = document.getElementById('visualMarker');
                if (marker.updatePosition) {
                    marker.updatePosition();
                }
            } else {
                // Se não existe, criar novo
                positionVisualMarker(lat, lng);
            }
        }, 500);
    } else {
        // Fallback: aguardar um tempo antes de posicionar
        setTimeout(() => {
            positionVisualMarker(lat, lng);
        }, 500);
    }
}

// ========================================
// MOSTRAR OVERLAY DO MARCADOR (REMOVIDO)
// ========================================
// Função removida - agora usamos apenas o pin visual
// A verificação de cobertura é feita visualmente pelo usuário no mapa

// ========================================
// POSICIONAR MARCADOR VISUAL PRECISO
// ========================================
function positionVisualMarker(lat, lng) {
    // Armazenar coordenadas para recalcular quando necessário
    currentPinCoordinates = { lat, lng };
    
    // Remover marcador anterior e limpar recursos
    const existingMarker = document.getElementById('visualMarker');
    if (existingMarker) {
        // Limpar intervalos e observers antes de remover
        if (existingMarker.cleanup) {
            existingMarker.cleanup();
        }
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
    
    // Função para calcular posição do pin - simplificada
    // Como o pin só aparece quando o mapa está centralizado no endereço,
    // podemos posicioná-lo sempre no centro do container
    const updatePinPosition = () => {
        const mapWidth = mapContainer.offsetWidth || 1000;
        const mapHeight = mapContainer.offsetHeight || 650;
        
        // Posicionar pin no centro do mapa (já que o mapa está centralizado no endereço)
        const centerX = mapWidth / 2;
        const centerY = mapHeight / 2;
        
        // Aplicar posição no centro
        marker.style.top = `${centerY}px`;
        marker.style.left = `${centerX}px`;
    };
    
    // Posicionar pin fixo no endereço (centro do mapa)
    marker.style.position = 'absolute';
    marker.style.transform = 'translate(-50%, -100%)';
    marker.style.zIndex = '10000'; // Z-index alto para ficar acima de tudo
    marker.style.cursor = 'pointer';
    marker.style.pointerEvents = 'all';
    marker.style.willChange = 'transform'; // Otimização de performance
    
    // Calcular e aplicar posição inicial (centro do mapa)
    updatePinPosition();
    
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
    
    // Tooltip com endereço ao passar o mouse
    if (searchMarkerData && searchMarkerData.address) {
        marker.title = searchMarkerData.address;
    }
    
    // Adicionar pulso animado
    marker.addEventListener('mouseenter', function() {
        this.style.transform = 'translate(-50%, -100%) scale(1.2)';
    });
    
    marker.addEventListener('mouseleave', function() {
        this.style.transform = 'translate(-50%, -100%) scale(1)';
    });
    
    // Observar redimensionamento do container (atualizar posição do pin no centro)
    const resizeObserver = new ResizeObserver(() => {
        if (currentPinCoordinates && document.getElementById('visualMarker')) {
            updatePinPosition();
        }
    });
    resizeObserver.observe(mapContainer);
    
    // Detectar quando o usuário move o mapa e remover o pin
    const mapWrapper = mapContainer.closest('.map-wrapper-google-integrated');
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    
    // Função para remover o pin quando o mapa é movido
    const removePinOnMapMove = () => {
        if (hasMoved) {
            const existingMarker = document.getElementById('visualMarker');
            if (existingMarker) {
                // Animação de saída suave
                existingMarker.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                existingMarker.style.opacity = '0';
                existingMarker.style.transform = 'translate(-50%, -100%) scale(0)';
                
                setTimeout(() => {
                    if (existingMarker.cleanup) {
                        existingMarker.cleanup();
                    }
                    existingMarker.remove();
                    currentPinCoordinates = null;
                }, 300);
            }
        }
    };
    
    if (mapWrapper) {
        // Detectar início de interação
        const handleInteractionStart = (e) => {
            hasMoved = false;
            // Capturar posição inicial do mouse/touch
            if (e.type === 'mousedown') {
                startX = e.clientX;
                startY = e.clientY;
            } else if (e.type === 'touchstart' && e.touches.length > 0) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        };
        
        // Detectar movimento do mapa
        const handleInteractionMove = (e) => {
            let currentX, currentY;
            
            if (e.type === 'mousemove') {
                currentX = e.clientX;
                currentY = e.clientY;
            } else if (e.type === 'touchmove' && e.touches.length > 0) {
                currentX = e.touches[0].clientX;
                currentY = e.touches[0].clientY;
            }
            
            // Calcular distância movida
            if (currentX !== undefined && currentY !== undefined) {
                const deltaX = Math.abs(currentX - startX);
                const deltaY = Math.abs(currentY - startY);
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Se moveu mais de 5 pixels, considerar que o mapa foi movido
                if (distance > 5) {
                    hasMoved = true;
                    removePinOnMapMove();
                }
            }
        };
        
        // Detectar zoom (scroll)
        const handleZoom = () => {
            hasMoved = true;
            removePinOnMapMove();
        };
        
        // Eventos de mouse
        mapWrapper.addEventListener('mousedown', handleInteractionStart);
        mapWrapper.addEventListener('mousemove', handleInteractionMove);
        
        // Eventos de touch
        mapWrapper.addEventListener('touchstart', handleInteractionStart, { passive: true });
        mapWrapper.addEventListener('touchmove', handleInteractionMove, { passive: true });
        
        // Detectar zoom (scroll do mouse)
        mapWrapper.addEventListener('wheel', handleZoom, { passive: true });
        
        // Detectar zoom por gestos (pinch)
        let lastTouchDistance = 0;
        mapWrapper.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                lastTouchDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
            }
        }, { passive: true });
        
        mapWrapper.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                // Se a distância entre os toques mudou significativamente, é zoom
                if (Math.abs(currentDistance - lastTouchDistance) > 10) {
                    hasMoved = true;
                    removePinOnMapMove();
                    lastTouchDistance = currentDistance;
                }
            }
        }, { passive: true });
    }
    
    // Limpar recursos quando o marker for removido
    const cleanup = () => {
        if (resizeObserver) resizeObserver.disconnect();
    };
    
    // Armazenar função de atualização e limpeza no marker
    marker.updatePosition = updatePinPosition;
    marker.resizeObserver = resizeObserver;
    marker.cleanup = cleanup;
}

// ========================================
// MOSTRAR RESULTADO DA BUSCA (REMOVIDO)
// ========================================
// Função removida - não há mais overlay para mostrar

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
// VERIFICAR COBERTURA (ALGORITMO WINDING NUMBER + RAY CASTING)
// ========================================
function checkCoverage(lat, lng) {
    // Validar entrada
    const pointLat = parseFloat(lat);
    const pointLng = parseFloat(lng);
    
    if (isNaN(pointLat) || isNaN(pointLng)) {
        console.error('❌ Coordenadas inválidas:', lat, lng);
        return { isCovered: false };
    }
    
    if (!coveragePolygonsData || !coveragePolygonsData.features) {
        console.log('⚠️ GeoJSON não carregado para verificação');
        return { isCovered: false };
    }
    
    console.log('🔍 Verificando cobertura para:', pointLat, pointLng);
    console.log('📊 Total de polígonos:', coveragePolygonsData.features.length);
    
    // Verificar cada polígono
    for (let i = 0; i < coveragePolygonsData.features.length; i++) {
        const feature = coveragePolygonsData.features[i];
        if (feature.geometry.type !== 'Polygon') {
            console.log(`⚠️ Feature ${i} não é um Polygon, tipo: ${feature.geometry.type}`);
            continue;
        }
        
        const coordinates = feature.geometry.coordinates[0];
        if (!coordinates || coordinates.length < 3) {
            console.log(`⚠️ Feature ${i} não tem coordenadas suficientes`);
            continue;
        }
        
        // 1. Verificar Bounding Box primeiro (otimização)
        const bbox = calculateBoundingBox(coordinates);
        if (!isPointInBoundingBox(pointLat, pointLng, bbox)) {
            console.log(`📦 Polígono ${i}: ponto fora do bounding box`);
            continue;
        }
        
        console.log(`🔍 Verificando polígono ${i} com ${coordinates.length} pontos`);
        
        // 2. Normalizar polígono (garantir que está fechado)
        const normalizedCoords = normalizePolygon(coordinates);
        
        // 3. Usar Winding Number Algorithm (mais robusto)
        const windingResult = checkPointInPolygonWinding(pointLat, pointLng, normalizedCoords);
        
        // 4. Opcionalmente verificar com Ray Casting para comparação
        const rayCastingResult = checkPointInPolygonRayCasting(pointLat, pointLng, normalizedCoords);
        
        // 5. Comparar resultados
        if (windingResult !== rayCastingResult) {
            console.warn(`⚠️ Divergência entre algoritmos no polígono ${i}: Winding=${windingResult}, RayCasting=${rayCastingResult}`);
            console.warn(`   Usando Winding Number como autoritativo`);
        }
        
        // Usar Winding Number como resultado final (mais confiável)
        if (windingResult) {
            console.log(`✅ Ponto está DENTRO do polígono ${i} (Winding Number)`);
            return { isCovered: true };
        }
    }
    
    console.log('❌ Ponto está FORA de todos os polígonos');
    return { isCovered: false };
}

// ========================================
// CALCULAR BOUNDING BOX DO POLÍGONO
// ========================================
function calculateBoundingBox(coordinates) {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    
    for (const coord of coordinates) {
        const lng = parseFloat(coord[0]);
        const lat = parseFloat(coord[1]);
        
        if (!isNaN(lat) && !isNaN(lng)) {
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
        }
    }
    
    return { minLat, maxLat, minLng, maxLng };
}

// ========================================
// VERIFICAR SE PONTO ESTÁ NO BOUNDING BOX
// ========================================
function isPointInBoundingBox(lat, lng, bbox) {
    return lat >= bbox.minLat && lat <= bbox.maxLat && 
           lng >= bbox.minLng && lng <= bbox.maxLng;
}

// ========================================
// NORMALIZAR POLÍGONO (GARANTIR QUE ESTÁ FECHADO)
// ========================================
function normalizePolygon(coordinates) {
    // Garantir que o polígono está fechado (primeiro ponto = último ponto)
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    
    if (first[0] === last[0] && first[1] === last[1]) {
        return coordinates;
    }
    
    return [...coordinates, first];
}

// ========================================
// WINDING NUMBER ALGORITHM (SOMA DE ÂNGULOS)
// ========================================
// Este algoritmo é mais robusto que Ray Casting e funciona independente da direção do polígono
// Calcula o número de voltas que o polígono dá ao redor do ponto
function checkPointInPolygonWinding(lat, lng, coordinates) {
    let windingNumber = 0;
    
    for (let i = 0; i < coordinates.length - 1; i++) {
        const p1 = coordinates[i];
        const p2 = coordinates[i + 1];
        
        const x1 = parseFloat(p1[0]) - parseFloat(lng);
        const y1 = parseFloat(p1[1]) - parseFloat(lat);
        const x2 = parseFloat(p2[0]) - parseFloat(lng);
        const y2 = parseFloat(p2[1]) - parseFloat(lat);
        
        // Validar coordenadas
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            continue;
        }
        
        // Calcular ângulo de cada vértice em relação ao ponto
        const angle1 = Math.atan2(y1, x1);
        const angle2 = Math.atan2(y2, x2);
        
        // Calcular diferença de ângulo
        let deltaAngle = angle2 - angle1;
        
        // Normalizar para [-π, π] mantendo a direção
        if (deltaAngle > Math.PI) {
            deltaAngle -= 2 * Math.PI;
        } else if (deltaAngle < -Math.PI) {
            deltaAngle += 2 * Math.PI;
        }
        
        windingNumber += deltaAngle;
    }
    
    // O winding number deve ser próximo de 2π (ou -2π) se o ponto está dentro
    // Converter para número de voltas: windingNumber / (2π)
    const turns = Math.abs(windingNumber) / (2 * Math.PI);
    
    // Se o número de voltas é próximo de 1 (ou múltiplo inteiro), o ponto está dentro
    // Tolerância para erros de precisão numérica
    const tolerance = 0.1; // permitir até 0.1 voltas de diferença
    const isInside = Math.abs(turns - Math.round(turns)) < tolerance && turns > 0.5;
    
    console.log(`  📐 Winding Number: soma=${windingNumber.toFixed(4)} rad (${(windingNumber * 180 / Math.PI).toFixed(2)}°), voltas=${turns.toFixed(3)}, dentro=${isInside}`);
    
    return isInside;
}

// ========================================
// RAY CASTING ALGORITHM (PARA COMPARAÇÃO)
// ========================================
function checkPointInPolygonRayCasting(lat, lng, coordinates) {
    let inside = false;
    const rayY = parseFloat(lat);
    const rayX = parseFloat(lng);
    
    for (let j = 0, k = coordinates.length - 2; j < coordinates.length - 1; k = j++) {
        const point1 = coordinates[k];
        const point2 = coordinates[j];
        
        const xi = parseFloat(point1[0]);
        const yi = parseFloat(point1[1]);
        const xj = parseFloat(point2[0]);
        const yj = parseFloat(point2[1]);
        
        if (isNaN(xi) || isNaN(yi) || isNaN(xj) || isNaN(yj)) {
            continue;
        }
        
        const yiAboveRay = yi > rayY;
        const yjAboveRay = yj > rayY;
        
        if (yiAboveRay !== yjAboveRay) {
            const dy = yj - yi;
            
            if (Math.abs(dy) > 0.0000001) {
                const intersectX = (rayY - yi) * (xj - xi) / dy + xi;
                const tolerance = 0.000001;
                
                if (rayX < intersectX - tolerance) {
                    inside = !inside;
                }
            }
        }
    }
    
    return inside;
}

// ========================================
// FUNÇÃO DE TESTE PARA COORDENADAS ESPECÍFICAS
// ========================================
// Esta função pode ser chamada do console do navegador para testar coordenadas
// Exemplo: testCoverageCheck(-5.085, -42.808)
function testCoverageCheck(lat, lng, label = 'Ponto de teste') {
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🧪 TESTE DE COBERTURA: ${label}`);
    console.log(`📍 Coordenadas: lat=${lat}, lng=${lng}`);
    console.log('═══════════════════════════════════════════════════════');
    
    if (!coveragePolygonsData || !coveragePolygonsData.features) {
        console.error('❌ GeoJSON não carregado!');
        return;
    }
    
    console.log(`📊 Total de polígonos: ${coveragePolygonsData.features.length}`);
    console.log('');
    
    // Testar cada polígono individualmente
    for (let i = 0; i < coveragePolygonsData.features.length; i++) {
        const feature = coveragePolygonsData.features[i];
        if (feature.geometry.type !== 'Polygon') {
            continue;
        }
        
        const coordinates = feature.geometry.coordinates[0];
        if (!coordinates || coordinates.length < 3) {
            continue;
        }
        
        console.log(`\n🔷 POLÍGONO ${i}:`);
        console.log(`   Pontos: ${coordinates.length}`);
        
        // Bounding box
        const bbox = calculateBoundingBox(coordinates);
        console.log(`   📦 Bounding Box: lat[${bbox.minLat.toFixed(6)}, ${bbox.maxLat.toFixed(6)}], lng[${bbox.minLng.toFixed(6)}, ${bbox.maxLng.toFixed(6)}]`);
        
        const inBbox = isPointInBoundingBox(lat, lng, bbox);
        console.log(`   ${inBbox ? '✅' : '❌'} Dentro do Bounding Box: ${inBbox}`);
        
        if (!inBbox) {
            console.log(`   ⏭️  Pulando verificação (fora do bounding box)`);
            continue;
        }
        
        // Normalizar
        const normalizedCoords = normalizePolygon(coordinates);
        console.log(`   🔄 Polígono normalizado: ${normalizedCoords.length} pontos`);
        
        // Winding Number
        console.log(`   📐 Testando com Winding Number Algorithm...`);
        const windingResult = checkPointInPolygonWinding(lat, lng, normalizedCoords);
        console.log(`   ${windingResult ? '✅' : '❌'} Winding Number: ${windingResult ? 'DENTRO' : 'FORA'}`);
        
        // Ray Casting
        console.log(`   🎯 Testando com Ray Casting Algorithm...`);
        const rayCastingResult = checkPointInPolygonRayCasting(lat, lng, normalizedCoords);
        console.log(`   ${rayCastingResult ? '✅' : '❌'} Ray Casting: ${rayCastingResult ? 'DENTRO' : 'FORA'}`);
        
        // Comparação
        if (windingResult !== rayCastingResult) {
            console.warn(`   ⚠️  DIVERGÊNCIA: Winding=${windingResult}, RayCasting=${rayCastingResult}`);
        }
        
        if (windingResult) {
            console.log(`\n✅ RESULTADO FINAL: Ponto está DENTRO do polígono ${i}`);
            console.log('═══════════════════════════════════════════════════════');
            return { isCovered: true, polygonIndex: i };
        }
    }
    
    console.log(`\n❌ RESULTADO FINAL: Ponto está FORA de todos os polígonos`);
    console.log('═══════════════════════════════════════════════════════');
    return { isCovered: false };
}

// Expor função globalmente para testes no console
if (typeof window !== 'undefined') {
    window.testCoverageCheck = testCoverageCheck;
    
    // Teste automático para "Avenida Ininga, nº 1201" (coordenadas aproximadas)
    // Descomente para testar automaticamente ao carregar a página
    // setTimeout(() => {
    //     console.log('🧪 Executando teste automático para Avenida Ininga, nº 1201...');
    //     testCoverageCheck(-5.085, -42.808, 'Avenida Ininga, nº 1201');
    // }, 2000);
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
// GERAR SVG DO ÍCONE DE LOCALIZAÇÃO
// ========================================
function getLocationIconSVG() {
    return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        </svg>
    `;
}

// ========================================
// GEOLOCALIZAÇÃO - OBTER LOCALIZAÇÃO ATUAL
// ========================================
function setupGeolocationButton() {
    // Verificar se o navegador suporta geolocalização
    if (!navigator.geolocation) {
        console.warn('⚠️ Geolocalização não suportada pelo navegador');
        // Mostrar mensagem informativa
        const searchBox = document.querySelector('.search-box-integrated');
        if (searchBox) {
            showSearchMessage('⚠️ Seu navegador não suporta geolocalização. Use a busca manual de endereço acima.', 'warning');
        }
        return;
    }
    
    console.log('✅ Geolocalização disponível');
    
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        // Criar botão de geolocalização dentro do search-box-integrated
        const searchBox = document.querySelector('.search-box-integrated');
        if (!searchBox) {
            console.warn('⚠️ .search-box-integrated não encontrado');
            return;
        }
        
        // Verificar se o botão já existe
        const existingButton = document.querySelector('.geo-location-btn-google');
        if (existingButton) {
            console.log('✅ Botão de geolocalização já existe');
            return;
        }
        
        // Criar container para o botão - posicionar dentro do search-box
        const geoButtonContainer = document.createElement('div');
        geoButtonContainer.className = 'geo-button-container-google';
        
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'geo-location-btn-google';
        button.setAttribute('title', 'Usar minha localização atual');
        button.setAttribute('aria-label', 'Usar localização atual');
        button.innerHTML = getLocationIconSVG();
        
        // Adicionar indicador de loading
        const loadingIndicator = document.createElement('span');
        loadingIndicator.className = 'geo-loading-indicator-google';
        loadingIndicator.innerHTML = '⏳';
        loadingIndicator.style.cssText = 'display: none; margin-left: 4px;';
        button.appendChild(loadingIndicator);
        
        // Event listener com prevenção de propagação
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📍 Botão de geolocalização clicado');
            
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
        
        // Inserir o botão antes do botão de pesquisar
        const searchBtn = document.getElementById('integratedSearchBtn');
        if (searchBtn && searchBtn.parentNode) {
            searchBtn.parentNode.insertBefore(geoButtonContainer, searchBtn);
            console.log('✅ Botão de geolocalização inserido antes do botão de pesquisar');
        } else {
            searchBox.appendChild(geoButtonContainer);
            console.log('✅ Botão de geolocalização adicionado ao search-box');
        }
    }, 100);
}

function getCurrentLocationGoogle(onComplete) {
    console.log('🌍 Solicitando localização atual...');
    
    // Verificar se já temos permissão armazenada
    const hasPermission = sessionStorage.getItem('geolocation_permission_granted_google');
    
    const options = {
        enableHighAccuracy: true,
        timeout: 15000, // Aumentado para 15 segundos
        maximumAge: 60000
    };
    
    const complete = function() {
        if (typeof onComplete === 'function') {
            onComplete();
        }
    };
    
    // Função para fazer a requisição
    const requestLocation = function() {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                console.log('✅ Localização obtida com sucesso:', position.coords);
                sessionStorage.setItem('geolocation_permission_granted_google', 'true');
                handleLocationSuccessGoogle(position);
                complete();
            },
            function(error) {
                console.error('❌ Erro na requisição de geolocalização:', error);
                if (error.code === error.PERMISSION_DENIED) {
                    sessionStorage.setItem('geolocation_permission_granted_google', 'false');
                }
                handleLocationErrorGoogle(error);
                complete();
            },
            options
        );
    };
    
    // Se já tiver permissão, buscar automaticamente
    if (hasPermission === 'true') {
        console.log('✅ Permissão já concedida, buscando localização...');
        requestLocation();
        return;
    }
    
    // Se não tiver permissão ainda, pedir uma vez
    console.log('🔐 Solicitando permissão de localização...');
    requestLocation();
}

function handleLocationSuccessGoogle(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    console.log('✅ Localização obtida:', lat, lng);
    
    // Verificar se está em Teresina, PI ou São Luís, MA (aproximado)
    const isTeresina = (lat >= -5.5 && lat <= -4.8 && lng >= -43.3 && lng <= -42.2);
    const isSaoLuis = (lat >= -2.7 && lat <= -2.4 && lng >= -44.4 && lng <= -44.1);
    
    if (isTeresina || isSaoLuis) {
        // Salvar dados
        searchMarkerData = {
            lat: lat,
            lng: lng,
            address: 'Sua localização atual',
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
                
                // Mensagem de sucesso
                showSearchMessage(`✓ Localização encontrada: ${address.split(',')[0]}`, 'success');
            })
            .catch(error => {
                console.error('Erro ao buscar endereço:', error);
                // Mostrar mesmo sem endereço
                updateGoogleMapFrame(lat, lng);
                showSearchMessage('✓ Localização encontrada', 'success');
            });
    } else {
        showSearchMessage('⚠️ Você não está em Teresina, PI ou São Luís, MA. Esta ferramenta funciona apenas nessas cidades.', 'warning');
    }
}

function handleLocationErrorGoogle(error) {
    console.error('❌ Erro ao obter localização:', error);
    console.error('❌ Código do erro:', error.code);
    console.error('❌ Mensagem do erro:', error.message);
    
    let message = 'Não foi possível obter sua localização. ';
    let detailedMessage = '';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message += 'Permissão negada.';
            detailedMessage = 'Por favor, permita acesso à localização nas configurações do navegador.';
            sessionStorage.setItem('geolocation_permission_granted_google', 'false');
            console.warn('💡 Dica: Vá em Configurações do Site → Localização → Permitir');
            console.warn('💡 Chrome: ícone de cadeado na barra de endereços → Localização → Permitir');
            console.warn('💡 Firefox: ícone de cadeado → Permissões → Localização → Permitir');
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Não foi possível obter sua localização.';
            detailedMessage = '';
            console.warn('💡 Localização indisponível (código 2)');
            console.warn('💡 Possíveis causas:');
            console.warn('   - GPS desativado no dispositivo');
            console.warn('   - Dispositivo sem GPS (alguns computadores desktop)');
            console.warn('   - Navegador não tem acesso ao GPS');
            break;
        case error.TIMEOUT:
            message += 'Tempo esgotado.';
            detailedMessage = 'A busca de localização demorou muito. Verifique sua conexão e tente novamente.';
            break;
        default:
            message += `Erro desconhecido.`;
            detailedMessage = error.message || 'Tente usar a busca manual de endereço acima.';
    }
    
    // Limpar estado de loading do botão
    const button = document.querySelector('.geo-location-btn-google');
    if (button) {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        const loadingIndicator = button.querySelector('.geo-loading-indicator-google');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
    
    // Mostrar mensagem completa apenas se houver mensagem
    if (message || detailedMessage) {
        const fullMessage = detailedMessage ? `${message} ${detailedMessage}` : message;
        showSearchMessage(fullMessage, 'error');
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
