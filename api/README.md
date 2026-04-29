# API REST base

Esta carpeta contiene una API REST en Node.js + Express + MongoDB para:

- `auth`: alta de usuarios, autenticacion y CRUD de usuarios.
- `items`: CRUD completo de items de marketing.

## Requisitos

- Node.js 18+
- MongoDB disponible local o remoto

## Instalacion

```bash
cd api
npm install
```

## Configuracion

1. Copia `.env.example` a `.env`
2. Ajusta `MONGODB_URI` y `JWT_SECRET`

## Ejecutar

```bash
npm run dev
```

La API quedara disponible en `http://localhost:4000`.

## Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/users`
- `GET /api/auth/users/:id`
- `PUT /api/auth/users/:id`
- `DELETE /api/auth/users/:id`

### Items

- `POST /api/items`
- `GET /api/items`
- `GET /api/items/:id`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`

## Estructura del item

```json
{
  "titulo": "Campana Meta Ads",
  "categoria": "publicidad",
  "estado": "activa",
  "fecha": "2026-04-28",
  "hora": "15:30",
  "precio": 125000,
  "need_stand": true,
  "cans_amount": 48,
  "cans_cost": 36000,
  "telefono": "+56912345678",
  "correo": "contacto@empresa.cl",
  "obs": "Segmentacion RM",
  "latitud": -33.4489,
  "longitud": -70.6693
}
```
