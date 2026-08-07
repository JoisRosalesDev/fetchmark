# FetchMark V2

**FetchMark** es una plataforma web moderna para la gestión inteligente de marcadores, scraping automático de metadatos OpenGraph, integración dedicada con YouTube oEmbed y organización por carpetas.

---

## 🏛️ Arquitectura y Tecnologías Core

FetchMark V2 está estructurado bajo una arquitectura decoupled Serverless BFF (Backend For Frontend) e interfaz reactiva de alto rendimiento:

- **Frontend Reactivo**: Construido en **Angular 22** aprovechando **Angular Signals** (`signal`, `computed`) y arquitectura Standalone Components para un renderizado ultrarrápido y reactividad sin overhead.
- **Backend Serverless BFF**: API construida sobre funciones **Express Serverless en Vercel** (`/api/*`), garantizando escalabilidad horizontal automática sin mantenimiento de infraestructura.
- **Capa de Datos & ORM**: **Supabase PostgreSQL** administrado con **Prisma ORM Client**, utilizando **Supavisor** (puerto 6543) para pooling de conexiones serverless y enlace directo (puerto 5432) para migraciones.
- **Autenticación Criptográfica**: Autenticación Google OAuth2 respaldada por cookies encriptadas `HttpOnly` (`fetchmark_session`) y firmas JWT con expiración configurable.

---

## ✨ Características Principales

### 1. Extractor Inteligente de Metadatos (YouTube oEmbed + Cheerio Fallback)
El microservicio de scraping analiza URLs ingresadas por el usuario:
- Detecta enlaces de **YouTube** y consulta la API oficial oEmbed para obtener títulos exactos, nombres de canales y miniaturas en alta resolución (`maxresdefault.jpg`).
- Para otros sitios web, ejecuta un parsing HTML resiliente con **Cheerio** y timeout estricto de 5 segundos, resolviendo imágenes `og:image`, favicones y descripciones con resolución de URLs relativas a absolutas.

### 2. Menú Accional Mobile-First Kebab
- Diseñado pensando en dispositivos móviles y pantallas táctiles.
- Acceso a acciones contextuales (editar, eliminar, abrir enlace) mediante menú de puntos flotante continuo (Kebab menu) sin dependencia de eventos de cursor suspendido (`hover`).

### 3. Sistema de Diseño & Tema Claro Profesional
- Interfaz en **Tema Claro (Light Theme)** estilizada con Tailwind CSS.
- Paleta semántica estructurada (`indigo`, `slate`, `emerald`, `rose`), tarjetas con elevaciones suaves, gradientes sutiles y estados de carga optimizados mediante Skeletons.

### 4. Organización Jerárquica y Búsqueda Real-Time
- Creación de carpetas personalizadas.
- Filtrado dinámico instantáneo por texto en títulos, descripciones y URLs.
- Aislamiento multi-tenant estricto de datos por `userId`.

---

## 🔐 Contrato de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en la plantilla `.env.example`:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexión PostgreSQL Supabase con Supavisor Pooler (puerto 6543) | `postgresql://user:pass@db.supabase.co:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | URL de conexión directa PostgreSQL Supabase para migraciones (puerto 5432) | `postgresql://user:pass@db.supabase.co:5432/postgres` |
| `GOOGLE_CLIENT_ID` | Identificador de cliente para Google OAuth2 | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Clave secreta del cliente Google OAuth2 | `GOCSPX-xxxxxxxxxxxxxx` |
| `GOOGLE_REDIRECT_URI` | URL de callback de autenticación | `http://localhost:3000/api/auth/callback` |
| `JWT_SECRET` | Clave secreta de 32+ caracteres para firmar tokens JWT | `tu_clave_secreta_jwt_de_alta_seguridad_32_chars` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token JWT | `7d` |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) | `development` |
| `APP_URL` | URL base de la aplicación cliente | `http://localhost:4200` |

---

## 💻 Instalación y Desarrollo Local

### Prerrequisitos
- Node.js versión 18+ o superior.
- npm versión 9+ o superior.

### Pasos de Ejecución

1. **Clonar el repositorio e instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar el esquema de la base de datos con Prisma**:
   ```bash
   npx prisma db push
   ```

3. **Iniciar el servidor de desarrollo local**:
   ```bash
   npm run dev
   ```

4. **Compilar la aplicación para producción**:
   ```bash
   npm run build
   ```

---

## 🚀 Configuración de Despliegue en Vercel

FetchMark V2 está optimizado para su despliegue en la plataforma **Vercel** mediante el archivo de configuración `vercel.json`:

- **Build Command**: `npm run build`
- **Output Directory**: `dist/fetchmark/browser`
- **Rewrites isolados**: Redirección de peticiones `/api/(.*)` a la capa Serverless `/api/$1`, e hipervínculos SPA a `/index.html`.
- **Cabeceras de Seguridad**: Inyección de headers HTTP (`Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`) para la API.

---

## 📄 Licencia y Derechos

© 2026 FetchMark. Todos los derechos reservados.
