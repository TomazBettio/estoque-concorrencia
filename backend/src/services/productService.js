// src/services/productService.js
const db = require('../database/connection');

class ProductService {
  // Lista todos os produtos
  async findAll() {
    // SELECT * FROM products
    return await db('products').select('*').orderBy('id', 'asc');
  }

  // Busca um produto específico pelo ID
  async findById(id) {
    // SELECT * FROM products WHERE id = ? LIMIT 1
    const product = await db('products').where({ id }).first();
    return product;
  }
}

module.exports = new ProductService();