# Amplanet - Site Institucional

Site institucional da Amplanet com mapa de cobertura interativo para Teresina (PI).

## 📋 Sobre o Projeto

Este é um site estático responsivo desenvolvido para a Amplanet, incluindo:

- Página inicial com apresentação da empresa
- Planos de internet fibra óptica
- Serviços e aplicativos disponíveis
- **Mapa de cobertura interativo** com GeoJSON
- Integração com Google Maps (versão alternativa)

## 🚀 Funcionalidades

### Mapa de Cobertura
- **Versão Leaflet**: Mapa interativo com GeoJSON, busca de endereços e geolocalização
- **Versão Google Maps**: Mapa integrado com busca customizada
- Verificação de cobertura em tempo real
- Busca de endereços com filtros para Teresina, PI
- Botão de geolocalização para usar sua localização atual

### Tecnologias Utilizadas

- HTML5
- CSS3 (Mobile-first, responsivo)
- JavaScript (Vanilla JS)
- [Leaflet.js](https://leafletjs.com/) - Biblioteca de mapas open-source
- [Leaflet Control Geocoder](https://github.com/perliedman/leaflet-control-geocoder) - Plugin de busca
- Google Maps (versão alternativa)
- GeoJSON para áreas de cobertura

## 📁 Estrutura do Projeto

```
Amplanet/
├── assets/
│   ├── css/
│   │   └── style.css          # Estilos principais
│   ├── js/
│   │   ├── main.js            # Scripts globais
│   │   ├── cobertura.js       # Mapa Leaflet
│   │   ├── cobertura-google.js # Mapa Google
│   │   └── cobertura-geojson.js # GeoJSON embutido
│   ├── Map/
│   │   └── map.geojson        # Dados das áreas de cobertura
│   └── images/                # Imagens e ícones
├── Docs/
│   └── PRD.md                 # Documento de requisitos
├── index.html                 # Página inicial
├── planos.html                # Planos de internet
├── servicos.html              # Serviços e apps
├── cobertura.html             # Mapa Leaflet
├── cobertura-google.html      # Mapa Google
├── README.md                  # Este arquivo
└── .gitignore                 # Arquivos ignorados pelo Git
```

## 🛠️ Como Usar

### Desenvolvimento Local

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/amplanet.git
cd amplanet
```

2. Abra o arquivo `index.html` em um navegador ou use um servidor local:

**Opção 1: Live Server (VS Code)**
- Instale a extensão "Live Server" no VS Code
- Clique com botão direito em `index.html` → "Open with Live Server"

**Opção 2: Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Opção 3: Node.js (http-server)**
```bash
npm install -g http-server
http-server
```

### Importante sobre o GeoJSON

O projeto inclui o GeoJSON embutido em `assets/js/cobertura-geojson.js` para evitar problemas de CORS ao abrir arquivos diretamente (`file://`). O código tenta carregar via fetch primeiro e usa o embutido como fallback.

## 📱 Páginas

- **index.html** - Página inicial
- **planos.html** - Planos de internet fibra óptica
- **servicos.html** - Serviços e aplicativos extras
- **cobertura.html** - Mapa de cobertura (Leaflet)
- **cobertura-google.html** - Mapa de cobertura (Google Maps)

## 🗺️ Mapa de Cobertura

### Funcionalidades

1. **Busca de Endereços**
   - Digite o endereço com "Teresina" para melhores resultados
   - Exemplo: "Av. Ininga, Teresina" ou "Jóquei Clube, Teresina"

2. **Geolocalização**
   - Clique no botão 📍 no canto superior direito
   - Permita acesso à localização no navegador
   - Verificação automática de cobertura

3. **Visualização**
   - Áreas azuis = Cobertura disponível
   - Zoom e navegação interativa
   - Popup com informações detalhadas

## 🔧 Configuração

### Links Externos

- **Área do Cliente**: `https://amplanet.com.br/central_assinante_web/login`
- **WhatsApp**: Links configuráveis nos CTAs

### GeoJSON

O arquivo `assets/Map/map.geojson` contém as áreas de cobertura. Para atualizar:

1. Edite o arquivo `map.geojson`
2. Ou atualize `cobertura-geojson.js` se estiver usando a versão embutida

## 📝 Documentação

- **PRD.md**: Documento completo de requisitos e especificações
- **INSTRUCOES_BUSCA_MAPA.md**: Instruções sobre melhorias na busca

## 🌐 Compatibilidade

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsivo (Mobile, Tablet, Desktop)
- Funciona offline (com GeoJSON embutido)

## 📄 Licença

Este projeto é propriedade da Amplanet LTDA.

## 👤 Autor

Desenvolvido para Amplanet LTDA - 04.812.045/0001-11

## 📞 Contato

- Email: gerencia@amplanet.com.br
- Endereço: Teresina - PI, 64048-110

---

**Nota**: Para ver os polígonos de cobertura funcionando corretamente, é recomendado usar um servidor HTTP local ao invés de abrir os arquivos diretamente.

