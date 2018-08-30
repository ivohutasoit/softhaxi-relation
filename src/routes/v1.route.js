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
v1.post('/group/profile', ThirdParty.authenticatedUser, 
    Validator.group.validateProfile, Controller.Group.profile);
v1.post('/group/invite', ThirdParty.authenticatedUser,
    Validator.invitation.validateUserToGroup, Controller.Invitation.userToGroup);
v1.post('/group/member/add', ThirdParty.authenticatedUser, 
    Validator.invitation.validateUserToGroup, Controller.Member.directAdd);
v1.post('/group/member/search', ThirdParty.authenticatedUser, 
    Validator.member.validateSearchByGroup, Controller.Member.findByGroup);

// Group Member Invitation
v1.post('/group/accept_invitation', ThirdParty.authenticatedUser, 
    Validator.invitation.validateAcceptByUser, Controller.Invitation.acceptByUser);

// Group Relation
v1.post('/group/relation/verify', ThirdParty.authenticatedUser,
    Validator.relation.validateVerify, Controller.Relation.verify);

module.exports = v1;