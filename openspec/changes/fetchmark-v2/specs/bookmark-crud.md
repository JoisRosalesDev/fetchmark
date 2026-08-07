# Especificación de Requisitos: bookmark-crud

## 1. Declaración de Requisitos RFC 2119

### 1.1 Gestión de Carpetas (Folders)
- EL SISTEMA **DEBE** permitir la creación de carpetas mediante POST `/api/folders` requiriendo los campos `name`, y opcionalmente `color`, `icon` y `parentId`.
- EL SISTEMA **DEBE** validar que si se proporciona `parentId`, dicha carpeta padre pertenezca estrictamente al `userId` del usuario autenticado.
- EL SISTEMA **DEBE** permitir listar la jerarquía completa de carpetas del usuario autenticado mediante GET `/api/folders`.
- EL SISTEMA **DEBE** permitir la actualización de carpetas (PUT `/api/folders/[id]`) y eliminación (DELETE `/api/folders/[id]`).
- Al eliminar una carpeta, el sistema **DEBE** eliminar en cascada todas sus subcarpetas descendientes y desasociar (`SetNull`) o eliminar en cascada sus marcadores asociados según la relación Prisma definida.

### 1.2 Gestión de Marcadores (Bookmarks)
- EL SISTEMA **DEBE** permitir la creación de marcadores mediante POST `/api/bookmarks` requiriendo los campos `title` y `url`, y opcionalmente `description`, `ogImage`, `favicon` y `folderId`.
- EL SISTEMA **DEBE** validar que la propiedad `url` enviada sea una URL válida con protocolo HTTP o HTTPS.
- EL SISTEMA **DEBE** permitir obtener la lista de marcadores del usuario mediante GET `/api/bookmarks`, soportando filtrado opcional por `folderId` o término de búsqueda (`query`).
- EL SISTEMA **DEBE** permitir la actualización de marcadores mediante PUT `/api/bookmarks/[id]` y eliminación mediante DELETE `/api/bookmarks/[id]`.

### 1.3 Aislamiento y Seguridad Multatenant
- EL SISTEMA **NO DEBE** permitir a un usuario leer, modificar ni eliminar carpetas o marcadores pertenecientes a otro usuario.
- Todas las consultas a la base de datos en las Serverless Functions **DEBEN** incluir la cláusula de filtrado `where: { userId: session.userId }`.
- Si un usuario intenta acceder o modificar un recurso con un `id` perteneciente a otro usuario, el sistema **DEBE** responder con estado HTTP 404 Not Found o HTTP 403 Forbidden.

---

## 2. Escenarios BDD (Dado / Cuando / Entonces)

### Escenario 1: Creación de marcador con asignación a carpeta
- **Dado** un usuario autenticado en el sistema
- **Y** una carpeta existente con ID `"folder-123"` perteneciente al usuario
- **Cuando** el usuario envía una petición POST a `/api/bookmarks` con el cuerpo JSON:
  ```json
  {
    "title": "Documentación Angular",
    "url": "https://angular.dev",
    "folderId": "folder-123",
    "description": "Sitio oficial de Angular 22"
  }
  ```
- **Entonces** la función serverless debe verificar la sesión del usuario y la validez de la carpeta
- **Y** debe insertar el registro en PostgreSQL asociando `userId` y `folderId`
- **Y** debe responder con HTTP 201 Created y el objeto del marcador creado.

### Escenario 2: Intento de asociar un marcador a una carpeta de otro usuario
- **Dado** un usuario autenticado "Usuario A" (ID `"user-A"`)
- **Y** una carpeta `"folder-B"` perteneciente a "Usuario B"
- **Cuando** "Usuario A" envía una petición POST a `/api/bookmarks` especificando `"folderId": "folder-B"`
- **Entonces** el servidor debe detectar la discrepancia de propiedad
- **Y** debe denegar la operación respondiendo con HTTP 403 Forbidden o HTTP 404 Not Found
- **Y** no debe crear ningún marcador en la base de datos.

### Escenario 3: Búsqueda y filtrado de marcadores en tiempo real
- **Dado** un usuario autenticado con 20 marcadores guardados
- **Cuando** el usuario ingresa el término `"tailwindcss"` en la barra de búsqueda del frontend
- **Entonces** el cliente debe invocar GET `/api/bookmarks?query=tailwindcss`
- **Y** el servidor debe retornar HTTP 200 OK con únicamente los marcadores donde el título, la URL o la descripción contengan el término ingresado para ese `userId`.

### Escenario 4: Eliminación de carpeta con subcarpetas en cascada
- **Dado** una carpeta raíz `"Proyectos"` que contiene la subcarpeta `"Angular"`
- **Cuando** el usuario solicita DELETE `/api/folders/id-proyectos`
- **Entonces** la base de datos en PostgreSQL debe ejecutar la eliminación en cascada de la carpeta raíz y de la subcarpeta `"Angular"`
- **Y** el servidor debe responder con HTTP 200 OK confirmando la eliminación.
