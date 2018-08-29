'use strict'

const Group = require('./group.controller');
const Invitation = require('./invitation.controller');
const Member = require('./member.controller');
const Relation = require('./relation.controller');

/**
 * @since 1.1.0
 */
module.exports = {
  Group, Invitation, Member, Relation
};