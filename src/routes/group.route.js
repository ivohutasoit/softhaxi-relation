'use strict'

const Router = require('koa-router')

const groupController = require('../controllers/group.controller')
const memberController = require('../controllers/member.controller')

const routes = new Router()

routes.use(groupController.routes(), groupController.allowedMethods())

routes.use('/member', memberController.routes(), memberController.allowedMethods())

module.exports = routes