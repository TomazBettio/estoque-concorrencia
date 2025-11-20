// src/services/productService.js
const db = require('../database/connection');

class ProductService {
  
  async findAll() {
    // SELECT * FROM products
    return await db('products').select('*').orderBy('id', 'asc');
  }

  // Busca um produto específico pelo ID
  async findById(id) {
    return await db('products').where({ id }).first();
  }

  async update(id, data) {
    // se alguém estiver comprando AGORA, a compra falhe
    const [updatedProduct] = await db('products')
      .where({ id })
      .update({
        ...data,
        version: db.raw('version + 1') // Incremento atômico via SQL
      })
      .returning('*'); // Postgres retorna o objeto atualizado

    return updatedProduct;
  }

  async delete(id) {
    // Retorna o número de linhas deletadas
    return await db('products').where({ id }).del();
  }

  async create({ name, stock }) {
    const [newProduct] = await db('products')
      .insert({
        name,
        stock,
        version: 1 // Inicializa o Lock Otimista
      })
      .returning('*'); // PostgreSQL: retorna o objeto criado

    return newProduct;
  }
}

module.exports = new ProductService();