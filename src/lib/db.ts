import dotenv from 'dotenv';
import pg ,{ QueryResult }  from 'pg';
import { Event, eventsMapper, Regi, RegisMapper } from '../routes/types.js'
import { readFile } from 'fs/promises';
import { DbRegisToRegis, DbRegiToRegi } from './Registrations.js';

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
  values: Array<unknown> = []
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
  const result = await query('SELECT * FROM events WHERE slug = $1', [ 
    slug,
  ]);

  if (!result) {
    return null;
  }

  const department = eventsMapper(result.rows[0]);
  
  return department;
}
export async function getRegistrations(event:number):Promise<Array<Regi>|null>{
  const result = await query('select * from registrations where event=$1',[event]);
  if(!result){
    return null
  }
  const regis = DbRegisToRegis(result)
  return regis
}
export async function updateRegistration(event:number,username:string,comment:string):Promise<Regi|null>{
  console.log(event,username,comment)
  const result = await query(`
  update registrations 
  set comment='${comment}', updated = CURRENT_TIMESTAMP
  where event=$1 and username like $2 returning *;`,[event,username])
  if(!result){
    return null
  }
  return DbRegiToRegi(result.rows[0])
}
export async function removeRegistration(event:number,username:string):Promise<boolean>{
  const result = await query(`delete registrations
  where event =$1 and username like $2 returning 1`,[event,username])
  if(!result||result.rowCount===0){
    return false
  }return true

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