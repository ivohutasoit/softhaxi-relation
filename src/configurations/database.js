'use strict'

const path = require('path')

const base = path.resolve(__dirname, '../../','database')

module.exports = {

    test: {
        client: 'sqlite3',
        connection: {
          filename: '../rsdbtest.sqlite3'
        },
        migrations: {
          directory: path.resolve(base, 'migrations', 'sqlite3'),
          tableName: 'migrations'
        },
        seeds: {
          directory: path.resolve(base, 'seeds', 'sqlite3')
        },
        useNullAsDefault: true
      },
    
      development: {
        client: 'sqlite3',
        connection: {
          filename: '../rsdbdev.sqlite3'
        },
        migrations: {
          directory: path.resolve(base, 'migrations', 'sqlite3'),
          tableName: 'migrations'
        },
        seeds: {
          directory: path.resolve(base, 'seeds', 'sqlite3')
        },
        useNullAsDefault: true
      },
  
    staging: {
      client: 'postgresql',
      connection: {
        host: process.env.DATABASE_SERVER || 'localhost',
        port: process.env.DATABASE_PORT || 5432,
        database: process.env.DATABASE_NAME || 'rsdbstag',
        user: process.env.DATABASE_USERNAME || 'username',
        password: process.env.DATABASE_PASSWORD || 'password',
        ssl: true
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        directory: path.resolve(base, 'migrations'),
        tableName: 'migrations'
      },
      seeds: {
        directory: path.resolve(base, 'seeds')
      }
    },
  
    production: {
      client: 'postgresql',
      connection: {
        host: process.env.DATABASE_SERVER || 'localhost',
        port: process.env.DATABASE_PORT || 5432,
        database: process.env.DATABASE_NAME || 'rsdbprod',
        user: process.env.DATABASE_USERNAME || 'username',
        password: process.env.DATABASE_PASSWORD || 'password',
        ssl: true
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        directory: path.resolve(base, 'migrations'),
        tableName: 'migrations'
      },
      seeds: {
        directory: path.resolve(base, 'seeds')
      }
    }
  
  };
  