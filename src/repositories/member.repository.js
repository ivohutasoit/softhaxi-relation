'use strict'

const database = require('../configurations/connection')['database']

/**
 * 
 * @param {*} filters 
 */
function find(filters) {
  return database('members').where(filters).catch((error) => { throw error })
}

/**
 * 
 * @param {String} group_id 
 * @param {String} user_id 
 * @param {String} role 
 */
function findMemberRole(group_id, user_id, role) {
  return database('members').where({ group_id: group_id, user_id: user_id, role: role, is_deleted: false }).catch((error) => { throw error })
}

function findById(id) {
  return database('members').where({ id: id, is_deleted: false })
    .first().catch((error) => { throw error })
}

function create(memberData) {
  return database('members').insert(memberData).then((data) => {
    if(data.length < 0 || !data[0]) throw new Error('Unable to create member')
    return findById(memberData.id)
  }).catch((error) => { throw error })
}

module.exports = {
  find, findById,
  create
}