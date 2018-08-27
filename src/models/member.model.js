'use strict'

const { Model } = require('objection');
const { Connection } = require('../configurations');

Model.knex(Connection.database);

/**
 * Group Member
 * 
 * @author Ivo Hutasoit <if09051@gmail.com>
 * @since 1.1.0
 */
class Member extends Model {

  static get tableName() { return 'members'; }

  async $beforeUpdate() {
    this.updated_at = Connection.database.fn.now();
  }
}

module.exports = Member;