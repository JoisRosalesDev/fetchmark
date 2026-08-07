# Propuesta: fetchmark-v3

## Propósito
Evolucionar FetchMark a la versión v3 enfocándose en la refactorización UX/UI Mobile-First, la implementación de una Landing Page de captación y la optimización del motor de web scraping con soporte dedicado para YouTube mediante oEmbed API.

## Alcance
- **UX/UI & Mobile First**: Rediseño visual con tema claro (Light theme) por defecto, interfaz minimalista y accesibilidad táctil en móviles mediante menús kebab (`⋮`) y acciones explícitas sin dependencia de hover (`:hover`).
- **Landing Page**: Página pública de captación con Hero Section, presentación de características clave de scraping y llamadas a la acción (CTA) para iniciar sesión.
- **Scraper Resiliente con YouTube oEmbed**: Extracción condicional de metadatos enriquecidos (título, canal/autor y miniaturas HD) para enlaces de YouTube mediante oEmbed API con fallback transparente a Cheerio.

## Capacidades
- `ui-mobile-first`: Interfaz adaptable y optimizada para dispositivos táctiles sin interacciones ocultas tras hover.
- `landing-page`: Vista pública de presentación y conversión para usuarios no autenticados.
- `youtube-oembed-scraper`: Extracción resiliente de metadatos de YouTube mediante oEmbed API.

## Enfoque Arquitectónico
1. **Rediseño UI & Mobile First**:
   - Configuración de tokens Tailwind CSS para Light theme por defecto.
   - Sustitución de botones contextuales visibles al pasar el cursor por menús kebab (`⋮`) y botones explícitos en tarjetas de marcadores.
2. **Landing Page Pública**:
   - Implementación de ruta principal `/` accesible para usuarios anónimos con Hero, Features y CTA.
   - Redirección automática al panel de control `/dashboard` para usuarios autenticados.
3. **Scraper de Metadatos Híbrido**:
   - Detección del dominio de YouTube (`youtube.com` o `youtu.be`) en la función `/api/extract-metadata`.
   - Consulta condicional a la API oEmbed de YouTube (`https://www.youtube.com/oembed`) para obtener título, canal (`author_name`) y miniatura HD (`thumbnail_url`), con fallback a Cheerio OpenGraph para otros sitios.

## Áreas Afectadas
| Área | Descripción |
| --- | --- |
| `src/app/` | Landing page pública, componentes de marcadores, menú kebab y estilos Light theme. |
| `api/` | Serverless Function de scraping (`/api/extract-metadata`) actualizada con integración oEmbed. |
| `src/styles.css` | Variables de color y estilos utilitarios de Tailwind CSS v4 para tema claro por defecto. |

## Riesgos y Mitigaciones
- **Fallos o límites de tasa en YouTube oEmbed**: Mitigado con fallback automático al parser HTML Cheerio.
- **Regresiones visuales en dispositivos móviles**: Verificación de usabilidad táctil en resoluciones < 768px.

## Plan de Reversión
1. Revertir el despliegue en Vercel a la versión previa tag originario `v2`.
2. Restaurar la rama de código principal al estado anterior de la versión v3.

## Criterios de Éxito
- [ ] Tema claro (Light theme) activo por defecto con acciones de marcadores accesibles en móvil mediante menú kebab (`⋮`).
- [ ] Landing page estática desplegada con Hero Section, Features de scraping y CTA a Login.
- [ ] Extracción exitosa de título, canal y miniatura HD para URLs de YouTube vía oEmbed API.
- [ ] Fallback transparente a Cheerio para otros dominios o en caso de error de red.
