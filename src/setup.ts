import { readFile } from 'fs/promises';
import { createSchema, dropSchema, end, query } from './lib/db.js';
//prufa
async function dropDatabase() {
  const isDropped = await dropSchema();
  if (isDropped) {
    console.info('schema dropped');
  } else {
    console.info('schema not dropped, exiting');
    process.exit(-1);
  }
}

async function createDatabase() {
  const isCreated = await createSchema();
  if (isCreated) {
    console.info('schema created');
  } else {
    console.info('schema not created');
  }
}

async function insertData() {
  const data = await readFile('./sql/insert.sql');
  const isInserted = await query(data.toString('utf-8'), []);
  if (isInserted) {
    console.info('data inserted');
  } else {
    console.info('data not inserted');
  }
}

async function setupDatabase() {
  await dropDatabase();
  await createDatabase();
  await insertData();
  await end();
}

setupDatabase().catch((err) => {
  console.error('Error creating running setup', err);
});
