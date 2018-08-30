'use strict'

const { Member } = require('../models');

/**
 * @since 1.1.0
 * @param {Object} ctx 
 */
async function verify(ctx) {
  try { 
    const req = ctx.request.body;
    const authMember = await Member.query()
        .join('groups', 'groups.id', 'members.group_id')
        .where('members.group_id', req.group_id)
        .andWhere('members.user_id', ctx.state.user.id)
        .andWhere('members.is_active', true)
        .andWhere('members.is_deleted', false)
        .select('members.id', 'members.group_id', 'groups.name as group_name')
        .first();
    const userMember = await Member.query()
        .join('groups', 'groups.id', 'members.group_id')
        .where('members.group_id', req.group_id)
        .andWhere('members.user_id', req.user_id)
        .andWhere('members.is_active', true)
        .andWhere('members.is_deleted', false)
        .select('members.id', 'members.group_id', 'groups.public_name as group_name')
        .first();
    if(authMember && userMember) {
      if(authMember.group_id === userMember.group_id) {
        ctx.status = 200;
        ctx.body = {
          status: 'SUCCESS',
          data: {
            same_group: true,
            user: {
              id: req.user_id,
              username: req.username
            },
            group: {
              id: authMember.group_id,
              name: authMember.group_name
            }
          }
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          status: 'ERROR',
          message: 'Not found'
        };
      }
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'ERROR',
        message: 'Not found'
      };
    }
  } catch(err) {
    console.log(err);
    ctx.status = 400;
    ctx.body = { status: 'ERROR', message: err.message || 'Error while getting tasks' };
  }
}

/**
 * @since 1.1.0
 */
module.exports = {
  verify
};