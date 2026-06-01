const jwt = require('jsonwebtoken');

const validarToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Token no enviado' });
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Formato de token inválido' });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'marketplace_hito3_secret'
    );

    req.user = {
      id: payload.id,
      email: payload.email,
      nombre: payload.nombre,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = validarToken;
