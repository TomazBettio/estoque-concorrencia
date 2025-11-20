const z = require('zod');
const productService = require('../services/productService');

// Validação de ID (Reutilizável)
const idParamSchema = z.object({
  id: z.string().transform(Number).refine((n) => n > 0, "ID inválido")
});

// Schema de Update (Permite atualização parcial)
const updateProductSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  stock: z.number().int().min(0, "Estoque não pode ser negativo").optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "Informe pelo menos um campo para atualizar (name ou stock)"
});

// Schema de Criação (POST)
const createProductSchema = z.object({
  name: z.string({ required_error: "Nome é obrigatório" })
         .min(3, "Nome deve ter no mínimo 3 caracteres"),
  stock: z.number({ required_error: "Estoque é obrigatório" })
          .int("Estoque deve ser inteiro")
          .min(0, "Estoque inicial não pode ser negativo")
});

class ProductController {
  
  // GET /products
  async index(req, res) {
    try {
      const products = await productService.findAll();
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno.' });
    }
  }

  // GET /products/:id
  async show(req, res) {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) return res.status(400).json({ errors: validation.error.format() });

    try {
      const product = await productService.findById(validation.data.id);
      if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
      
      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno.' });
    }
  }

  // PUT /products/:id
  async update(req, res) {
    // Valida ID
    const idValidation = idParamSchema.safeParse(req.params);
    if (!idValidation.success) return res.status(400).json({ errors: idValidation.error.format() });

    // Valida Body (Dados a atualizar)
    const bodyValidation = updateProductSchema.safeParse(req.body);
    if (!bodyValidation.success) return res.status(400).json({ errors: bodyValidation.error.format() });

    try {
      const updatedProduct = await productService.update(idValidation.data.id, bodyValidation.data);

      if (!updatedProduct) {
        return res.status(404).json({ error: 'Produto não encontrado para atualização.' });
      }

      return res.json(updatedProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
  }

  // DELETE /products/:id
  async delete(req, res) {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) return res.status(400).json({ errors: validation.error.format() });

    try {
      const rowsDeleted = await productService.delete(validation.data.id);

      if (rowsDeleted === 0) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      return res.status(204).send(); // 204 No Content

    } catch (error) {
      // Tratamento de Erro de Chave Estrangeira
      if (error.code === '23503') {
        return res.status(409).json({ 
          error: 'Não é possível excluir este produto pois existem pedidos vinculados a ele.' 
        });
      }
      
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao excluir.' });
    }
  }

  // POST /products
  async create(req, res) {
    try {
      // Validação Zod
      const validation = createProductSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
      }

      const { name, stock } = validation.data;

      // Chamada ao Service
      const newProduct = await productService.create({ name, stock });

      // Retorno 201 (Created)
      return res.status(201).json(newProduct);

    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return res.status(500).json({ error: 'Erro interno ao criar produto.' });
    }
  }
}

module.exports = new ProductController();