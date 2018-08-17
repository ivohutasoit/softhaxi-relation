'use strict'

const Router = require('koa-router')

const application = require('./application')
const authMiddlerware = require('../middlewares/auth.middleware')
const groupRoute = require('../routes/group.route')

const routes = new Router()
const apiV1 = new Router({ prefix: '/api/v1' })

routes.get('/', async(ctx) => {
  ctx.render('index', { title : application.name }, true)
})

apiV1.get('/auth/info', authMiddlerware.isAuthenticated, async(ctx) => {
  ctx.status = 200
  ctx.body = {
    status: 'SUCCESS',
    data: ctx.state.user
  }
  return ctx
})

apiV1.use('/group', authMiddlerware.isAuthenticated, groupRoute.routes(), groupRoute.allowedMethods())

routes.use(apiV1.routes(), apiV1.allowedMethods())

module.exports = routes