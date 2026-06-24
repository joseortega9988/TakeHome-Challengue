# Home Challenge Nest API

## Descripción general
Este proyecto es una API construida con NestJS que incluye tres módulos principales:
- `Auth`: controla el registro, login, refresh token y logout.
- `Notifications`: crea, edita, borra y lista notificaciones del usuario autenticado.
- `Prisma`: sirve como capa de acceso a la base de datos PostgreSQL.

Cada módulo tiene su propia carpeta de `dto` para definir los datos de entrada y salida de forma ordenada.

## Tecnologías principales
- **Node**(V 26): 
- **NestJS**(V 11): framework para construir APIs con arquitectura modular.
- **Swagger**: documenta los endpoints en `http://localhost:3001/api/docs`.
- **Prisma**: ORM para PostgreSQL, con el esquema en `prisma/schema.prisma`.
- **Passport**: middleware de autenticación.
- **JWT / JWS**: tokens firmados para mantener sesiones seguras.
- **bcrypt**: encripta y verifica contraseñas.

## IMPORTANTE
CAMBIAR LA CLAVE DE POSTGRESS EN EL ARCHIVO docker-compeso.yml a la que este configurada en la computadora 

## Pre-requisitos: 

   - Docker intalado without SUDO Permisions 
   - Docker compose installed without  SUDO
   - Ports free: 3000 and 5432
 
## Cómo iniciar el proyecto

1. correr este comando en la terminal de GIT BASH : 

   ```
   docker-compose up f
   ```

2. Abrir la documentación Swagger:
   ```
   http://localhost:3001/api/docs
   ```

## How to run the tests:

correr este comando en la terminal de GIT BASH

para correr la app en docker, correr estos dos comandos en la terminal de git BASH

chmod 711 up_dev.sh
./up_dev.sh

para correr los tests E2E correr estos comandos en la terminal de git BASH

chmod 711 up_test.sh
./up_test.sh

## Areas to improve 

- Data Should be moved from tests to an external files 
- Generic method should be use to mock endpoints 
- Error handling could be improved 
- a seed migration would be usufull to have a working data 
- Deployment

## Already existing errors 

## Decisions made 
- Clean Architecture: to be able to handle futher changes in the future in a proper way 
- Prisma ORM: 
- Docker : to make it protable 
- Jest / TypeScript / E2E : Jest us the most used testing framework of JS. 
E2E testing was done because it  useless to always test every single part. 
That's why if the controller provide the proper answer the test has passed.
 
## Base de datos
- La base de datos está definida en `prisma/schema.prisma`.
- Corre en Docker y se administra con Prisma.
- La carpeta `prisma` contiene el modelo de datos y migraciones.

## Flujo de autenticación
1. Registrarse o iniciar sesión en la API Swagger:  http://localhost:3001/api/docs (jagger)
2. La API devuelve un **access token** y un **refresh token** cuando inicias sesión o creas una cuenta
3. Para poder crear una notificación, se debe poner  el **access token** en authorize:

4. Si el access token expira, usar el refresh token en `POST /api/v1/auth/refresh` o en la api de swagger para obtener uno nuevo.

> Nota: las notificaciones se envían con el access token. El refresh token sirve para renovar la sesión.

## Módulo Auth
- Valida correo y contraseña.
- Hashea contraseñas con `bcrypt`.
- Genera JWT firmados con `JWT_SECRET`.
- Protege rutas con `JwtAuthGuard`.
- Permite refrescar el access token con el refresh token.

## Módulo Notifications
- Permite crear una notificación con:
  - `title`
  - `content`
  - `channel` (`EMAIL`, `SMS`, `PUSH`)
- Permite modificar una notificación existente.
- Permite eliminar una notificación.
- Permite listar todas las notificaciones propias del usuario.
- Cada notificación creada ejecuta una simulación de envío por canal:
  - Email: valida destinatario, genera template y registra el envío.
  - SMS: limita el contenido a 160 caracteres y registra número/fecha.
  - Push: valida token de dispositivo, formatea payload y registra el estado.
- La lógica de envío está preparada para agregar nuevos canales sin cambiar el flujo principal.

## Estructura del proyecto
- `src/modules/auth`: login, registro y JWT.
- `src/modules/notifications`: lógica de notificaciones y canales.
- `src/prisma`: servicio Prisma y configuración de DB.
- `src/common`: decoradores y guards compartidos.

## Endpoints principales
#### Auth 
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/notifications`

#### client 

- `GET /api/v1/notifications`
#### notifications
notifications
- `PATCH /api/v1/notifications/:id`

- `DELETE /api/v1/notifications/:id`

## Recomendaciones
1. Levantar Docker y migraciones.
2. Iniciar la API con `npm run dev`.
3. Hacer login para obtener el access token.
4. Usar `Authorization: Bearer <ACCESS_TOKEN>` O COPIAR EL ACCESS TOKEN Y AUTHORIZAR EN SWAGER para crear notificaciones.
5. Si el token expira, usar `POST /api/v1/auth/refresh` con el refresh token.


