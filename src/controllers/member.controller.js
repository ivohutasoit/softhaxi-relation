'use strict'

const Router = require('koa-router')
const uuid = require('uuid/v1')

const memberRepository = require('../repositories/member.repository')
const memberValidator = require('../middlewares/validators/member.validator')

const routes = new Router()

//#region Member Routes
routes.post('/add', memberValidator.validateAdd, async(ctx) => {
  const req = ctx.request.body
  await memberRepository.create({
    id: uuid(),
    user_id: req.user_id,
    group_id: req.group_id,
    role: !req.role ? 'MEMBER' : req.role.toUpperCase(),
    is_active: true,
    created_by: ctx.state.user.id
  }).then((member) => {
    ctx.status = 201
    ctx.body = {
      status: 'SUCCESS',
      data: member
    }
    return ctx
  }).catch((err) => {
    ctx.status = 400 
    ctx.body = { message: err.message || 'Error while getting tasks' }
    return ctx
  })
})

/* routes.post('invite', memberValidator.validateInvite, async(ctx) => {
  
}) */
//#endregion

module.exports = routes