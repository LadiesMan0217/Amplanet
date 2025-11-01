// ========================================
// COBERTURA PAGE - LEAFLET MAP WITH GEOJSON
// ========================================
let map;
let geoJsonLayer;
let searchMarker;
let geocoder;

// Função para esconder loading (definida antes de usar)
function hideMapLoading(errorMessage) {
    const mapLoading = document.getElementById('mapLoading');
    if (mapLoading) {
        if (errorMessage) {
            mapLoading.innerHTML = `<p style="color: #ef4444; padding: 2rem;">${errorMessage}</p>`;
        }
        mapLoading.style.opacity = '0';
        mapLoading.style.transition = 'opacity 0.3s ease';
        setTimeout(function() {
            mapLoading.style.display = 'none';
        }, 300);
    }
}

// Inicialização simples e direta
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded disparado');
    
    // Aguardar Leaflet carregar
    function tryInit() {
        if (typeof L === 'undefined') {
            console.log('Aguardando Leaflet...');
            setTimeout(tryInit, 100);
            return;
        }
        
        console.log('Leaflet encontrado, inicializando mapa...');
        
        try {
            initializeMap();
            setupScrollReveal();
        } catch (error) {
            console.error('Erro ao inicializar:', error);
            hideMapLoading('Erro: ' + error.message);
        }
    }
    
    // Aguardar um pouco antes de tentar
    setTimeout(tryInit, 200);
});

// Backup: tentar após window.load
window.addEventListener('load', function() {
    console.log('Window.load disparado');
    if (!map && typeof L !== 'undefined') {
        console.log('Tentando inicializar mapa no window.load...');
        try {
            if (!document.getElementById('coberturaMap')) {
                console.error('Elemento do mapa não encontrado');
                return;
            }
            initializeMap();
        } catch (error) {
            console.error('Erro no window.load:', error);
        }
    }
});

// ========================================
// INICIALIZAR MAPA LEAFLET
// ========================================
function initializeMap() {
    // Evitar inicialização duplicada
    if (map) {
        console.warn('Mapa já foi inicializado, ignorando...');
        return;
    }
    
    const mapElement = document.getElementById('coberturaMap');
    const mapLoading = document.getElementById('mapLoading');
    
    if (!mapElement) {
        console.error('❌ Elemento do mapa não encontrado!');
        if (mapLoading) {
            hideMapLoading('Erro: Elemento do mapa não encontrado no DOM');
        }
        return;
    }
    
    console.log('✅ Elemento do mapa encontrado:', mapElement);
    
    // Verificar se o elemento tem dimensões
    const rect = mapElement.getBoundingClientRect();
    console.log('Dimensões do elemento:', rect.width, 'x', rect.height);
    
    if (rect.width === 0 || rect.height === 0) {
        console.warn('⚠️ Elemento do mapa não tem dimensões visíveis, mas continuando...');
    }
    
    console.log('Inicializando mapa Leaflet...');
    
    // Coordenadas centrais de Teresina
    const centerLat = -5.08693;
    const centerLng = -42.7944;
    
    try {
        // Criar o mapa
        map = L.map('coberturaMap', {
            center: [centerLat, centerLng],
            zoom: 13,
            zoomControl: true,
            attributionControl: true
        });
        
        console.log('✅ Mapa Leaflet criado:', map);
    } catch (error) {
        console.error('❌ Erro ao criar mapa:', error);
        hideMapLoading('Erro ao criar mapa: ' + error.message);
        return;
    }
    
    // Adicionar tile layer (OpenStreetMap)
    try {
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        console.log('✅ Tile layer adicionado');
        
        // Remover loading quando o mapa estiver pronto
        map.whenReady(function() {
            console.log('✅ Mapa pronto (whenReady)!');
            setTimeout(function() {
                hideMapLoading();
                console.log('✅ Loading removido');
            }, 500);
        });
        
        // Timeout de segurança - SEMPRE remove o loading após 2 segundos
        setTimeout(function() {
            const mapLoading = document.getElementById('mapLoading');
            if (mapLoading && mapLoading.style.display !== 'none') {
                console.log('Removendo loading (timeout de segurança após 2s)');
                hideMapLoading();
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erro ao adicionar tile layer:', error);
        hideMapLoading('Erro ao carregar mapa: ' + error.message);
        return;
    }
    
    // Adicionar controle de geocodificação (busca)
    try {
        setupGeocoder();
    } catch (error) {
        console.error('Erro ao configurar geocoder:', error);
    }
    
    // Carregar GeoJSON
    loadGeoJSON();
    
    // Adicionar botão de geolocalização
    setupGeolocationButton();
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
    
    // Criar botão de geolocalização
    const geoButton = L.control({ position: 'topright' });
    
    geoButton.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'leaflet-control-geolocation');
        const button = L.DomUtil.create('button', 'geo-location-btn');
        button.setAttribute('title', 'Usar minha localização atual');
        button.setAttribute('aria-label', 'Usar localização atual');
        button.innerHTML = '<span style="font-size: 1.25rem;">📍</span>';
        
        // Adicionar indicador de loading
        const loadingIndicator = L.DomUtil.create('span', 'geo-loading-indicator');
        loadingIndicator.innerHTML = '⏳';
        loadingIndicator.style.display = 'none';
        loadingIndicator.style.marginLeft = '4px';
        button.appendChild(loadingIndicator);
        
        L.DomEvent.disableClickPropagation(div);
        
        button.addEventListener('click', function() {
            // Mostrar loading
            loadingIndicator.style.display = 'inline';
            button.disabled = true;
            button.style.opacity = '0.6';
            button.style.cursor = 'wait';
            
            getCurrentLocation(function() {
                // Esconder loading quando terminar
                loadingIndicator.style.display = 'none';
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            });
        });
        
        div.appendChild(button);
        return div;
    };
    
    geoButton.addTo(map);
}

function getCurrentLocation(onComplete) {
    console.log('🌍 Solicitando localização atual...');
    
    // Verificar se já temos permissão armazenada
    const hasPermission = sessionStorage.getItem('geolocation_permission_granted');
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Aceitar posição com até 1 minuto de idade (evita pedir muito)
    };
    
    const complete = function() {
        if (typeof onComplete === 'function') {
            onComplete();
        }
    };
    
    // Se já tiver permissão, buscar automaticamente sem pedir novamente
    if (hasPermission === 'true') {
        console.log('✅ Permissão já concedida, buscando localização...');
        navigator.geolocation.getCurrentPosition(
            function(position) {
                handleLocationSuccess(position);
                complete();
            },
            function(error) {
                handleLocationError(error);
                complete();
            },
            options
        );
        return;
    }
    
    // Se não tiver permissão ainda, pedir uma vez
    navigator.geolocation.getCurrentPosition(
        function(position) {
            // Marcar que temos permissão
            sessionStorage.setItem('geolocation_permission_granted', 'true');
            handleLocationSuccess(position);
            complete();
        },
        function(error) {
            // Se negar, marcar como negado para não ficar pedindo
            if (error.code === error.PERMISSION_DENIED) {
                sessionStorage.setItem('geolocation_permission_granted', 'false');
            }
            handleLocationError(error);
            complete();
        },
        options
    );
}

function handleLocationSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    console.log('✅ Localização obtida:', lat, lng);
    
    // Verificar se está em Teresina (aproximadamente)
    if (lat >= -5.3 && lat <= -4.9 && lng >= -43.2 && lng <= -42.5) {
                // Adicionar marcador
                if (searchMarker) {
                    map.removeLayer(searchMarker);
                }
                
                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">📍</div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40]
                });
                
                searchMarker = L.marker([lat, lng], {
                    icon: customIcon,
                    zIndexOffset: 1000
                }).addTo(map);
                
                // Verificar cobertura
                const coverageResult = checkCoverage([lat, lng]);
                
                // Buscar endereço reverso
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
                    .then(response => response.json())
                    .then(data => {
                        // Formatar endereço de forma mais limpa
                        let address = 'Sua localização atual';
                        
                        if (data.address) {
                            const addr = data.address;
                            const parts = [];
                            
                            // Adicionar apenas partes relevantes
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
                            
                            // Montar endereço formatado
                            if (parts.length > 0) {
                                address = parts.join(', ');
                                address += ', Teresina - PI';
                            } else {
                                // Fallback: usar display_name mas simplificar
                                address = (data.display_name || 'Sua localização atual')
                                    .split(',')
                                    .slice(0, 3) // Pegar apenas as 3 primeiras partes
                                    .join(',');
                            }
                        } else if (data.display_name) {
                            // Se não tiver address detalhado, simplificar display_name
                            const parts = data.display_name.split(',');
                            // Pegar apenas: rua, bairro, cidade
                            address = parts.slice(0, 3).join(',');
                        }
                        
                        const popupContent = `
                            <div style="min-width: 260px; padding: 0;">
                                <div style="padding: 1rem; background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 0.75rem 0.75rem 0 0;">
                                    <strong style="color: #1e40af; font-size: 1rem; display: block; margin-bottom: 0.5rem; line-height: 1.4;">📍 Sua Localização</strong>
                                    <div style="color: #64748b; font-size: 0.875rem; line-height: 1.4;">${address}</div>
                                </div>
                                <div style="padding: 1rem; ${coverageResult.isCovered ? 'background: #ecfdf5;' : 'background: #fef2f2;'} border-radius: 0 0 0.75rem 0.75rem;">
                                    ${coverageResult.isCovered 
                                        ? `<div style="display: flex; align-items: start; gap: 0.75rem;">
                                            <div style="font-size: 2rem; line-height: 1;">✓</div>
                                            <div>
                                                <div style="color: #059669; font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem;">Área Coberta</div>
                                                <div style="color: #047857; font-size: 0.875rem; line-height: 1.5;">Você pode contratar nossos planos de internet fibra óptica!</div>
                                            </div>
                                        </div>` 
                                        : `<div style="display: flex; align-items: start; gap: 0.75rem;">
                                            <div style="font-size: 2rem; line-height: 1;">⚠</div>
                                            <div>
                                                <div style="color: #dc2626; font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem;">Fora da Cobertura</div>
                                                <div style="color: #991b1b; font-size: 0.875rem; line-height: 1.5;">Entre em contato para verificar disponibilidade.</div>
                                            </div>
                                        </div>`}
                                </div>
                            </div>
                        `;
                        
                        searchMarker.bindPopup(popupContent, {
                            maxWidth: 320,
                            className: 'custom-popup',
                            closeButton: true
                        }).openPopup();
                        
                        // Centralizar mapa
                        map.setView([lat, lng], 16, {
                            animate: true,
                            duration: 1.2
                        });
                    })
                    .catch(error => {
                        console.error('Erro ao buscar endereço:', error);
                    });
    } else {
        alert('Você não está em Teresina, PI. Esta ferramenta verifica cobertura apenas em Teresina.');
    }
}

function handleLocationError(error) {
    console.error('❌ Erro ao obter localização:', error);
    let message = 'Não foi possível obter sua localização. ';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message += 'Permissão negada. Por favor, permita acesso à localização no navegador.';
            // Marcar como negado para não ficar pedindo
            sessionStorage.setItem('geolocation_permission_granted', 'false');
            break;
        case error.POSITION_UNAVAILABLE:
            message += 'Localização indisponível.';
            break;
        case error.TIMEOUT:
            message += 'Tempo esgotado ao buscar localização.';
            break;
    }
    alert(message);
}

// ========================================
// FUNÇÃO PARA ESCONDER LOADING
// ========================================
function hideMapLoading(errorMessage) {
    const mapLoading = document.getElementById('mapLoading');
    if (mapLoading) {
        if (errorMessage) {
            mapLoading.innerHTML = `<p style="color: #ef4444;">${errorMessage}</p>`;
        }
        mapLoading.style.opacity = '0';
        mapLoading.style.transition = 'opacity 0.3s ease';
        setTimeout(function() {
            mapLoading.style.display = 'none';
        }, 300);
    }
}

// ========================================
// GEOCODER MELHORADO PARA TERESINA
// ========================================
function createImprovedNominatim() {
    console.log('Criando geocoder Nominatim otimizado para Teresina...');
    
    // Usar Nominatim padrão com parâmetros otimizados
    // Não interceptar o método geocode para evitar problemas de compatibilidade
    const nominatimInstance = L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
            countrycodes: 'br',
            'accept-language': 'pt-BR,pt',
            limit: 10,
            addressdetails: 1
        }
    });
    
    console.log('✅ Instância Nominatim criada');
    
    return nominatimInstance;
}

// ========================================
// CONFIGURAR GEOCODER (BUSCA)
// ========================================
function setupGeocoder() {
    console.log('=== Configurando Geocoder ===');
    
    // Verificar se o plugin está disponível
    if (!L.Control.Geocoder) {
        console.error('❌ Leaflet Control Geocoder não está carregado!');
        return;
    }
    
    console.log('✅ Leaflet Control Geocoder disponível');
    
    // Verificar se o mapa existe
    if (!map) {
        console.error('❌ Mapa não existe. Não é possível configurar geocoder.');
        return;
    }
    
    // Criar geocoder melhorado
    let improvedGeocoder;
    try {
        improvedGeocoder = createImprovedNominatim();
        console.log('✅ Geocoder melhorado criado');
    } catch (error) {
        console.error('❌ Erro ao criar geocoder melhorado:', error);
        // Usar geocoder padrão como fallback
        improvedGeocoder = L.Control.Geocoder.nominatim({
            geocodingQueryParams: {
                countrycodes: 'br',
                'accept-language': 'pt-BR,pt',
                limit: 10,
                addressdetails: 1
            }
        });
        console.log('⚠️ Usando geocoder padrão como fallback');
    }
    
    // Configurar geocoder - usar configuração padrão estável
    try {
        geocoder = L.Control.geocoder({
            position: 'topright',
            placeholder: 'Buscar endereço, bairro, rua de Teresina...',
            errorMessage: 'Local não encontrado. Tente: "Av. Ininga, Teresina" ou "Jóquei Clube, Teresina"',
            geocoder: improvedGeocoder,
            defaultMarkGeocode: false,
            collapsed: false,
            expand: 'click',
            suggestTimeout: 1000,
            queryMinLength: 3,
            showResultIcons: true,
            markers: {
                draggable: false
            }
        })
        .on('markgeocode', function(e) {
        console.log('📍 Resultado selecionado:', e.geocode);
        const result = e.geocode;
        const lat = parseFloat(result.center.lat);
        const lon = parseFloat(result.center.lng);
        
        // Validar coordenadas
        if (isNaN(lat) || isNaN(lon)) {
            console.error('Coordenadas inválidas:', result);
            return;
        }
        
        // Remover marcador anterior
        if (searchMarker) {
            map.removeLayer(searchMarker);
            searchMarker = null;
        }
        
        // Criar ícone customizado profissional
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">📍</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
        
        // Adicionar marcador
        searchMarker = L.marker([lat, lon], {
            icon: customIcon,
            zIndexOffset: 1000
        }).addTo(map);
        
        // Verificar cobertura
        const coverageResult = checkCoverage([lat, lon]);
        
        // Formatar endereço melhor (simplificado)
        let address = 'Localização encontrada';
        
        if (result.properties && result.properties.address) {
            const addr = result.properties.address;
            const parts = [];
            
            // Montar endereço apenas com partes essenciais
            if (addr.road || addr.pedestrian) {
                parts.push(addr.road || addr.pedestrian);
            }
            if (addr.house_number) {
                parts.push(addr.house_number);
            }
            if (addr.neighbourhood || addr.suburb || addr.quarter) {
                parts.push(addr.neighbourhood || addr.suburb || addr.quarter);
            }
            
            if (parts.length > 0) {
                address = parts.join(', ');
            } else {
                // Fallback para name ou html
                address = result.name || result.html || 'Localização encontrada';
                // Remover tags HTML se houver
                address = address.replace(/<[^>]*>/g, '');
                // Simplificar: pegar apenas primeiras partes
                const addressParts = address.split(',');
                address = addressParts.slice(0, 3).join(',').trim();
            }
        } else if (result.name || result.html) {
            address = result.name || result.html;
            // Remover tags HTML se houver
            address = address.replace(/<[^>]*>/g, '');
            // Simplificar: pegar apenas primeiras partes
            const addressParts = address.split(',');
            address = addressParts.slice(0, 3).join(',').trim();
        }
        
        // Criar conteúdo do popup profissional
        let popupContent = `
            <div style="min-width: 260px; padding: 0;">
                <div style="padding: 1rem; background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 0.75rem 0.75rem 0 0;">
                    <strong style="color: #1e40af; font-size: 1rem; display: block; margin-bottom: 0.5rem; line-height: 1.4;">${address}</strong>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.85rem;">
                        <span>📍</span>
                        <span>Teresina, PI</span>
                    </div>
                </div>
                <div style="padding: 1rem; ${coverageResult.isCovered ? 'background: #ecfdf5;' : 'background: #fef2f2;'} border-radius: 0 0 0.75rem 0.75rem;">
                    ${coverageResult.isCovered 
                        ? `<div style="display: flex; align-items: start; gap: 0.75rem;">
                            <div style="font-size: 2rem; line-height: 1;">✓</div>
                            <div>
                                <div style="color: #059669; font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem;">Área Coberta</div>
                                <div style="color: #047857; font-size: 0.875rem; line-height: 1.5;">Você pode contratar nossos planos de internet fibra óptica!</div>
                            </div>
                        </div>` 
                        : `<div style="display: flex; align-items: start; gap: 0.75rem;">
                            <div style="font-size: 2rem; line-height: 1;">⚠</div>
                            <div>
                                <div style="color: #dc2626; font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem;">Fora da Cobertura</div>
                                <div style="color: #991b1b; font-size: 0.875rem; line-height: 1.5;">Entre em contato para verificar disponibilidade ou expansão futura.</div>
                            </div>
                        </div>`}
                </div>
            </div>
        `;
        
        searchMarker.bindPopup(popupContent, {
            maxWidth: 320,
            className: 'custom-popup',
            closeButton: true
        }).openPopup();
        
        // Centralizar mapa na localização com animação suave
        map.setView([lat, lon], 16, {
            animate: true,
            duration: 1.2,
            easeLinearity: 0.25
        });
        
            // Adicionar efeito de bounce no marcador
        setTimeout(() => {
            if (searchMarker) {
                const markerElement = searchMarker.getElement();
                if (markerElement) {
                    markerElement.style.animation = 'bounce 0.6s ease';
                    setTimeout(() => {
                        markerElement.style.animation = '';
                    }, 600);
                }
            }
        }, 500);
    })
    .addTo(map);
    
    console.log('✅ Geocoder adicionado ao mapa');
    
    // Verificar se foi adicionado corretamente
    setTimeout(function() {
        const geocoderElement = document.querySelector('.leaflet-control-geocoder');
        if (geocoderElement) {
            console.log('✅ Elemento do geocoder encontrado no DOM');
            const input = geocoderElement.querySelector('input');
            if (input) {
                console.log('✅ Campo de busca encontrado');
            } else {
                console.warn('⚠️ Campo de busca não encontrado no geocoder');
            }
        } else {
            console.warn('⚠️ Elemento do geocoder não encontrado no DOM');
        }
    }, 500);
    
    // Adicionar busca manual adicional como fallback
    setupManualSearch();
    
    } catch (error) {
        console.error('❌ Erro ao configurar geocoder:', error);
        // Tentar usar geocoder padrão como último recurso
        try {
            geocoder = L.Control.geocoder({
                position: 'topright',
                placeholder: 'Buscar endereço...',
                geocoder: L.Control.Geocoder.nominatim()
            }).addTo(map);
            console.log('⚠️ Usando geocoder básico devido a erro');
        } catch (e) {
            console.error('❌ Não foi possível criar geocoder:', e);
        }
    }
}

// ========================================
// BUSCA MANUAL ADICIONAL (FALLBACK)
// ========================================
function setupManualSearch() {
    // Aguardar geocoder renderizar completamente
    setTimeout(function() {
        const geocoderForm = document.querySelector('.leaflet-control-geocoder-form');
        if (geocoderForm) {
            const input = geocoderForm.querySelector('input[type="search"]');
            if (input) {
                console.log('✅ Campo de input encontrado para melhorias');
                
                // Adicionar dica visual
                input.setAttribute('title', 'Digite o endereço com "Teresina" para melhores resultados. Ex: "Av. Ininga, Teresina"');
            }
        }
    }, 1500);
}

// ========================================
// BUSCA DIRETA VIA API (PARA MELHORAR RESULTADOS)
// ========================================
function searchDirectly(query) {
    return new Promise((resolve, reject) => {
        // Buscar diretamente no Nominatim com parâmetros otimizados
        const searchQuery = encodeURIComponent(query + ', Teresina, PI, Brasil');
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=10&countrycodes=br&addressdetails=1&accept-language=pt-BR&viewbox=-43.2,-5.3,-42.5,-4.9&bounded=0`;
        
        fetch(url, {
            headers: {
                'User-Agent': 'Amplanet-Cobertura-Map/1.0'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                // Converter formato Nominatim para formato do geocoder
                const results = data.map(function(item) {
                    return {
                        name: item.display_name || '',
                        bbox: item.boundingbox ? [
                            [parseFloat(item.boundingbox[0]), parseFloat(item.boundingbox[2])],
                            [parseFloat(item.boundingbox[1]), parseFloat(item.boundingbox[3])]
                        ] : null,
                        center: {
                            lat: parseFloat(item.lat),
                            lng: parseFloat(item.lon)
                        },
                        properties: {
                            address: item.address || {}
                        },
                        html: item.display_name || ''
                    };
                });
                resolve(results);
            } else {
                resolve([]);
            }
        })
        .catch(error => {
            console.error('Erro na busca direta:', error);
            reject(error);
        });
    });
}

// ========================================
// CARREGAR GEOJSON
// ========================================
function loadGeoJSON() {
    // Verificar se o mapa foi inicializado
    if (!map) {
        console.error('❌ Mapa não inicializado. Não é possível carregar GeoJSON.');
        // Tentar novamente após um tempo
        setTimeout(loadGeoJSON, 500);
        return;
    }
    
    console.log('🔄 Iniciando carregamento do GeoJSON...');
    
    // Função para carregar GeoJSON (tenta fetch primeiro, fallback para embutido)
    function loadGeoJSONData() {
        // Tentar carregar via fetch primeiro
        const isFileProtocol = window.location.protocol === 'file:';
        
        if (isFileProtocol || typeof COBERTURA_GEOJSON !== 'undefined') {
            // Se for file:// ou se já temos o GeoJSON embutido, usar ele
            if (typeof COBERTURA_GEOJSON !== 'undefined') {
                console.log('📦 Usando GeoJSON embutido (evita CORS)');
                processGeoJSONData(COBERTURA_GEOJSON);
                return;
            }
        }
        
        // Tentar fetch (funciona se estiver em servidor HTTP)
        fetch('assets/Map/map.geojson')
            .then(response => {
                console.log('📥 Resposta do fetch:', response.status);
                if (!response.ok) {
                    throw new Error('Erro ao carregar GeoJSON: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                processGeoJSONData(data);
            })
            .catch(error => {
                console.warn('⚠️ Erro no fetch, tentando GeoJSON embutido:', error);
                // Fallback para GeoJSON embutido
                if (typeof COBERTURA_GEOJSON !== 'undefined') {
                    console.log('📦 Usando GeoJSON embutido como fallback');
                    processGeoJSONData(COBERTURA_GEOJSON);
                } else {
                    throw error;
                }
            });
    }
    
    function processGeoJSONData(data) {
        console.log('✅ GeoJSON processado! Features:', data.features ? data.features.length : 0);
        
        // Validar dados
        if (!data || !data.features || data.features.length === 0) {
            console.warn('⚠️ GeoJSON vazio ou sem features');
            return;
        }
        
        // Remover layer anterior se existir (evitar duplicatas)
        if (geoJsonLayer) {
            map.removeLayer(geoJsonLayer);
            geoJsonLayer = null;
        }
        
        // Adicionar GeoJSON ao mapa
        try {
            geoJsonLayer = L.geoJSON(data, {
                    style: function(feature) {
                        return {
                            color: '#2563eb',
                            weight: 2,
                            opacity: 0.8,
                            fillColor: '#2563eb',
                            fillOpacity: 0.35
                        };
                    },
                    onEachFeature: function(feature, layer) {
                        // Adicionar interatividade
                        layer.on({
                            mouseover: function(e) {
                                const target = e.target;
                                target.setStyle({
                                    weight: 3,
                                    fillOpacity: 0.5,
                                    color: '#1e40af'
                                });
                            },
                            mouseout: function(e) {
                                const target = e.target;
                                if (geoJsonLayer) {
                                    geoJsonLayer.resetStyle(target);
                                }
                            }
                        });
                    }
                }).addTo(map);
                
                console.log('✅ GeoJSON adicionado ao mapa com', geoJsonLayer.getLayers().length, 'polígonos');
                
                // Verificar se os polígonos foram adicionados
                const polygonCount = geoJsonLayer.getLayers().filter(function(layer) {
                    return layer instanceof L.Polygon;
                }).length;
                
                console.log('✅ Polígonos no mapa:', polygonCount);
                
                // Verificar visualmente se os polígonos apareceram
                setTimeout(function() {
                    const allLayers = map._layers;
                    let polygonLayers = 0;
                    for (let id in allLayers) {
                        if (allLayers[id] instanceof L.Polygon) {
                            polygonLayers++;
                        }
                    }
                    console.log('🔍 Polígonos no mapa (verificação completa):', polygonLayers);
                    
                    if (polygonLayers === 0) {
                        console.error('❌ Nenhum polígono encontrado no mapa! Verificando GeoJSON...');
                        console.log('GeoJSON data:', data);
                    }
                    
                    // Ajustar zoom apenas se houver polígonos
                    if (geoJsonLayer && geoJsonLayer.getBounds && geoJsonLayer.getBounds().isValid() && polygonLayers > 0) {
                        const bounds = geoJsonLayer.getBounds();
                        console.log('📍 Ajustando zoom para bounds:', bounds);
                        // Não forçar zoom se já está adequado
                        const currentZoom = map.getZoom();
                        if (currentZoom < 10 || currentZoom > 16) {
                            map.fitBounds(bounds, {
                                padding: [50, 50],
                                maxZoom: 14
                            });
                            console.log('✅ Zoom ajustado para mostrar áreas de cobertura');
                        } else {
                            console.log('✅ Zoom já está adequado:', currentZoom);
                        }
                    }
                }, 1500);
            } catch (error) {
            console.error('❌ Erro ao adicionar GeoJSON ao mapa:', error);
            console.error('Stack:', error.stack);
            throw error;
        }
    }
    
    // Carregar GeoJSON
    loadGeoJSONData();
}

// ========================================
// VERIFICAR COBERTURA
// ========================================
function checkCoverage(coords) {
    if (!geoJsonLayer) {
        return { isCovered: false };
    }
    
    const point = L.latLng(coords[0], coords[1]);
    
    // Verificar se o ponto está dentro de algum polígono
    let isCovered = false;
    geoJsonLayer.eachLayer(function(layer) {
        if (layer instanceof L.Polygon) {
            const latlngs = layer.getLatLngs();
            if (latlngs && latlngs.length > 0 && isPointInPolygon(point, latlngs[0])) {
                isCovered = true;
            }
        }
    });
    
    return { isCovered: isCovered };
}

// ========================================
// ALGORITMO RAY CASTING (PONTO EM POLÍGONO)
// ========================================
function isPointInPolygon(point, polygon) {
    let inside = false;
    const x = point.lng;
    const y = point.lat;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng;
        const yi = polygon[i].lat;
        const xj = polygon[j].lng;
        const yj = polygon[j].lat;
        
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
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

    setTimeout(() => {
        document.body.classList.add('page-loaded');
    }, 100);
}
