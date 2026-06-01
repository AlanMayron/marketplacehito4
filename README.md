# Marketplace Local - Hito 4 Integración y Despliegue

Proyecto Marketplace preparado para el Hito 4: frontend React/Vite, backend Express y base de datos PostgreSQL online.

## Tecnologías

- React + Vite
- React Router
- Context API
- Node.js + Express
- PostgreSQL + pg
- JWT
- CORS
- Netlify para frontend
- Render para backend y base de datos

## Estructura

```txt
marketplacehito4_listo/
├── backend/
│   ├── controllers/
│   ├── db/
│   │   ├── config.js
│   │   └── schema.sql
│   ├── middlewares/
│   ├── routes/
│   ├── tests/
│   ├── index.js
│   └── server.js
├── public/
│   └── _redirects
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   └── services/api.js
├── .env.example
├── netlify.toml
└── package.json
```

## Ejecutar localmente

### 1. Backend

```bash
cd backend
npm install
```

Crear base local `marketplace` y ejecutar:

```bash
psql -U postgres -d marketplace -f db/schema.sql
```

Crear archivo `.env` desde `.env.example` y levantar:

```bash
npm run dev
```

Probar:

```txt
http://localhost:3000/api/health
```

### 2. Frontend

En la raíz del proyecto:

```bash
npm install
npm run dev
```

Crear `.env` en la raíz:

```env
VITE_API_URL=http://localhost:3000/api
```

## Deploy Hito 4

### Base de datos en Render

1. Crear PostgreSQL en Render.
2. Copiar la External Database URL.
3. Ejecutar `backend/db/schema.sql` en la base online desde DBeaver o psql.

### Backend en Render

Crear Web Service con:

```txt
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Variables de entorno:

```env
DATABASE_URL=URL_INTERNA_DE_POSTGRES_RENDER
JWT_SECRET=una_clave_segura_larga
JWT_EXPIRES_IN=2h
NODE_ENV=production
FRONTEND_URL=https://tu-sitio.netlify.app
```

Probar:

```txt
https://tu-backend.onrender.com/api/health
```

### Frontend en Netlify

Crear sitio desde GitHub con:

```txt
Build command: npm run build
Publish directory: dist
```

Variable de entorno:

```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

El archivo `public/_redirects` ya está incluido para evitar 404 al recargar rutas internas.

## Pruebas finales de entrega

Desde Netlify probar:

1. Registrar usuario.
2. Iniciar sesión.
3. Crear publicación.
4. Recargar la página y confirmar que la publicación sigue visible.
5. Agregar favorito.
6. Enviar mensaje a una publicación de otro usuario.
7. Revisar en PostgreSQL online que los datos fueron guardados.

## Requerimientos Hito 4 cubiertos

1. Deploy de aplicación cliente: Netlify.
2. Deploy de backend: Render Web Service.
3. Deploy de base de datos: Render PostgreSQL.
4. Integración cliente-backend en producción usando `VITE_API_URL` y CORS con `FRONTEND_URL`.
