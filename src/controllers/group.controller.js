'use strict'

const lodash = require('lodash');
const { transaction } = require('objection');
const uuid = require('uuid/v1');

const { Group } = require('../models');

//#region Group Routes
/**
 * @since 1.1.0
 * @param {Object} ctx 
 */
async function list(ctx) {
  try {
    const groupsCreatedBy = await Group.query()
      .where('created_by', ctx.state.user.id)
      .andWhere('is_deleted', false)
      .andWhereRaw('parent_id IS NULL')
      .select('id', 'name', 'public_name', 'description', 'founded_at', 'type',
        'scope', 'is_business', 'is_active', 'created_at');

    ctx.status = 200;
    ctx.body = {
      status: 'SUCCESS',
      data: groupsCreatedBy !== undefined ? groupsCreatedBy : []
    }
  } catch(err) {
    console.log(err);
    ctx.status = 400;
    ctx.body = { status: 'ERROR', message: err.message || 'Error while getting tasks' };
  }
}

/**
 * @since 1.1.0
 * @param {Object} ctx 
 */
async function create(ctx) {
  try {
    const req = ctx.request.body;
    const group = await transaction(Group, async(Group) => {
      const returnGroup = await Group.query().insert({
        id: uuid(),
        name: lodash.capitalize(req.name),
        public_name: req.public_name ? lodash.capitalize(req.public_name) : lodash.capitalize(req.name),
        description: lodash.capitalize(req.description),
        founded_at: req.founded_at,
        type: !req.type ? 'COMMUNITY' : req.type.toUpperCase(),
        scope: !req.scope ? 0 : req.scope,
        is_business: !req.is_business ? false : req.is_business,
        is_active: true,
        created_by: ctx.state.user.id
      });

      return returnGroup;
    });

    if(group) {
      ctx.status = 201;
      ctx.body = { status: 'SUCCESS', data: group };
    }
  } catch(err) {
    console.log(err);
    ctx.status = 400;
    ctx.body = { status: 'ERROR', message: err.message || 'Error while getting tasks' };
  }
}

//#endregion

//#region Private Methods

//#endregion

/**
 * @since 1.1.0
 */
module.exports = {
  list, create
};