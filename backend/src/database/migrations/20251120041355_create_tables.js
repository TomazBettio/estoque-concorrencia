/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('products', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.integer('stock').notNullable();
      table.integer('version').defaultTo(1);
      table.check('?? >= 0', ['stock'], 'stock_positive_check');
    })
    .createTable('orders', table => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().references('id').inTable('products'); // FK exigida [cite: 52]
      table.integer('quantity').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('orders').dropTable('products');
};