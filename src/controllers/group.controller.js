'use strict'

const Router = require('koa-router')
const uuid = require('uuid/v1')

const groupRepository = require('../repositories/group.repository')
const groupValidator = require('../middlewares/validators/group.validator')
const memberRepository = require('../repositories/member.repository')

const routes = new Router()

//#region Group Routes
routes.get('/', async(ctx) => {
  await groupRepository.findByUserId(ctx.state.user.id).then((groups) => {
    ctx.status = 200
    ctx.body = {
      status: 'SUCCESS',
      data: groups
    }
    return ctx
  }).catch((err) => {
    ctx.status = 400 
    ctx.body = { message: err.message || 'Error while getting tasks' }
    return ctx
  })
})

routes.post('/', groupValidator.validateNew, async(ctx) => {
  const req = ctx.request.body
  var scope = req.scope ? req.scope : 0
  var type = req.type ? req.type.toUpperCase() : 'COMMUNITY'
  if(type === 'FAMILLY')  scope = 3
    
  await groupRepository.create({
    id: uuid(),
    name: req.name,
    public_name: req.public_name ? req.public_name : req.name,
    description: req.description,
    type: type,
    scope: scope,
    created_by: ctx.state.user.id
  }).then(async(group) => {
    if(group) {
      await memberRepository.create({ 
        id: uuid(),
        user_id: ctx.state.user.id,
        group_id: group.id,
        role: 'ADMINISTRATOR',
        is_active: true,
        created_by: ctx.state.user.id
      }).catch((err) => {
        console.log(err)
      })

      ctx.status = 201
      ctx.body = {
        status: 'SUCCESS', 
        data: {
          id: group.id,
          name: group.name,
          public_name: group.public_name,
          type: group.type,
          scope: group.scope,
          since: group.founded_at,
          member: {
            administor: { 
              id: ctx.state.user.id,
              username: ctx.state.user.username
            }
          }
        }
      }
      return ctx
    }
  }).catch((err) => {
    ctx.status = 400 
    ctx.body = { status: 'ERROR', message: err.message || 'Error while getting tasks' }
    return ctx
  })
})

//#endregion

//#region Private Methods

//#endregion

module.exports = routes