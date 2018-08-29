'use strict'

const { Group } = require('../models');

/**
 * @since 1.1.0
 * @param {Object} ctx 
 * @param {Function} next callback 
 */
async function validateOnSameGroup(ctx, next) {
  const req = ctx.request.body;

  var valid = true;
  var messages = { };

  var group;
  var user;

  if(!req.group_id) {
    if(valid) valid = false;
    messages.group_id = 'required';
  } else {
    group = await Group.query()
                    .where('id', req.group_id)
                    .andWhere('is_active', true)
                    .andWhere('is_deleted', false)
                    .first();

    if(!group) {
      if(valid) valid = false;
      messages.group_id = 'not found';
    }
  }

  if(!req.user_id) {
    if(valid) valid = false;
    messages.user_id = 'required';
  }

  if(valid) {
    const uri = process.env.API_THIRDPARTY_URI || 'http://localhost:3000/api/v1';
    var options = {
        method: 'GET',
        uri: uri + '/user/profile/' + req.user_id ,
        json: true,
        headers: {
            authorization: `Bearer ${ctx.headers.authorization.split(' ')[1]}`,
        }
    };
    await request(options).then((res) => {
      if(res.status === 'SUCCESS') {
        user = res.data;
      }
    }).catch((err) => { 
      console.error(err);
      if(valid) valid = false;
      messages.user_id = err.error.message || err.message;
    });
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
  validateOnSameGroup
}