'use strict'

/**
 * @since 1.1.0
 * @param {Object} ctx 
 * @param {function} next callback 
 */
async function validateCreate(ctx, next) {
  const req = ctx.request.body;
  var valid = true;
  var messages = {};

  if(!req.name) {
    if(valid) valid = false;
    messages.name = 'required';
  } else if(req.name.length < 3 || req.name.length > 100) {
    if(valid) valid = false;
    messages.name = 'min length is 3 and max length is 100 characters';
  }

  if(req.type) {
    const type = req.type.toUpperCase()
    if(type !== 'COMMUNITY' &&
        type !== 'FAMILLY' && 
        type !== 'ALUMNI') {
      if(valid) valid = false;
      messages.name = 'Invalid group type. Use \'Community\', \'Familly\', \'Alumni\' or \'Company\' instead';
    }
  }

  if(!valid) {
    messages.public_name = 'optional';
    messages.description = 'optional';
    messages.found_at = 'optional';

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
 * 
 * @since 1.1.0
 * @param {Object} ctx 
 * @param {Function} next callback 
 */
async function validateProfile(ctx, next) {
  const req = ctx.request.body;
  var valid = true;
  var messages = { };

  if(!req.group_id) {
    if(valid) valid = false;
    messages.group_id = 'required';
  }

  if(!valid) {
    ctx.status = 400;
    ctx.body = {
      status: 'ERROR',
      messages: messages
    }
    return ctx;
  }

  return next();
}

/**
 * @since 1.1.0
 */
module.exports = {
  validateCreate,validateProfile
};