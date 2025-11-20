// src/services/orderService.js
const db = require('../database/connection');

class OrderService {
  async createOrder({ productId, quantity }) {
    // Inicia a transação e retorna o resultado dela
    return await db.transaction(async (trx) => {
      
      // Busca Produto
      const product = await trx('products').where({ id: productId }).first();

      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      // Valida Estoque (Regra de Negócio)
      if (product.stock < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      // Atualiza com Lock Otimista
      const rowsAffected = await trx('products')
        .where({ 
          id: productId, 
          version: product.version 
        })
        .update({
          stock: product.stock - quantity,
          version: product.version + 1
        });

      if (rowsAffected === 0) {
        throw new Error('CONCURRENCY_CONFLICT');
      }

      // Cria Pedido
      const [order] = await trx('orders')
        .insert({
          product_id: productId,
          quantity
        })
        .returning(['id', 'product_id', 'quantity', 'created_at']); // Postgres suporta returning

      // Retorna objeto puro
      return {
        order,
        stockRemaining: product.stock - quantity
      };
    });
  }
}

module.exports = new OrderService();