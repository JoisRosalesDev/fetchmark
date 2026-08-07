# Propuesta: fetchmark-v2

## Propósito
Evolucionar FetchMark a la versión v2 integrando autenticación con Google OAuth, gestión CRUD de marcadores y carpetas con web scraping mediante Cheerio, y despliegue optimizado en Vercel con Supabase PostgreSQL.

## Alcance
- **Flujos Core**: Autenticación Google OAuth, CRUD de marcadores/carpetas y extracción de metadatos OpenGraph mediante Cheerio.
- **Topología de Despliegue**: Angular SSR para vistas + Vercel Serverless Functions exclusivamente bajo `/api/*` para prevenir colisiones de ruteo.
- **Infraestructura de Datos**: Supabase PostgreSQL con Prisma ORM utilizando Supavisor/PGBouncer en modo connection pooler.

## Capacidades
- `auth-google`: Inicio de sesión y gestión de sesiones mediante OAuth2.
- `bookmark-crud`: Creación, lectura, actualización y eliminación de marcadores y carpetas.
- `metadata-scraping`: Enriquecimiento automático de URLs con Cheerio (título, imagen, descripción).
- `serverless-db`: Conexión resiliente a base de datos serverless mediante connection pooler.

## Enfoque Arquitectónico
1. **Rutas e Integración API**:
   - Vistas de la aplicación renderizadas por Angular SSR.
   - Endpoints de backend alojados en Vercel Serverless Functions con prefijo estricto `/api/*` en `vercel.json`.
2. **Persistencia & Connection Pooling**:
   - Prisma ORM configurado con `DATABASE_URL` apuntando al pooler (puerto 6543, modo transacción) para ejecuciones serverless.
   - Configuración de `DIRECT_URL` (puerto 5432) exclusivamente para migraciones de esquemas.
3. **Gestión de Entornos**:
   - Reglas estrictas para aislamiento de variables de entorno entre `DEV` y `PROD`.

## Áreas Afectadas
| Área | Descripción |
| --- | --- |
| `src/app/` | Componentes UI de Angular (Auth, Gestor de Marcadores, Árbol de Carpetas). |
| `api/` | Serverless Functions en Node.js (`/api/auth/*`, `/api/bookmarks/*`). |
| `prisma/` | Esquema Prisma, migraciones y cliente con pooling. |
| `vercel.json` | Reglas de reescritura y ruteo para aislar SSR de `/api/*`. |

## Riesgos y Mitigaciones
- **Colisión de Rutas SSR/API**: Mitigado aislando todas las Serverless Functions bajo `/api/*`.
- **Agotamiento de Conexiones DB**: Mitigado utilizando el Connection Pooler de Supabase (Supavisor/PGBouncer).

## Plan de Reversión
1. Revertir el despliegue en Vercel al commit previo a la versión v2.
2. Ejecutar rollback en Supabase si se aplicaron migraciones destructivas.

## Criterios de Éxito
- [ ] Flujo de autenticación Google OAuth plenamente operativo en entornos DEV y PROD.
- [ ] Operaciones CRUD de marcadores/carpetas y scraping con Cheerio funcionando sin degradar rendimiento.
- [ ] Cero colisiones de ruteo entre Angular SSR y endpoints `/api/*`.
- [ ] Conexión a Prisma optimizada con Supavisor/PGBouncer sin saturación de conexiones.
- [ ] Variables de entorno `DATABASE_URL` y `DIRECT_URL` adecuadamente segregadas entre DEV y PROD.
