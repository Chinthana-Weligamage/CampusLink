const path = require('node:path');
const { mkdirSync } = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { env } = require('../config/env');

let database;

function getDb() {
  if (!database) {
    if (env.dbFile !== ':memory:') {
      mkdirSync(path.dirname(env.dbFile), { recursive: true });
    }

    database = new DatabaseSync(env.dbFile);
    database.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
    `);
  }

  return database;
}

module.exports = {
  getDb
};
