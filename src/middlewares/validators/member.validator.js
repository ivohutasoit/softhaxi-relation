'use strict'

const request = require('request-promise')

const groupRepository = require('../../repositories/group.repository')
const memberRepository = require('../../repositories/member.repository')

/**
 * 
 * @param {Object} ctx 
 * @param {Function} next 
 */
async function validateAdd(ctx, next) {
  const req = ctx.request.body
  var valid = true
  var messages = {}

  if(!req.user_id) {
    if(valid) valid = false
    messages.user_id = 'required'
  } else {
    const uri = process.env.PROFILE_SERVICE_URI || 'http://localhost:3000/api/v1/profile/user/'
    const options = {
      method: 'GET',
      uri: uri  + req.user_id ,
      json: true,
      headers: {
        authorization: `Bearer ${ctx.headers.authorization.split(' ')[1]}`,
      }
    }
    await request(options).then((res) => {
      if(res.status === 'ERROR') {
        if(valid) valid = false
        messages.user_id = res.message 
      }
    }).catch((err) => { 
      if(valid) valid = false
      messages.user_id = err.message 
    })
  }
  var groupTemp
  if(!req.group_id) {
    if(valid) valid = false
    messages.group_id = 'required'
  } else {
    await groupRepository.findById(req.group_id).then((group) => {
      if(!group) {
        if(valid) valid = false
        messages.group_id = 'Not found'
      } else {
        groupTemp = group
      }
    })
  }

  if(req.group_id && req.user_id) {
    const role = !req.role ? 'MEMBER' : req.role.toUpperCase()

    if(groupTemp.type !== 'FAMILLY') {
      if(role === 'HUSBAND' || role === 'WIFE' || role === 'CHILD') {
        if(valid) valid = false
        messages.role = 'Could not applied role to this group'
      }
    }

    if(!messages.role) {
      await memberRepository.find({ 
        group_id : req.group_id, 
        user_id: req.user_id, 
        role: role,
        is_deleted: false
      }).then((members) => {
        if(members.length > 0 || members[0]) {
          if(valid) valid = false
          messages.user_id = 'Already registered to this group as ' + role
        }
      }).catch((err) => { 
        if(valid) valid = false
        messages.user_id = err.message 
      })
    }
  }

  if(!valid) {
    ctx.status = 400
    ctx.body = {
      status: 'ERROR',
      messages: messages
    }
    return ctx
  }
    
  return next()
}

/**
 * 
 * @param {Object} ctx 
 * @param {Function} next 
 */
async function validateInvitation(ctx, next) {
  const req = ctx.request.body
  var valid = true
  var messages = {}
  if(!req.method) {
    if(valid) valid = false
    messages.method = 'required'
  } else if(req.method.toUpperCase() !== 'EMAIL') {
    if(valid) valid = false
    messages.method = 'Invalid method. Use EMAIL instead'
  } 

  if(!valid) {
    ctx.status = 400
    ctx.body = {
      status: 'ERROR',
      messages: messages
    }
    return ctx
  }

  return next()
}

async function validateSearch(ctx, next) {
  const req = ctx.request.body
  var valid = true
  var messages = {}
  if(!req.group_id) {
    if(valid) valid = false
    messages.group_id = 'required'
  } else {
    await memberRepository.find({group_id : req.group_id, 
      user_id: ctx.state.user.id, 
      is_deleted: false
    }).then((members) => {
      if(members.length < 0) {
        if(valid) valid = false
        messages.user_id = 'Not found'
      }
    })
  }

  if(!valid) {
    ctx.status = 400
    ctx.body = {
      status: 'ERROR',
      messages: messages
    }
    return ctx
  }

  return next()
}

module.exports = {
  validateAdd, validateSearch
}