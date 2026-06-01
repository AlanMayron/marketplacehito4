const express = require('express');
const cors = require('cors');

const usuariosRoutes = require('./routes/usuarios.routes');
const authRoutes = require('./routes/auth.routes');
const publicacionesRoutes = require('./routes/publicaciones.routes');
const perfilRoutes = require('./routes/perfil.routes');
const favoritosRoutes = require('./routes/favoritos.routes');
const mensajesRoutes = require('./routes/mensajes.routes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('No permitido por CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ ok: true, message: 'API Marketplace funcionando' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'API Marketplace funcionando' });
});

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/login', authRoutes);
app.use('/api/publicaciones', publicacionesRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/mensajes', mensajesRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = app;
