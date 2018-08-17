'use strict'

const request = require('request-promise')
const Router = require('koa-router')
const uuid = require('uuid/v1')

const memberRepository = require('../repositories/member.repository')
const memberValidator = require('../middlewares/validators/member.validator')

const routes = new Router()

//#region Member Routes
routes.post('/:group', memberValidator.validateSearch, async(ctx) => {
  const req = ctx.request.body
  await memberRepository.find({ group_id: req.group_id, is_deleted: false }).then(async(members) => {
    var data = []
    const uri = process.env.PROFILE_SERVICE_URI || 'http://localhost:3000/api/v1/profile/user/'
    for (const member of members) {
      const options = {
        method: 'GET',
        uri: uri  + member.user_id ,
        json: true,
        headers: {
          authorization: `Bearer ${ctx.headers.authorization.split(' ')[1]}`,
        }
      }
      await request(options).then((res) => {
        if(res.status === 'SUCCESS') {
          data.push({
            id: member.user_id,
            username: res.data.username,
            role: member.role
          })
        } else {
          data.push({
            id: member.user_id,
            role: member.role
          })
        }
      }).catch((err) => { 
        data.push({
          id: member.user_id,
          role: member.role
        })
      })
    }

    ctx.status = 200
    ctx.body = {
      status: 'SUCCESS',
      data: data
    }
  }).catch((err) => {
    ctx.status = 400 
    ctx.body = { message: err.message || 'Error while getting tasks' }
    return ctx
  })
})

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