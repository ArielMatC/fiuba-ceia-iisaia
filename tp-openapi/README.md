# Municipal Procedures API

API REST para gestionar tramites municipales. El contrato esta definido en
[`openapi.yaml`](./openapi.yaml) usando el estandar OpenAPI 3.0.3.

El alcance de este trabajo es solo el diseno del contrato de la API. No incluye
implementacion, base de datos, autenticacion ni deploy.

## Recursos principales

- `municipal-area`: area municipal donde se gestiona un tramite.
- `procedure`: tramite creado dentro de un area municipal.
- `user`: persona asociada a uno o mas tramites.
- `payment`: estado de pago de un tramite para un usuario asociado.

La jerarquia principal de recursos es:

```text
municipal-area -> procedure -> user -> payment
```

Esto permite representar que:

- una misma area municipal puede tener multiples tramites;
- un mismo tramite puede tener multiples usuarios;
- un usuario puede estar asociado a multiples tramites.

## Endpoints

### Tramites

Crear y subir un nuevo tramite:

```http
POST /municipal-areas/{municipalAreaId}/procedures
```

Consultar el estado y datos de un tramite:

```http
GET /municipal-areas/{municipalAreaId}/procedures/{procedureId}
```

Actualizar campos editables de un tramite:

```http
PUT /municipal-areas/{municipalAreaId}/procedures/{procedureId}
```

Eliminar un tramite:

```http
DELETE /municipal-areas/{municipalAreaId}/procedures/{procedureId}
```

### Usuarios

Crear un usuario asociado a un tramite:

```http
POST /municipal-areas/{municipalAreaId}/procedures/{procedureId}/users
```

Obtener un usuario asociado a un tramite:

```http
GET /municipal-areas/{municipalAreaId}/procedures/{procedureId}/users/{userId}
```

Actualizar un usuario asociado a un tramite:

```http
PUT /municipal-areas/{municipalAreaId}/procedures/{procedureId}/users/{userId}
```

Eliminar la asociacion de un usuario con un tramite:

```http
DELETE /municipal-areas/{municipalAreaId}/procedures/{procedureId}/users/{userId}
```

### Pago

Verificar el estado de pago de un tramite para un usuario:

```http
GET /municipal-areas/{municipalAreaId}/procedures/{procedureId}/users/{userId}/payment
```

Este endpoint solo admite `GET`.

## Ejemplos de uso

Crear un tramite:

```json
{
  "user_tax_id": "20-12345678-9",
  "description": "Request for business operating permit."
}
```

Actualizar un tramite:

```json
{
  "description": "Updated procedure description."
}
```

Crear un usuario:

```json
{
  "tax_id": "20-12345678-9",
  "first_name": "Ariel",
  "last_name": "Cabello"
}
```

Respuesta de estado de pago:

```json
{
  "procedure_id": "ad97ac25-e581-4a66-9c2d-0ce691d12f61",
  "user_id": "00d46e6f-9a1c-4f8e-8a21-ea1747fb01ae",
  "status": "pending"
}
```

## Errores contemplados

La API define un manejo minimo de errores:

- `404 Not Found`: el recurso solicitado no existe.
- `405 Method Not Allowed`: el metodo HTTP no esta permitido para el recurso.

Las respuestas de error usan el schema comun `Error`:

```json
{
  "code": "not_found",
  "message": "The requested resource was not found."
}
```

