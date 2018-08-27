
exports.up = function(knex, Promise) {
  return knex.schema.createTable('groups', (table) => {
    table.string('id', 36).primary();
    table.string('parent_id', 36).unsigned();
    table.string('name', 100).notNullable();
    table.string('public_name', 50).nullable();
    table.string('description').nullable();
    table.date('founded_at').nullable();
    table.string('type', 20).defaultTo('COMMUNITY'); // 
    table.int('scope').defaultTo(0); // 0 - Open, 1 - Closed, 2 - Secret, 3 - Familly
    table.boolean('is_business').defaultTo(false);
    table.boolean('is_active').notNullable().defaultTo(false);
    table.boolean('is_deleted').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('created_by').nullable();
    table.timestamp('updated_at').nullable();
    table.string('updated_by').nullable();
    table.foreign('parent_id').references('groups.id');
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('groups');
}
