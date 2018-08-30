'use strict'

const NodeCache = require('node-cache');
const request = require('request-promise');
const uuid = require('uuid/v1');

const { Group, Member } = require('../models');

const cache = new NodeCache({ stdTTL: 10, checkperiod: 10 * 0.2, useClones: true });

//#region Member Routes
/**
 * @since 1.1.0
 * @param {Object} ctx 
 */
async function findByGroup(ctx) {
  try {
    const req = ctx.request.body;
    var members = cache.get('members_' + req.group_id);

    if(members === undefined || !members) {
      members = await Member.query()
        .join('groups', 'groups.id', 'members.group_id')
        .where('groups.id', req.group_id)
        .andWhere('groups.is_deleted', false)
        .andWhere('members.is_deleted', false)
        .andWhere('members.is_active', true)
        .select('members.id', 'members.user_id', 'groups.id as group_id', 'groups.name as group_name', 'members.role');
      if(members !== undefined) {
        var data = [];
        const uri = process.env.API_THIRDPARTY_URI || 'http://localhost:3000/api/v1';
        for (var member of members) {
          const options = {
            method: 'GET',
            uri: uri + '/user/profile/' + member.user_id ,
            json: true,
            headers: {
              authorization: `Bearer ${ctx.headers.authorization.split(' ')[1]}`,
            }
          };
          await request(options).then((res) => {
            if(res.status === 'SUCCESS') {
              member = {
                id: member.id,
                user: {
                  id: member.user_id,
                  username: res.data.username
                },
                group: {
                  id: member.group_id,
                  name: member.group_name
                },
                role: member.role,
                accepted: member.accepted,
                invitation_code: member.invitation_code
              }
            } else {
              member = {
                id: member.id,
                user: {
                  id: member.user_id
                },
                group: {
                  id: member.group_id,
                  name: member.group_name
                },
                role: member.role,
                accepted: member.accepted,
                invitation_code: member.invitation_code
              }
            }
            data.push(member);
          }).catch((err) => { 
            console.error(err);
            member = {
              id: member.id,
              user: {
                id: member.user_id
              },
              group: {
                id: member.group_id,
                name: member.group_name
              },
              role: member.role,
              accepted: member.accepted,
              invitation_code: member.invitation_code
            }
            data.push(member);
          });
        }
        members = data;
      }

      if(members !== undefined || members)
        cache.set('members_' + req.group_id, members);
    }

    ctx.status = 200;
    ctx.body = { status: 'SUCCESS', data: members !== undefined ? members : [] };
  } catch(err) {
    console.log(err);
    ctx.status = 400;
    ctx.body = { status: 'ERROR', message: err.message || 'Error while getting tasks' };
  }
}

//#endregion

/**
 * @since 1.1.0
 */
module.exports = {
  findByGroup
};