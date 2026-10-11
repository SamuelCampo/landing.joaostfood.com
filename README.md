# Joaos Fast Food · Astro

Landing estática para descubrir el menú, configurar un pedido y continuar por WhatsApp.

## Requisitos

- Node.js 24 LTS (`.nvmrc` fija 24.20.0; `engines` acepta la línea 24).
- npm incluido con Node.

## Desarrollo

```sh
nvm use
npm install
npm run dev
```

## Compilar

```sh
nvm use
npm run build
npm run preview
```

Las secciones viven en `src/components`, el menú y sus precios en `src/data/menu.js`, y la lógica de modal/carrito/WhatsApp en `src/scripts/order.js`. `legacy/index.html` conserva la versión HTML anterior como referencia. Los precios de carta y la vigencia de las promociones deben confirmarse con Joaos antes de publicar.
# landing.joaostfood.com
