# Instruções para Melhorar a Busca no Mapa

## Melhorias Implementadas

A busca no mapa Leaflet foi melhorada com as seguintes funcionalidades:

1. **Geocoder Otimizado para Teresina**
   - Adiciona automaticamente "Teresina, PI" às buscas
   - Usa viewbox para priorizar resultados de Teresina
   - Filtra resultados para mostrar apenas locais em Teresina

2. **Busca Direta via API**
   - Função `searchDirectly()` para busca alternativa
   - Parâmetros otimizados para melhor cobertura

## Como Usar Mapbox (Opcional - Melhora Significativa)

O Mapbox oferece cobertura de dados muito melhor que o Nominatim, especialmente para ruas e endereços específicos.

### Passo 1: Obter Token do Mapbox

1. Acesse: https://account.mapbox.com/
2. Crie uma conta gratuita (inclui 100.000 requisições/mês gratuitas)
3. Vá em "Tokens" e copie seu token de acesso público (começa com `pk.eyJ...`)

### Passo 2: Ativar Mapbox no Código

Abra o arquivo `assets/js/cobertura.js` e encontre a função `setupGeocoder()` (por volta da linha 148).

Atualmente está assim:
```javascript
const improvedGeocoder = createImprovedNominatim();
```

**Para ativar Mapbox**, você precisará modificar a função `createImprovedNominatim()` ou criar uma nova função que use Mapbox.

### Exemplo de Integração com Mapbox:

```javascript
function createMapboxGeocoder(token) {
    return L.Control.Geocoder.mapbox(token);
}

// No setupGeocoder():
const mapboxToken = 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNs...'; // SEU TOKEN AQUI
const mapboxGeocoder = createMapboxGeocoder(mapboxToken);
```

### Alternativa: Usar Mapbox GL JS

Se preferir, você pode migrar completamente para Mapbox GL JS, que oferece:
- Melhor performance
- Dados mais atualizados
- Melhor cobertura de ruas
- API mais robusta

Documentação: https://docs.mapbox.com/mapbox-gl-js/api/

## Testando a Busca

Tente buscar:
- "Av. Ininga"
- "Jóquei Clube"
- "Shopping Rio Poty"
- "Fátima"
- "Macaúba"
- Nomes de ruas específicas

## Se Ainda Não Funcionar Bem

1. **Verifique se o OpenStreetMap tem dados para Teresina**
   - Acesse: https://www.openstreetmap.org/
   - Busque por ruas de Teresina
   - Se não houver dados, considere usar Mapbox

2. **Use formato mais específico na busca**
   - Exemplo: "Avenida Ininga, Teresina, PI"
   - Exemplo: "Rua Nome da Rua, Teresina"

3. **Ative Mapbox** para melhor cobertura

## Notas

- O Nominatim (OpenStreetMap) é gratuito mas pode ter dados limitados
- O Mapbox oferece melhor cobertura mas requer token (100k requisições/mês grátis)
- Para produção, recomendo usar Mapbox para melhor experiência do usuário

