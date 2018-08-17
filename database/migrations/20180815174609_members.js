
exports.up = function(knex, Promise) {
  return knex.schema.createTable('members', (table) => { 
    table.string('id', 36).primary()
    table.string('user_id', 36).notNullable()
    table.string('group_id', 36).unsigned().notNullable()
    table.string('role', 20).notNullable().defaultTo('MEMBER') // MEMBER -> General, [HUSBAND, WIFE, CHILD] -> Familly
    table.string('invitation_code', 6).nullable()
    table.boolean('accepted').notNullable().defaultTo(false)
    table.boolean('is_active').notNullable().defaultTo(false)
    table.boolean('is_deleted').notNullable().defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.string('created_by').nullable()
    table.timestamp('updated_at').nullable()
    table.string('updated_by').nullable()
    table.foreign('group_id').references('groups.id')  
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('members')
}
