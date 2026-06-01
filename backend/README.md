# Backend Hito 4 - Marketplace

API REST para el Marketplace usando Node.js, Express, PostgreSQL, JWT, CORS y Supertest.

## Variables de entorno

Copiar `.env.example` a `.env` para ambiente local.

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/marketplace
JWT_SECRET=marketplace_hito4_secret_cambiar_en_render
JWT_EXPIRES_IN=2h
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

En Render usar `NODE_ENV=production`, `DATABASE_URL` de PostgreSQL Render y `FRONTEND_URL` con la URL de Netlify.

## Scripts

```bash
npm install
npm run dev
npm start
npm test
```

## Endpoints principales

- `GET /api/health`
- `POST /api/usuarios`
- `POST /api/login`
- `GET /api/publicaciones`
- `GET /api/publicaciones/:id`
- `POST /api/publicaciones`
- `PUT /api/publicaciones/:id`
- `DELETE /api/publicaciones/:id`
- `GET /api/favoritos`
- `POST /api/favoritos/:publicacion_id`
- `DELETE /api/favoritos/:publicacion_id`
- `GET /api/mensajes`
- `POST /api/mensajes`
- `POST /api/mensajes/:id/respuestas`
- `GET /api/perfil`
- `PUT /api/perfil`
