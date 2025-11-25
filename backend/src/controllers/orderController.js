const z = require('zod');
const orderService = require('../services/orderService');

// Schema de Validação
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number({ required_error: "ID do produto é obrigatório" }).int().positive(),
    quantity: z.number({ required_error: "Quantidade é obrigatória" }).int().positive()
  })).min(1, "O pedido deve ter pelo menos um item")
});

class OrderController {
  //criar ordem
  async store(req, res) {
    try {
      // Validação Zod
      const { items } = createOrderSchema.parse(req.body);

      // Chama Service
      const result = await orderService.createOrder({ items });

      // Sucesso
      return res.status(201).json(result);

    } catch (error) {      
      // Erro de Validação (Zod)
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }

      // Mapeamento de Erros de Negócio
      const errorMap = {
        'PRODUCT_NOT_FOUND': { status: 404, msg: 'Produto não encontrado' },
        'INSUFFICIENT_STOCK': { status: 400, msg: 'Estoque insuficiente' },
        'CONCURRENCY_CONFLICT': { status: 409, msg: 'Conflito de estoque. Tente novamente.' }
      };

      const mappedError = errorMap[error.message];
      
      if (mappedError) {
        return res.status(mappedError.status).json({ error: mappedError.msg });
      }

      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // GET /orders
  async index(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const { data, total } = await orderService.findAll({ page, limit });
      
      return res.json({
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao buscar histórico.' });
    }
  }
}

module.exports = new OrderController();