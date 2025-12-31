/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('order_items', table => {
      table.increments('id').primary();
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products');
      table.integer('quantity').notNullable();
      table.decimal('price', 10, 2); // Preço unitário no momento da compra
    })
    .table('orders', table => {
      table.dropColumn('product_id');
      table.dropColumn('quantity');
      table.string('status').defaultTo('completed');
      table.decimal('total', 10, 2).defaultTo(0);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .table('orders', table => {
      table.integer('product_id').unsigned().references('id').inTable('products');
      table.integer('quantity');
      table.dropColumn('status');
      table.dropColumn('total');
    })
    .dropTable('order_items');
};
