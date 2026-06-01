const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../server');
const db = require('../db/config');

const unique = Date.now();
const comprador = {
  nombre: 'Usuario Test Comprador',
  email: `comprador_${unique}@test.com`,
  password: '123456',
  telefono: '+56 9 1111 1111',
};

const vendedor = {
  nombre: 'Usuario Test Vendedor',
  email: `vendedor_${unique}@test.com`,
  password: '123456',
  telefono: '+56 9 2222 2222',
};

let compradorToken = '';
let vendedorToken = '';
let publicacionId = null;

beforeAll(async () => {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await db.query(schema);
});

afterAll(async () => {
  await db.query('DELETE FROM usuarios WHERE email IN ($1, $2)', [
    comprador.email,
    vendedor.email,
  ]);
  await db.pool.end();
});

describe('API REST Marketplace Hito 3', () => {
  test('POST /api/usuarios registra un usuario y responde 201', async () => {
    const response = await request(app).post('/api/usuarios').send(comprador);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(comprador.email);
  });

  test('POST /api/login inicia sesión y responde 200 con token', async () => {
    await request(app).post('/api/usuarios').send(vendedor);

    const compradorLogin = await request(app).post('/api/login').send({
      email: comprador.email,
      password: comprador.password,
    });

    const vendedorLogin = await request(app).post('/api/login').send({
      email: vendedor.email,
      password: vendedor.password,
    });

    expect(compradorLogin.statusCode).toBe(200);
    expect(compradorLogin.body).toHaveProperty('token');
    expect(compradorLogin.body).toHaveProperty('user');

    compradorToken = compradorLogin.body.token;
    vendedorToken = vendedorLogin.body.token;
  });

  test('GET /api/perfil sin token responde 401', async () => {
    const response = await request(app).get('/api/perfil');

    expect(response.statusCode).toBe(401);
  });

  test('POST /api/publicaciones crea publicación privada y responde 201', async () => {
    const response = await request(app)
      .post('/api/publicaciones')
      .set('Authorization', `Bearer ${vendedorToken}`)
      .send({
        titulo: 'Notebook Test',
        descripcion: 'Notebook usado para prueba automática',
        precio: 250000,
        imagen: 'notebook-test.jpg',
        ubicacion: 'Santiago',
        categoria_id: 1,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('publicacion_id');

    publicacionId = response.body.publicacion_id;
  });

  test('GET /api/publicaciones lista publicaciones y responde 200', async () => {
    const response = await request(app).get('/api/publicaciones');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/favoritos/:publicacion_id agrega favorito y responde 201', async () => {
    const response = await request(app)
      .post(`/api/favoritos/${publicacionId}`)
      .set('Authorization', `Bearer ${compradorToken}`);

    expect(response.statusCode).toBe(201);
  });

  test('POST /api/mensajes envía mensaje y responde 201', async () => {
    const response = await request(app)
      .post('/api/mensajes')
      .set('Authorization', `Bearer ${compradorToken}`)
      .send({
        publicacion_id: publicacionId,
        mensaje: 'Hola, ¿sigue disponible?',
      });

    expect(response.statusCode).toBe(201);
  });
});
