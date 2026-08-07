# Especificación de Requisitos: serverless-db

## 1. Declaración de Requisitos RFC 2119

### 1.1 Configuración de Prisma y Connection Pooler
- EL SISTEMA **DEBE** utilizar Prisma ORM con el cliente JS/TS en un patrón Singleton (`api/lib/prisma.ts`) para reutilizar la conexión en las funciones serverless de Vercel y prevenir fugas de conexión.
- EL SISTEMA **DEBE** utilizar la variable `DATABASE_URL` conectándose al puerto `6543` de Supavisor/PGBouncer en modo transacción (`?pgbouncer=true&connection_limit=1`) durante la ejecución de las funciones serverless.
- EL SISTEMA **DEBE** utilizar la variable `DIRECT_URL` conectándose al puerto directo `5432` únicamente durante operaciones de migración de esquema (`prisma migrate` / `prisma db push`).

### 1.2 Aislamiento de Entornos y Resiliencia DB
- EL SISTEMA **DEBE** garantizar que las credenciales y las URLs de base de datos estén adecuadamente segregadas entre los entornos de Desarrollo (`DEV`) y Producción (`PROD`).
- En caso de errores temporales de conexión a la base de datos (p. ej., reconexión del pooler o reinicio del contenedor), la instancia Singleton de Prisma **DEBERÍA** reintentar automáticamente la ejecución de la consulta antes de lanzar una excepción fatal.

---

## 2. Escenarios BDD (Dado / Cuando / Entonces)

### Escenario 1: Reutilización de instancia de cliente Prisma en ambiente serverless
- **Dado** múltiples peticiones HTTP concurrentes llegando a Vercel Serverless Functions
- **Cuando** cada función importa el módulo `api/lib/prisma.ts`
- **Entonces** el sistema debe retornar la misma instancia `PrismaClient` almacenada en el objeto `globalThis` si el entorno es de desarrollo o reutilizar la conexión activa
- **Y** no debe agotar la piscina de conexiones de PostgreSQL.

### Escenario 2: Ejecución de migraciones DDL con conexión directa
- **Dado** que un desarrollador ejecuta `npx prisma migrate dev` o `npx prisma db push`
- **Cuando** la CLI de Prisma lee `prisma/schema.prisma`
- **Entonces** Prisma debe usar la variable `DIRECT_URL` conectándose al puerto `5432` sin pasar por PGBouncer
- **Y** debe aplicar los cambios DDL de tabla (`users`, `folders`, `bookmarks`) de manera transparente.
