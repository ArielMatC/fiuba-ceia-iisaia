# Conversacion de diseño OpenAPI

**Usuario**

```text
Planeemos el diseño de una API REST para trámites de un municipio.
Solo armamos el openapi.yaml en esta sesión, siguiendo el estandar OpenAPI. NO entra: implementación, base de datos, auth, deploy.

## Objetivo: el usuario debe poder:
	- crear un nuevo trámite y subirlo (POST)
	- ver el estado de su trámite (GET)
	- debe poder eliminar su trámite (DELETE)
	- debe poder actualizar algun campo de su trámite (PUT)
	- tambien deben poder manejarse los usuarios (crear nuevo, obtener uno, eliminar uno, actualizarlo)

## Recursos principales:
	- usuario (ID, tax_id, first_name, last_name)
	- area municipal (ID, name)
	- tramite (ID, area_municipal_id, user_tax_id, description)

## Condiciones
	- usemos las entidades/recursos en ingles
	- Jerarquia de recursos: Area municipal -> tramites -> usuario
	- una misma area puede tener multiples tramites
	- un mismo tramite puede tener multiples usuarios
	- un usuario puede estar en multiples tramites
	- manejo de errores minimo:
		- 404 - not found un recurso
		- 405 - method not allowed
	- schemas tipados: type, required, format donde aplique
```

**Asistente**

```text
Se creo un archivo openapi.yaml con un contrato OpenAPI 3.0.3 para la API de tramites municipales.

Decisiones principales:
- recursos en ingles: municipal-areas, procedures, users;
- jerarquia: municipal-area -> procedures -> users;
- operaciones CRUD solicitadas para tramites y usuarios;
- schema Procedure con status para consultar el estado;
- schemas tipados con type, required, format uuid y minProperties en PUT;
- respuestas minimas 404 y 405.

Verificacion local realizada:
- 4 paths;
- 8 operaciones;
- 2 schemas de actualizacion con minProperties.
```

**Usuario**

```text
perfecto, ahora agreguemos un endpoint mas de `/payment` al final de /municipal-areas/{municipalAreaId}/procedures/{procedureId}/users/{userId} para verificar el estado del pago de un tramite (solo admite GET)
```

**Asistente**

```text
Se agrego el endpoint:

GET /municipal-areas/{municipalAreaId}/procedures/{procedureId}/users/{userId}/payment

Tambien se agregaron:
- tag Payments;
- schema Payment;
- enum PaymentStatus;
- respuestas 200, 404 y 405.

Verificacion local realizada:
- 5 paths;
- 9 operaciones;
- payment solo admite GET.
```

**Usuario**

```text
copia el openapi.yaml dentro de "D:\ariel_D\UBA\IISAIA\fiuba-ceia-iisaia\tp-openapi\"
```

**Asistente**

```text
Se copio openapi.yaml en:

D:\ariel_D\UBA\IISAIA\fiuba-ceia-iisaia\tp-openapi\openapi.yaml
```

**Usuario**

```text
ahi mismo crea un REAMDE.md que explique de qué va la API y su uso
```

**Asistente**

```text
Se creo README.md en:

D:\ariel_D\UBA\IISAIA\fiuba-ceia-iisaia\tp-openapi\README.md

Se asumio que REAMDE.md era un typo y se uso el nombre estandar README.md.

Contenido incluido:
- descripcion de la API;
- recursos principales;
- jerarquia;
- endpoints;
- ejemplos de payload;
- errores contemplados.
```

**Usuario**

```text
ahora exporta toda nuestra conversacion a la misma carpeta, a un 'prompts.md'
```

**Asistente**

```text
Se creo este archivo prompts.md en la misma carpeta del TP para dejar registro de la conversacion y de las decisiones tomadas durante la sesion.
```

