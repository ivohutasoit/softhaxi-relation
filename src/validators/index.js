'use strict'

const group = require('./group.validator');
const invitation = require('./invitation.validator');
const member = require('./member.validator');
const relation = require('./relation.validator');

/**
 * @since 1.1.0
 */
module.exports = {
  group, invitation, member, relation
};