'use strict'

const database = require('../configurations/connection')['database']

/**
 * 
 * @param {String} id 
 */
function findById(id) {
  return database('groups').where({ id: id, is_deleted: false})
    .first().catch((error) => { throw error })
}

function findByParentId(id) {
  return database('groups').where({ parent_id: id, is_deleted: false})
    .catch((error) => { throw error })
}

/**
 * 
 * @param {String} userId 
 */
function findByUserId(userId) {
  return database('groups').where({ parent_id: null, created_by: userId, is_deleted: false})
    .catch((error) => { throw error })
}

/**
 * 
 * @param {Object} groupData 
 */
function create(groupData) {
  return database('groups').insert(groupData).then((data) => {
    if(!data) throw new Error('Unable to create group')
    return findById(groupData.id)
  }).catch((error) => { throw error })
}

module.exports = {
  findById, findByParentId, findByUserId,
  create
}