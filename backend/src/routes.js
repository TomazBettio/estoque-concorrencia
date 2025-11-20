
const express = require('express');
const routes = express.Router();

// Importação dos Controllers
const orderController = require('./controllers/orderController');
const productController = require('./controllers/productController');

// Rotas de Produtos
routes.get('/products', productController.index);
routes.get('/products/:id', productController.show);
routes.put('/products/:id', productController.update); 
routes.delete('/products/:id', productController.delete);
routes.post('/products', productController.create);

// Rotas de Pedidos
routes.post('/orders', orderController.store);
routes.get('/orders', orderController.index);

// Rota de Health Check
routes.get('/', (req, res) => {
  res.json({ status: 'API Online' });
});

module.exports = routes;