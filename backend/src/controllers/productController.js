const z = require('zod');
const productService = require('../services/productService');

// Schema para validar o ID que vem na URL (req.params)
const getProductSchema = z.object({
  id: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val) && val > 0, {
    message: "O ID do produto deve ser um número positivo."
  })
});

class ProductController {
  // GET /products
  async index(req, res) {
    try {
      const products = await productService.findAll();
      return res.json(products);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar produtos.' });
    }
  }

  // GET /products/:id
  async show(req, res) {
    try {
      // Validação do ID com Zod
      // O safeParse não lança erro (throw), ele retorna um objeto com .success
      const validation = getProductSchema.safeParse(req.params);

      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
      }

      const { id } = validation.data;

      // Busca no Service
      const product = await productService.findById(id);

      // ratamento de 404 (Not Found)
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      return res.json(product);

    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new ProductController();