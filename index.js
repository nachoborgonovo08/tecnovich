const express = require('express');
const app = express();
app.use(express.json());

// 'BASE DE DATOS'
const productos = [
  { id: 1, nombre: 'Mochila',     precio: 5000,  disponible: true  },
  { id: 2, nombre: 'Auriculares', precio: 12000, disponible: true  },
  { id: 3, nombre: 'Teclado',     precio: 8500,  disponible: false },
];

let nextId = 4;

// Paso 1 — GET todos los productos (con desafío extra: filtro por disponible)
app.get('/productos', (req, res) => {
  if (req.query.disponible !== undefined) {
    const disponible = req.query.disponible === 'true';
    const filtrados = productos.filter(p => p.disponible === disponible);
    return res.json(filtrados);
  }
  res.json(productos);
});

// Paso 2 — GET un producto por ID
app.get('/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(producto);
});

// Paso 3 — POST crear un producto
app.post('/productos', (req, res) => {
  const { nombre, precio, disponible } = req.body;

  const nuevoProducto = {
    id: nextId,
    nombre,
    precio,
    disponible
  };

  productos.push(nuevoProducto);
  nextId++;

  res.status(201).json(nuevoProducto);
});

// Paso 4 — DELETE eliminar un producto
app.delete('/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = productos.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  productos.splice(indice, 1);

  res.json({ mensaje: 'Producto eliminado' });
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
