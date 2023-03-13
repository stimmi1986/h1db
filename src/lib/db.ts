import dotenv from 'dotenv';
import pg ,{ QueryResult }  from 'pg';
import { readFile } from 'fs/promises';

const SCHEMA_FILE = './src/lib/sql/schema.sql';
const DROP_SCHEMA_FILE = './src/lib/sql/drop.sql';

dotenv.config({ path: '.env' });


const { DATABASE_URL: connectionString} =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

const pool = new pg.Pool({ connectionString})

pool.on('error', (err: Error) => {
    console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
    process.exit(-1);
});

type QueryInput = string|number|null;

export async function query(q: string, values: Array<QueryInput>) {
  let client: pg.PoolClient;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    /*
    if (nodeEnv !== 'test') {
      console.error('unable to query', e);
    }*/
    return null;
  } finally {
    client.release();
  }
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('utf-8'),[]);
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);
  return query(data.toString('utf-8'),[]);
}

export async function end() {
  await pool.end();
}
/*
export async function insertEvent(input:Event)
*/
