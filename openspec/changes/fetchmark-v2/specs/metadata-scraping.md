# Especificación de Requisitos: metadata-scraping

## 1. Declaración de Requisitos RFC 2119

### 1.1 Extracción de Metadatos OpenGraph y Favicon con Cheerio
- EL SISTEMA **DEBE** proporcionar un endpoint POST `/api/bookmarks/scrape` que reciba un objeto JSON con el campo `url`.
- EL SISTEMA **DEBE** realizar la petición HTTP GET a la URL indicada utilizando un timeout estricto no superior a 5000 milisegundos.
- EL SISTEMA **DEBE** simular un User-Agent de navegador moderno en la petición HTTP para evitar bloqueos por parte de servidores de destino.
- EL SISTEMA **DEBE** utilizar la librería **Cheerio** para analizar el documento HTML recibido y extraer los siguientes metadatos:
  - **Título**: Meta etiqueta `og:title`, etiqueta `<title>`, o `twitter:title`.
  - **Descripción**: Meta etiqueta `og:description`, `description`, o `twitter:description`.
  - **Imagen Preview**: Meta etiqueta `og:image`, `twitter:image`, o la primera imagen relevante del documento.
  - **Favicon**: Etiquetas `<link rel="icon">`, `<link rel="shortcut icon">`, o la URL por defecto `/favicon.ico` del dominio.

### 1.2 Normalización de URLs y Resiliencia
- EL SISTEMA **DEBE** resolver todas las rutas relativas encontradas en las imágenes de vista previa o favicons para convertirlas en URLs absolutas válidas.
- Si la petición de scraping falla (timeout, error 404, bloqueo SSL, sitio no disponible), el sistema **NO DEBE** abortar la creación del marcador ni fallar de manera catastrófica.
- En caso de error en el scraping, el sistema **DEBE** retornar un objeto de metadatos parcial o por defecto conteniendo el título derivado del nombre de dominio de la URL y un icono por defecto.

---

## 2. Escenarios BDD (Dado / Cuando / Entonces)

### Escenario 1: Extracción exitosa de metadatos OpenGraph completos
- **Dado** una URL pública válida `"https://github.com/angular/angular"`
- **Cuando** el cliente envía POST `/api/bookmarks/scrape` con `{"url": "https://github.com/angular/angular"}`
- **Entonces** la función serverless debe descargar el HTML y parsearlo con Cheerio
- **Y** debe responder con HTTP 200 OK y el JSON conteniendo:
  ```json
  {
    "title": "GitHub - angular/angular: Deliver web apps with confidence",
    "description": "Deliver web apps with confidence. Contribute to angular/angular development by creating an account on GitHub.",
    "ogImage": "https://opengraph.githubassets.com/...",
    "favicon": "https://github.githubassets.com/favicons/favicon.svg"
  }
  ```

### Escenario 2: Scraping de sitio web sin etiquetas OpenGraph
- **Dado** un sitio web estático simple que solo contiene `<title>Mi Blog</title>` y `<meta name="description" content="Un blog personal">`
- **Cuando** el cliente solicita POST `/api/bookmarks/scrape`
- **Entonces** Cheerio debe realizar el fallback secuencial a las etiquetas HTML estándar
- **Y** debe retornar HTTP 200 OK con el título y la descripción extraídos de los elementos estándar.

### Escenario 3: Manejo de error de timeout o sitio no disponible
- **Dado** una URL inalcanzable o que excede el tiempo límite de 5 segundos `"https://domain-that-times-out.example"`
- **Cuando** el servidor ejecuta la función `/api/bookmarks/scrape`
- **Entonces** la petición HTTP debe abortar tras el timeout de 5 segundos
- **Y** la función debe capturar la excepción y responder con HTTP 200 OK retornando metadatos mínimos:
  ```json
  {
    "title": "domain-that-times-out.example",
    "description": "",
    "ogImage": null,
    "favicon": "https://domain-that-times-out.example/favicon.ico"
  }
  ```
