'use strict'

const pincode = require('generate-pincode');
const uuid = require('uuid/v1');

const { Group, Member } = require('../models');

/**
 * @since 1.1.0
 * @param {Object} ctx 
 */
async function userToGroup(ctx) {
  try {
    const req = ctx.request.body;
    var member;
    if(req.member_id) {
      await Member.query()
        .update({
          invitation_code: pincode(6),
          updated_by: ctx.state.user.id
        })
        .where('id', req.member_id);
      member = await Member.query()
        .where('id', req.member_id)
        .select('id', 'user_id', 'group_id', 'role', 'invitation_code')
        .first()
    } else { 
      member = await Member.query() 
        .insert({ 
          id: uuid(),
          user_id: req.user_id,
          group_id: req.group_id,
          role: req.role,
          invitation_code: pincode(6),
          created_by: ctx.state.user.id
        });
    }
    
    // TODO send invitation request to email && client app

    // response
    if(member) {
      ctx.status = 201;
      ctx.body = { status: 'SUCCESS', 
        message: `Invitation has been sent to user email`,
        data: {
          id: member.id,
          user: {
            id: member.user_id,
            username: req.username
          },
          group: {
            id: member.group_id,
            name: req.group_name
          },
          as: member.role
        }
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
 * @param {Object} ctx 
 */
async function acceptByUser(ctx) {
  try {
    const req = ctx.request.body;
    var member = await Member.query()
      .where('user_id', ctx.state.user.id)
      .andWhere('group_id', req.group_id)
      .andWhere('invitation_code', req.token)
      .andWhere('accepted', false)
      .andWhere('is_active', false)
      .andWhere('is_deleted', false)
      .first();

    if(member) {
      await Member.query()
        .update({
          invitation_code: null,
          accepted: true,
          is_active: true,
          updated_by: ctx.state.user.id
        }).where('id', member.id);

      member = await Member.query().where('id', member.id)
        .first();

      ctx.status = 200;
      ctx.body = {
        status: 'SUCCESS',
        data: {
          member_status: 'Active'
        }
      };
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
 * This function can be used by group administrator only
 * 
 * @since 1.1.0
 * @param {Object} ctx 
 */
async function directAddToGroup(ctx) {
  try {
    const req = ctx.request.body;
    var member;
    if(req.member_id) {
      ctx.status = 400;
      ctx.body = {
        status: 'ERROR',
        message: 'Please request to accept grop invitation.'
      };
    } else { 
      member = await Member.query() 
        .insert({ 
          id: uuid(),
          user_id: req.user_id,
          group_id: req.group_id,
          role: req.role,
          is_active:true,
          created_by: ctx.state.user.id
        });
      if(member) {
        ctx.status = 201;
        ctx.body = { status: 'SUCCESS', 
          message: `User has been added as a member group`,
          data: {
            id: member.id,
            user: {
              id: member.user_id,
              username: req.username
            },
            group: {
              id: member.group_id,
              name: req.group_name
            },
            as: member.role
          }
        };
      }
    }
    
    // TODO send invitation request to email && client app
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
  userToGroup, acceptByUser, directAddToGroup
};