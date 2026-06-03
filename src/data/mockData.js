export const usuarioMock = {
  id: 1,
  nombre: "Mariela Nolasco",
  email: "mariela@email.com",
  password: "123456",
  telefono: "+56 9 1234 5678",
};

export const usersMock = [
  {
    id: 1,
    nombre: "Mariela Nolasco",
    email: "mariela@email.com",
    password: "123456",
    telefono: "+56 9 1234 5678",
  },
  {
    id: 2,
    nombre: "Carlos Pérez",
    email: "carlos@email.com",
    password: "123456",
    telefono: "+56 9 9876 5432",
  },
  {
    id: 3,
    nombre: "Ana Torres",
    email: "ana@email.com",
    password: "123456",
    telefono: "+56 9 1111 2222",
  },
];

export const categoriasMock = [
  "Tecnología",
  "Ropa",
  "Hogar",
  "Deportes",
  "Libros",
  "Manualidades",
  "Otro",
];

export const publicacionesMock = [
  {
    id: 1,
    usuarioId: 2,
    titulo: "Notebook Lenovo",
    descripcion:
      "Notebook usado en buen estado, ideal para estudio o trabajo. Incluye cargador y batería funcional.",
    precio: 250000,
    imagen: "",
    ubicacion: "Santiago Centro",
    categoria: "Tecnología",
    vendedor: "Carlos Pérez",
    fecha: "08/05/2026",
    estado: "Activa",
  },
  {
    id: 2,
    usuarioId: 1,
    titulo: "Bicicleta aro 29",
    descripcion: "Bicicleta aro 29 en buen estado.",
    precio: 180000,
    imagen: "",
    ubicacion: "Maipú",
    categoria: "Deportes",
    vendedor: "Mariela Nolasco",
    fecha: "08/05/2026",
    estado: "Activa",
  },
  {
    id: 3,
    usuarioId: 1,
    titulo: "Sillón gris",
    descripcion: "Sillón cómodo para living.",
    precio: 90000,
    imagen: "",
    ubicacion: "Ñuñoa",
    categoria: "Hogar",
    vendedor: "Mariela Nolasco",
    fecha: "08/05/2026",
    estado: "Pausada",
  },
  {
    id: 4,
    usuarioId: 3,
    titulo: "Chaqueta invierno",
    descripcion: "Chaqueta de invierno en buen estado.",
    precio: 35000,
    imagen: "",
    ubicacion: "Providencia",
    categoria: "Ropa",
    vendedor: "Ana Torres",
    fecha: "08/05/2026",
    estado: "Activa",
  },
];