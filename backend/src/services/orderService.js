// src/services/orderService.js
const db = require('../database/connection');

class OrderService {
  //criar ordem
  async createOrder({ items }) {
    // Inicia a transação e retorna o resultado dela
    return await db.transaction(async (trx) => {
      
      // Cria o Pedido (Header)
      const [order] = await trx('orders')
        .insert({
          status: 'completed',
          total: 0 
        })
        .returning(['id', 'created_at', 'status']);

      const orderItems = [];

      for (const item of items) {
        const { productId, quantity } = item;

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

        // Adiciona Item
        const [orderItem] = await trx('order_items')
          .insert({
            order_id: order.id,
            product_id: productId,
            quantity
          })
          .returning('*');
        
        orderItems.push(orderItem);
      }

      return {
        order,
        items: orderItems
      };
    });
  }

  // LISTAR PEDIDOS (COM DADOS DO PRODUTO)
  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;

    const [countResult] = await db('orders').count('id as total');
    const total = parseInt(countResult.total || 0, 10);

    const data = await db('orders')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Fetch items for these orders
    const orderIds = data.map(o => o.id);
    let items = [];
    
    if (orderIds.length > 0) {
        items = await db('order_items')
            .whereIn('order_id', orderIds)
            .join('products', 'order_items.product_id', '=', 'products.id')
            .select('order_items.*', 'products.name as product_name');
    }

    // Attach items to orders
    const dataWithItems = data.map(order => {
        return {
            ...order,
            items: items.filter(i => i.order_id === order.id)
        };
    });

    return { data: dataWithItems, total };
  }
}

module.exports = new OrderService();