# Especificación Técnica Global: fetchmark-v2

## 1. Resumen Ejecutivo
Esta especificación define la arquitectura, esquemas de datos, estructura de archivos y acuerdos de entorno para la evolución **fetchmark-v2**. La solución proporciona autenticación mediante Google OAuth, gestión multi-inquilino de marcadores y carpetas con aislamiento estricto de datos por usuario, extracción automática de metadatos OpenGraph mediante Cheerio y una infraestructura serverless desplegada en Vercel sobre PostgreSQL alojado en Supabase.

---

## 2. Esquema Prisma de Producción (`prisma/schema.prisma`)

El esquema implementa conexión a Supabase PostgreSQL utilizando Supavisor (puerto `6543`) para consultas en ejecución serverless y conexión directa (`5432`) para migraciones DDL de Prisma CLI. Garantiza aislamiento multatenant a nivel de modelo mediante la clave foránea `userId` con índices compuestos y borrado en cascada.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id            String     @id @default(uuid())
  email         String     @unique
  name          String?
  avatarUrl     String?
  googleId      String     @unique
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  folders       Folder[]
  bookmarks     Bookmark[]

  @@map("users")
}

model Folder {
  id        String     @id @default(uuid())
  name      String
  color     String?    @default("#3B82F6")
  icon      String?    @default("folder")
  parentId  String?
  userId    String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent    Folder?    @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children  Folder[]   @relation("FolderHierarchy")
  bookmarks Bookmark[]

  @@index([userId])
  @@index([parentId])
  @@map("folders")
}

model Bookmark {
  id          String   @id @default(uuid())
  title       String
  url         String
  description String?  @db.Text
  ogImage     String?  @db.Text
  favicon     String?  @db.Text
  folderId    String?
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder Folder? @relation(fields: [folderId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([folderId])
  @@map("bookmarks")
}
```

---

## 3. Configuración Vercel (`vercel.json`)

Configuración de enrutamiento y reescritura para aislar totalmente las Serverless Functions bajo el prefijo `/api/*` del motor SSR de Angular. Evita colisiones de ruteo y optimiza tiempos de respuesta e invocación.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/fetchmark/browser",
  "framework": "angular",
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 15
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0, must-revalidate"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 4. Árbol de Directorios del Proyecto

Estructura modular dividida entre el Frontend Angular 22 (Atomic Design + Signals) y el Backend Vercel Serverless Functions (`/api`).

```text
fetchmark/
├── api/                                    # Vercel Serverless Functions Backend
│   ├── auth/
│   │   ├── google.ts                       # GET /api/auth/google -> Redirección OAuth2
│   │   ├── callback.ts                     # GET /api/auth/callback -> Valida code, crea User y emite JWT cookie
│   │   ├── me.ts                           # GET /api/auth/me -> Datos del usuario autenticado
│   │   └── logout.ts                       # POST /api/auth/logout -> Revoca token/cookie
│   ├── bookmarks/
│   │   ├── index.ts                        # GET /api/bookmarks, POST /api/bookmarks
│   │   ├── [id].ts                         # GET, PUT, DELETE /api/bookmarks/:id
│   │   └── scrape.ts                       # POST /api/bookmarks/scrape -> Extracción Cheerio OG
│   ├── folders/
│   │   ├── index.ts                        # GET /api/folders, POST /api/folders
│   │   └── [id].ts                         # GET, PUT, DELETE /api/folders/:id
│   └── lib/
│       ├── auth.ts                         # Middleware verificación JWT y extracción de userId
│       ├── prisma.ts                       # Instancia singleton PrismaClient con connection pooling
│       └── scraper.ts                      # Servicio con Cheerio para extracción OpenGraph/favicons
├── prisma/
│   └── schema.prisma                       # Esquema Prisma PostgreSQL
├── src/
│   ├── app/
│   │   ├── components/                     # Componentes Angular basados en Atomic Design
│   │   │   ├── atoms/
│   │   │   │   ├── button/                 # Botón atómico (variantes, carga, iconos)
│   │   │   │   ├── input/                  # Inputs de texto y búsqueda estilizados con Tailwind
│   │   │   │   ├── badge/                  # Etiqueta para estado o carpetas
│   │   │   │   ├── icon/                   # Renderizador de iconos SVG
│   │   │   │   └── avatar/                 # Imagen de usuario OAuth
│   │   │   ├── molecules/
│   │   │   │   ├── search-bar/             # Barra de búsqueda con debounce
│   │   │   │   ├── bookmark-card/          # Tarjeta preview de marcador con imagen OG
│   │   │   │   ├── folder-item/            # Item individual de árbol de carpetas
│   │   │   │   └── modal-header/           # Cabecera genérica de diálogo modal
│   │   │   ├── organisms/
│   │   │   │   ├── bookmark-grid/          # Rejilla adaptativa de marcadores
│   │   │   │   ├── folder-tree/            # Árbol navegable y jerárquico de carpetas
│   │   │   │   ├── navbar/                 # Barra superior con datos de usuario y logout
│   │   │   │   ├── bookmark-form-modal/    # Modal para creación/edición de marcadores
│   │   │   │   └── folder-form-modal/      # Modal para creación/edición de carpetas
│   │   │   └── templates/
│   │   │       ├── auth-layout/            # Layout visual para pantalla de login
│   │   │       └── dashboard-layout/       # Layout con sidebar de carpetas y área principal
│   │   ├── core/
│   │   │   ├── guards/                     # AuthGuard para protección de rutas cliente
│   │   │   ├── interceptors/               # AuthInterceptor para inclusión de credenciales JWT
│   │   │   ├── models/                     # Interfaces TypeScript (User, Folder, Bookmark, ScrapedMetadata)
│   │   │   └── services/                   # Servicios Angular con Signals
│   │   │       ├── auth.service.ts         # Estado de sesión y llamadas a /api/auth
│   │   │       ├── bookmark.service.ts     # CRUD de marcadores y scraping
│   │   │       └── folder.service.ts       # CRUD de carpetas y selección jerárquica
│   │   ├── pages/
│   │   │   ├── login/                      # Página de inicio de sesión Google OAuth
│   │   │   └── dashboard/                  # Panel principal de gestión de marcadores
│   │   ├── app.config.ts                   # Configuración del cliente (Providers, Interceptors)
│   │   ├── app.routes.ts                   # Definición de rutas protegidas de Angular Router
│   │   └── app.ts                          # Componente raíz de la aplicación
│   └── styles.css                          # Estilos globales Tailwind CSS v4
├── .env.example                            # Contrato estricto de variables de entorno
└── vercel.json                             # Configuración de despliegue Vercel
```

---

## 5. Contrato de Variables de Entorno (`.env.example`)

```ini
# ==========================================
# BASE DE DATOS SUPABASE (PRISMA ORM)
# ==========================================
# URL de conexión a Supavisor (Connection Pooler en modo transacción, puerto 6543)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# URL de conexión directa a PostgreSQL (puerto 5432, exclusivamente para prisma migrate / db push)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ==========================================
# AUTENTICACIÓN GOOGLE OAUTH2
# ==========================================
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:4200/api/auth/callback"

# ==========================================
# SEGURIDAD Y SESIONES JWT
# ==========================================
# Clave secreta para firma de JSON Web Tokens (mínimo 32 caracteres estricto)
JWT_SECRET="super-secret-jwt-key-min-32-characters-long-production-grade"
JWT_EXPIRES_IN="7d"

# ==========================================
# CONFIGURACIÓN DE ENTORNO Y DOMINIO
# ==========================================
NODE_ENV="development"
APP_URL="http://localhost:4200"
