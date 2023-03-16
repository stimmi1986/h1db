import dotenv from 'dotenv';
import pg ,{ QueryResult }  from 'pg';
import { Event, eventsMapper } from '../routes/types'
import { readFile } from 'fs/promises';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';

dotenv.config({ path: '.env' });

const { DATABASE_URL: connectionString } = process.env;

const pool = new pg.Pool({ connectionString })

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);
  return query(data.toString('utf-8'),[]);
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);
  return query(data.toString('utf-8'),[]);
}

pool.on('error', (err: Error) => {
    console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
    process.exit(-1);
});

//type QueryInput = string | number | null;

export async function query(
  q: string, 
  values: Array<unknown>|any = []
) {

  let client;
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
    return null;
  } finally {
    client.release();
  }
}

export async function getEvent(): Promise<Array<Event>> {
  const result = await query('SELECT * FROM events');

  if (!result) {
    return [];
  }
  
  const events = result.rows.map(eventsMapper).filter((d): d is Event => d !== null).map((d) => {
    
    return d;
  });
  
  return events;
}

export async function getEventBySlug(
  slug: string,
): Promise<Event | null> {
  const result = await query('SELECT * FROM department WHERE slug = $1', [ 
    slug,
  ]);

  if (!result) {
    return null;
  }

  const department = eventsMapper(result.rows[0]);
  
  return department;
}

/*
export async function insertEvent(input:Event):Promise<Event|null>{
    if(!input){
        return null;
    }
    const q = `
    INSERT INTO events
        (name,slug)
    VALUES
        ($1,$2)
    RETURNING id`;

  }
}
*/

export async function end() {
  await pool.end();
}