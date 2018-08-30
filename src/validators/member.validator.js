'use strict'

const request = require('request-promise');

const { Group, Member } = require('../models');

/**
 * @since 1.1.0
 * @param {Object} ctx 
 * @param {function} next callback 
 */
async function validateSearchByGroup(ctx, next) {
  const req = ctx.request.body;
  var valid = true;
  var messages = {};

  if(!req.group_id && !req.group_name) {
    if(valid) valid = false;
    messages.keyword = 'invalid keyword. Use \'group_id\' or \'group_name\'';
  }

  if(req.group_id) {
    var group = await Group.query()
      .where('id', req.group_id)
      .andWhere('is_deleted', false)
      .select('id', 'name', 'is_active')
      .first();
    if(!group) {
      if(valid) valid = false;
      messages.group_id = 'not found';
    }
  } else if(req.group_name) {
    var group = await Group.query()
      .whereRaw('upper(name) like %?%', [req.group_name.toUpperCase()])
      .andWhere('is_deleted', false)
      .select('id', 'name', 'is_active')
      .first();
    if(!group) {
      if(valid) valid = false;
      messages.group_id = 'not found';
    }
  }

  if(!valid) {
    ctx.status = 400;
    ctx.body = {
      status: 'ERROR',
      messages: messages
    };
    return ctx;
  }

  return next();
}

/**
 * @since 1.1.0
 */
module.exports = {
  validateSearchByGroup
};