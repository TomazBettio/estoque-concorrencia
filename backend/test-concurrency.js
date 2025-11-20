const axios = require('axios');

// CONFIGURAÇÃO
const URL = 'http://localhost:3000/orders';
const PRODUCT_ID = 1; // Aquele notebook que tem 5 no estoque
const QUANTITY = 1;   // Cada requisição tenta comprar 1
const TOTAL_REQUESTS = 20; // Vamos disparar 20 cliques ao mesmo tempo

async function runTest() {
  console.log(`Iniciando Teste de Concorrência: ${TOTAL_REQUESTS} requisições simultâneas...`);
  console.log(`Produto Alvo: ID ${PRODUCT_ID} (Estoque esperado inicial: 5)\n`);

  // 1. Preparar as requisições (Promises)
  // Não usamos 'await' aqui dentro para garantir que saiam todas "juntas"
  const requests = Array.from({ length: TOTAL_REQUESTS }).map((_, index) => {
    return axios.post(URL, {
      productId: PRODUCT_ID,
      quantity: QUANTITY
    })
    .then(response => ({
      status: response.status,
      data: response.data,
      index: index + 1
    }))
    .catch(error => ({
      status: error.response ? error.response.status : 'ERRO_REDE',
      data: error.response ? error.response.data : error.message,
      index: index + 1
    }));
  });

  // Disparar todas e esperar terminarem
  const results = await Promise.all(requests);

  // Resultados
  let successCount = 0;
  let fail409Count = 0; // Conflito de Concorrência (Lock Otimista)
  let fail400Count = 0; // Estoque Insuficiente (Regra de Negócio)
  let otherErrors = 0;

  results.forEach(r => {
    if (r.status === 201) successCount++;
    else if (r.status === 409) fail409Count++;
    else if (r.status === 400) fail400Count++;
    else otherErrors++;
  });

  console.log('RESULTADO DO ATAQUE');
  console.log(`Sucessos (201): ${successCount}`);
  console.log(`Bloqueios por Concorrência (409): ${fail409Count}`);
  console.log(`Bloqueios por Estoque Zero (400): ${fail400Count}`);
  console.log(`Outros Erros: ${otherErrors}`);
  
  console.log('\nVERIFICAÇÃO FINAL');
  // Checar estoque final no banco
  try {
    const { data: products } = await axios.get('http://localhost:3000/products');
    const targetProduct = products.find(p => p.id === PRODUCT_ID);
    
    console.log(`Estoque Final no Banco: ${targetProduct.stock}`);
    
    if (targetProduct.stock < 0) {
      console.error('FALHA CRÍTICA: O estoque ficou negativo!');
    } else if (targetProduct.stock === 0 && successCount === 5) {
      console.log('SUCESSO: O sistema segurou a carga e manteve a consistência.');
    } else {
      console.log('Atenção: Verifique se os números batem.');
    }
  } catch (e) {
    console.error('Erro ao verificar estoque final:', e.message);
  }
}

runTest();