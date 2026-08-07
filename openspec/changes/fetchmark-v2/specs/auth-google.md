# Especificación de Requisitos: auth-google

## 1. Declaración de Requisitos RFC 2119

### 1.1 Autenticación e Iniciación OAuth
- EL SISTEMA **DEBE** proporcionar un endpoint GET `/api/auth/google` que redirija al usuario a la pantalla de autorización de Google OAuth 2.0.
- EL SISTEMA **DEBE** incluir los scopes de `openid`, `email` y `profile` en la solicitud de inicio de sesión de Google.
- EL SISTEMA **DEBE** generar un parámetro `state` criptográficamente seguro en la redirección para prevenir ataques CSRF.

### 1.2 Callback y Gestión de Usuarios
- EL SISTEMA **DEBE** exponer un endpoint GET `/api/auth/callback` para recibir el código de autorización emitido por Google.
- EL SISTEMA **DEBE** intercambiar el código por tokens de Google y validar el token ID devuelto por el proveedor.
- Si el usuario no existe en la base de datos, el sistema **DEBE** crear un nuevo registro en la tabla `User` registrando `email`, `name`, `avatarUrl` y `googleId`.
- Si el usuario ya existe, el sistema **DEBE** actualizar sus atributos de perfil (`name`, `avatarUrl`) si han cambiado.

### 1.3 Emisión de Sesión y Seguridad de Cookies
- EL SISTEMA **DEBE** emitir un token JWT firmado mediante `JWT_SECRET` tras una autenticación exitosa.
- EL SISTEMA **DEBE** establecer la cookie HTTP-Only llamada `fetchmark_session` conteniendo el token JWT.
- La cookie `fetchmark_session` **DEBE** incluir los atributos `HttpOnly`, `SameSite=Lax`, `Path=/` y `Secure` cuando `NODE_ENV=production`.
- El token JWT **DEBE** expiraren un período máximo de 7 días.

### 1.4 Estado de Sesión y Cierre de Sesión
- EL SISTEMA **DEBE** proporcionar el endpoint GET `/api/auth/me` para verificar la validez de la sesión actual y retornar la entidad del usuario sin exponer secretos.
- EL SISTEMA **DEBE** proporcionar el endpoint POST `/api/auth/logout` que elimine y expire inmediatamente la cookie de sesión `fetchmark_session`.
- El cliente Angular **DEBE** interceptar respuestas HTTP 401 Unauthorized y redirigir al usuario al flujo de inicio de sesión (`/login`).

---

## 2. Escenarios BDD (Dado / Cuando / Entonces)

### Escenario 1: Redirección inicial exitosa a Google OAuth
- **Dado** que un usuario no autenticado navega a la pantalla de inicio de sesión
- **Cuando** el usuario hace clic en el botón "Iniciar sesión con Google"
- **Entonces** el cliente debe solicitar GET `/api/auth/google`
- **Y** el servidor debe responder con un estado HTTP 302 Redirección hacia `https://accounts.google.com/o/oauth2/v2/auth` con los parámetros válidos de `client_id`, `redirect_uri`, `scope` y `state`.

### Escenario 2: Registro de nuevo usuario tras callback de Google
- **Dado** que un usuario autoriza exitosamente la aplicación en Google
- **Cuando** Google redirige al callback GET `/api/auth/callback?code=CODE_VALIDO&state=STATE_VALIDO`
- **Entonces** el servidor debe validar la respuesta y consultar la base de datos por `googleId`
- **Y** al no encontrar el usuario, debe insertar un nuevo `User` en PostgreSQL
- **Y** debe responder con una redirección HTTP 302 hacia `/dashboard` configurando la cookie `fetchmark_session` HTTP-Only.

### Escenario 3: Intento de callback con código inválido o expirado
- **Dado** que se envía un código de autorización alterado o expirado al callback
- **Cuando** la función serverless `/api/auth/callback` procesa la petición
- **Entonces** el servidor debe retornar un código de estado HTTP 400 Bad Request o 401 Unauthorized
- **Y** no debe emitir ninguna cookie de sesión
- **Y** debe redirigir al cliente a `/login?error=auth_failed`.

### Escenario 4: Verificación de sesión activa mediante `/api/auth/me`
- **Dado** un cliente con una cookie `fetchmark_session` válida
- **Cuando** el cliente realiza una petición GET a `/api/auth/me`
- **Entonces** el servidor debe descifrar el token JWT, verificar su firma y tiempo de expiración
- **Y** debe retornar HTTP 200 OK con el objeto JSON conteniendo `{ id, email, name, avatarUrl }`.

### Escenario 5: Cierre de sesión de usuario
- **Dado** un usuario con sesión iniciada en el dashboard
- **Cuando** el usuario presiona el botón "Cerrar sesión"
- **Entonces** el cliente debe enviar una petición POST a `/api/auth/logout`
- **Y** el servidor debe responder con HTTP 200 OK sobreescribiendo la cookie `fetchmark_session` con fecha de expiración pasada (`Max-Age=0`)
- **Y** el cliente Angular debe borrar el estado local del usuario y redirigir a `/login`.
