'use strict'

const Router = require('koa-router');
const passport = require('koa-passport');

const Controller = require('../controllers');
const ThirdParty = require('../middlewares/thirdparty.middleware');
const Validator = require('../validators');

const v1 = new Router({ prefix: '/api/v1'});

// Group Maintenance
v1.get('/group', ThirdParty.authenticatedUser, Controller.Group.list);
v1.post('/group', ThirdParty.authenticatedUser, 
    Validator.group.validateCreate, Controller.Group.create);
v1.post('/group/member/search', ThirdParty.authenticatedUser, 
    Validator.member.validateSearchByGroup, Controller.Member.findByGroup)

module.exports = v1;