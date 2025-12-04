# Amplanet - Site Institucional

Site institucional da Amplanet com mapa de cobertura interativo para Teresina (PI).

## 📋 Sobre o Projeto

Este é um site estático responsivo desenvolvido para a Amplanet, incluindo:

- Página inicial com apresentação da empresa
- Planos de internet fibra óptica
- Serviços e aplicativos disponíveis
- **Mapa de cobertura interativo** com Google Maps

## 🚀 Funcionalidades

### Mapa de Cobertura
- Mapa integrado com Google Maps e busca customizada
- Verificação de cobertura em tempo real
- Busca de endereços com filtros para Teresina, PI
- Botão de geolocalização para usar sua localização atual

### Tecnologias Utilizadas

- HTML5
- CSS3 (Mobile-first, responsivo)
- JavaScript (Vanilla JS)
- Google Maps - Mapa integrado com busca de endereços

## 📁 Estrutura do Projeto

```
Amplanet/
├── assets/
│   ├── css/
│   │   └── style.css          # Estilos principais
│   ├── js/
│   │   ├── main.js            # Scripts globais
│   │   └── cobertura-google.js # Mapa Google Maps
│   ├── Map/
│   │   └── map.geojson        # Dados das áreas de cobertura
│   └── images/                # Imagens e ícones
├── Docs/
│   └── PRD.md                 # Documento de requisitos
├── index.html                 # Página inicial
├── planos.html                # Planos de internet
├── servicos.html              # Serviços e apps
└── pages/
    └── cobertura.html         # Mapa de cobertura (Google Maps)
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


## 📱 Páginas

- **index.html** - Página inicial
- **pages/planos.html** - Planos de internet fibra óptica
- **pages/servicos.html** - Serviços e aplicativos extras
- **pages/cobertura.html** - Mapa de cobertura (Google Maps)

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

- **Área do Cliente**: `https://sistema.amplanet.com.br/central_assinante_web/login`
- **WhatsApp**: Links configuráveis nos CTAs


## 📝 Documentação

- **PRD.md**: Documento completo de requisitos e especificações

## 🌐 Compatibilidade

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsivo (Mobile, Tablet, Desktop)

## 📄 Licença

Este projeto é propriedade da Amplanet LTDA.

## 👤 Autor

Desenvolvido para Amplanet LTDA - 04.812.045/0001-11

## 📞 Contato

- Email: gerencia@amplanet.com.br
- Endereço: Teresina - PI, 64048-110

---

**Nota**: Para usar a busca de endereços no mapa, é recomendado usar um servidor HTTP local ao invés de abrir os arquivos diretamente.

