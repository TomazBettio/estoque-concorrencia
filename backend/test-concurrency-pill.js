const axios = require('axios');

// CONFIGURAÇÃO
const URL = 'http://localhost:3000/orders';
const PRODUCT_ID = 1; // Ajuste conforme seu banco (ex: ID do produto com 50 itens)
const QUANTITY = 1;
const TOTAL_REQUESTS = 100; // Disparos simultâneos

// Função que tenta comprar e insiste se der erro de concorrência (409)
async function buyWithRetry(index) {
  const maxRetries = 10; // Tenta até 10 vezes por cliente simulado
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      attempts++;
      // Tenta comprar
      const response = await axios.post(URL, {
        items: [{
            productId: PRODUCT_ID,
            quantity: QUANTITY
        }]
      });
      return { status: response.status, attempts, index }; // Sucesso (201)
    
    } catch (error) {
      const status = error.response ? error.response.status : 500;
      
      if (status === 409) {
        // Espera um tempo aleatório (backoff) entre 50ms e 200ms para não colidir de novo
        const waitTime = Math.floor(Math.random() * 150) + 50;
        await new Promise(r => setTimeout(r, waitTime));
        continue; // Volta para o início do while
      }

      // Se for erro de estoque (400) ou outro, desiste
      return { status: status, attempts, index, error: error.response?.data };
    }
  }
  return { status: 'TIMEOUT_RETRY', attempts, index };
}

async function runTest() {
  console.log(`🚀 Iniciando Ataque com Retry: ${TOTAL_REQUESTS} clientes tentando comprar...`);

  // Cria o array de promessas (clientes virtuais)
  const promises = Array.from({ length: TOTAL_REQUESTS }).map((_, index) => 
    buyWithRetry(index + 1)
  );

  // Dispara tudo
  const results = await Promise.all(promises);

  // Analisa resultados
  let success = 0;
  let soldOut = 0;
  let retried = 0;

  results.forEach(r => {
    if (r.status === 201) success++;
    if (r.status === 400) soldOut++; // Erro de estoque insuficiente (esperado no final)
    if (r.attempts > 1) retried++;
  });

  console.log('\n--- RESULTADO ---');
  console.log(`Compras com Sucesso: ${success}`);
  console.log(`Barrados por Estoque Zero: ${soldOut}`);
  console.log(`Precisaram de Retentativa: ${retried} clientes`);

  // Verificação Final
  try {
    const { data: products } = await axios.get('http://localhost:3000/products');
    const product = products.find(p => p.id === PRODUCT_ID);
    console.log(`\nEstoque Final no Banco: ${product.stock}`);
    
    if (product.stock === 0 && success === 50) { // Assumindo que começou com 50
        console.log('SUCESSO: Todo o estoque foi vendido corretamente!');
    } else if (product.stock > 0) {
        console.log('Ainda sobrou estoque. Aumente o número de retries.');
    }
  } catch (e) { console.error(e); }
}

runTest();