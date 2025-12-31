/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpa a tabela antes de inserir (para não duplicar dados ao rodar de novo)
  await knex('orders').del(); // Limpa pedidos primeiro por causa da chave estrangeira
  await knex('products').del();

  // Insere os produtos iniciais
  await knex('products').insert([
    { id: 1, name: 'Notebook Gamer', description: 'Notebook otimo para jogos', stock: 5, version: 1 },
    { id: 2, name: 'Mouse Sem Fio', description: 'Mouse ergonomico', stock: 100, version: 1 },
    { id: 3, name: 'Monitor 4K', description: 'Monitor de alta resolução', stock: 0, version: 1 }
  ]);

  await knex.raw(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`);
};