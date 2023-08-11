'use strict'
const migrate = require('migrate')
const dbPreCheck = require('../db/initializeDB');
const migrationDAO = require('../db/dao/migrationDAO');
class CustomStateStorage {
  constructor() { }
  async load(fn) {
    try {
      await dbPreCheck();
      const rows = await migrationDAO.queryAll();
      if (rows.length !== 1) {
        console.log('Cannot read migrations from database. If this is the first time you run migrations, then this is normal.')
        return fn(null, {})
      }
      await fn(null, rows[0].data)
    } catch (e) {
      console.error(e);
    }
  }

  async save(set, fn) {

    const rows = await migrationDAO.queryAll();
    const data = {
      'data': {
        lastRun: set.lastRun,
        migrations: set.migrations
      }
    };
    if (!rows || rows.length === 0) {
      await migrationDAO.create(data)
    } else {
      const id = rows[0].id;
      await migrationDAO.update(id, data);
    }
    await fn()
  }
}

module.exports = CustomStateStorage

/**
 * Main application code
 */
migrate.load({
  // Set class as custom stateStore
  stateStore: new CustomStateStorage()
}, function (err, set) {
  if (err) {
    throw err
  }

  set.up((err2) => {
    if (err2) {
      throw err2
    }

    console.log('Migrations successfully ran')
  })
})


