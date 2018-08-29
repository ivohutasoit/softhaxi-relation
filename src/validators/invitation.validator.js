'use strict'

const request = require('request-promise');

const { Group, Member } = require('../models');

/**
 * @since 1.1.0
 * @param {Object} ctx 
 * @param {Function} next callback 
 */
async function validateUserToGroup(ctx, next) {
  try {
    const req = ctx.request.body;
    var valid = true;
    var messages = {};
    var group;
    var member;
    var user;

    if(!req.group_id) {
      if(valid) valid = false;
      messages.group_id = 'required';
    } else {
      // creator
      group = await Group.query()
        .where('id', req.group_id)
        .andWhere('created_by', ctx.state.user.id)
        .andWhere('is_deleted', false)
        .first();
      if(!group) {
        member = await Member.query()
          .join('groups', 'groups.id', 'members.group_id')
          .where('members.group_id', req.group_id)
          .andWhere('members.user_id', ctx.state.user.id)
          .andWhere('members.accepted', true)
          .andWhere('members.is_active', true)
          .andWhere('members.is_deleted', false)
          .select('members.id', 'members.group_id', 'groups.name as group_name')
          .first();
        
        if(member === undefined) {
          if(valid) valid = false;
          messages.group_id = 'not found';
        } else {
          ctx.request.body.group_name = member.group_name;
        }
      } else {
        ctx.request.body.group_name = group.name;
      }
    }

    if(!req.user_id) {
      if(!req.method) {
        if(valid) valid = false;
        messages.method = 'required. Use \'EMAIL\' instead';
      } else {
        if(req.method.toUpperCase() !== 'EMAIL') {
          if(valid) valid = false;
          messages.method = 'invalid method. Use \'EMAIL\' instead';
        } else {
          if(!req.email) {
            if(valid) valid = false;
            messages.email = 'required. Since method specified to be email';
          }
        }
      }
    } else {
      const uri = process.env.API_THIRDPARTY_URI || 'http://localhost:3000/api/v1';
      const options = {
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
          ctx.request.body.username = user.username;
          ctx.request.body.email = user.email;
          ctx.request.body.mobile = user.mobile;
        }
      }).catch((err) => { 
        console.error(err);
        if(valid) valid = false;
        messages.user_id = err.error.message || err.message;
      });
    }

    // check assigned role to member
    if(group !== undefined && user != undefined) {
      const role = !req.role ? 'MEMBER' : req.role.toUpperCase();
      ctx.request.body.role = role;
      if(group.type !== 'FAMILLY') {
        if(role === 'HUSBAND' || role === 'WIFE' || role === 'CHILD') {
          if(valid) valid = false;
          messages.role = 'could not be assigned since \'Familly\' group';
        }
      } else {
        var member = await Member.query()
            .join('groups', 'groups.id', 'members.group_id')
            .where('members.group_id', req.group_id)
            .andWhere('members.user_id', req.user_id)
            .andWhere('members.is_deleted', false)
            .select('members.id', 'members.group_id', 'groups.name as group_name', 'members.role', 
              'members.accepted', 'members.is_active')
            .first();
        if(member) {
          if(member.accepted === 0) {
            ctx.request.body.group_name = member.group_name;
            ctx.request.body.member_id = member.id;
          } else if(member.is_active === 1 && member.role === role) {
            if(valid) valid = false;
            messages.role = 'Already registered to this group as ' + role;
          }
        }
      }
    }

    if(!valid) {
      if(!messages.user_id && !messages.email) {
        messages.user_id = 'optional. Used for direct user invitation';
      }
      if(!messages.user_id && !messages.email) {
        messages.method = 'optional. Used for invite via email';
      }
      if(!messages.user_id && !messages.email) {
        messages.email = 'optional. Required since method specified to be email';
      }
      if(!messages.role) {
        messages.role = 'optional. \'MEMBER\' as default';
      }
      ctx.status = 400;
      ctx.body = {
        status: 'ERROR',
        messages: messages
      };
      return ctx;
    }

    return next();
  } catch(err) {
    console.log(err);
    return next(err);
  }
}

/**
 * 
 * @param {Object} ctx 
 * @param {Function} next callback 
 */
async function validateAcceptByUser(ctx, next) {
  const req = ctx.request.body;
  var valid = true;
  var messages = { };

  if(!req.group_id) {
    if(valid) valid = false;
    messages.group_id = 'required';
  }

  if(!req.token) {
    if(valid) valid = false;
    messages.token = 'required';
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
  validateUserToGroup, validateAcceptByUser
};