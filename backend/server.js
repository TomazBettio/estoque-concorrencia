require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Configuração do Banco de Dados (Knex + SQLite)
// Importa o arquivo knexfile.js
const knexConfig = require('./knexfile'); 
// Inicializa o Knex usando o ambiente de 'development'
const db = require('knex')(knexConfig.development);

// Inicializa App Express
const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
// CORS: Permite que o seu Front converse com Back
app.use(cors()); 
// JSON: Permite que a API entenda quando envia dados no formato JSON
app.use(express.json()); 

// ROTAS ---

// Rota de teste (Health Check) para ver se está tudo rodando
app.get('/', (req, res) => {
  res.json({ message: 'API OK' });
});

// Rota Listar Produtos
app.get('/products', async (req, res) => {
  try {
    const products = await db('products').select('*');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Rota de criacao de pedidos (POST /orders)
// Requisito: Validar estoque, garantir atomicidade e concorrência
app.post('/orders', async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Produto e quantidade válida são obrigatórios.' });
  }

  try {
    // O 'trx' garante que tudo aqui dentro seja atômico: ou faz tudo, ou não faz nada.
    await db.transaction(async (trx) => {
      
      // produto e sua VERSÃO atual
      const product = await trx('products')
        .where({ id: productId })
        .first();

      // Validações de Negócio
      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
      }
      
      // Requisito: Rejeitar pedidos com quantidade maior que o estoque
      if (product.stock < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      // TENTATIVA DE ATUALIZAÇÃO
      // diminuir o estoque APENAS SE a versão no banco ainda for a mesma que acima.
      const rowsAffected = await trx('products')
        .where({ 
          id: productId, 
          version: product.version // lock
        })
        .update({
          stock: product.stock - quantity,
          version: product.version + 1 // Incrementa a versão
        });

      // Verificação de Concorrência
      // Se rowsAffected for 0, significa que alguém mudou a versão (comprou) milissegundos antes.
      if (rowsAffected === 0) {
        throw new Error('CONCURRENCY_CONFLICT');
      }

      // Registrar o Pedido
      // Só chega aqui se o update acima funcionou.
      const [orderId] = await trx('orders').insert({
        product_id: productId,
        quantity: quantity
      });

      // Retorno de Sucesso
      res.status(201).json({
        id: orderId,
        productId: productId,
        quantityDebit: quantity,
        stockRemaining: product.stock - quantity,
        message: 'Pedido processado com sucesso.'
      });
    });

  } catch (error) {
    
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    
    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ error: 'Estoque insuficiente para esta compra.' });
    }

    if (error.message === 'CONCURRENCY_CONFLICT') {
      return res.status(409).json({ 
        error: 'O estoque mudou durante sua compra. Tente novamente. (concorrência)' 
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});