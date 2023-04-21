import dotenv from 'dotenv';
import pg ,{ QueryResult }  from 'pg';
import { Event, eventMapper, Img, ImgMapper, Regi, RegisMapper } from '../routes/types.js'
import { readFile } from 'fs/promises';
import { DbRegisToRegis, DbRegiToRegi } from './Registrations.js';
import { findById } from './Users.js';

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
  values: any | Array<unknown> = []
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

export async function getEvents(): Promise<Array<Event>> {
  const result = await query('SELECT * FROM events');

  if (!result) {
    return [];
  }
  
  const events = result.rows.map(eventMapper).filter((d): d is Event => d !== null).map((d) => {
    
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

  const event = eventMapper(result.rows[0]);
  
  return event;
}
export async function getRegistrations(event:number):Promise<Array<Regi>|null>{
  const result = await query('select * from registrations where event=$1;',[event]);
  if(!result){
    return null
  }
  const regis = DbRegisToRegis(result)
  return regis
}

export async function removeRegistration(event:number,username:string):Promise<boolean>{
  const result = await query(`delete from registrations
  where event =$1 and username = $2 returning 1;`,[event,username]);
  if(!result||result.rowCount===0){
    return false
  }return true

}

export async function deleteEventBySlug(slug: string): Promise<boolean> {
  const id = await query('select id from events where slug = $1;',[slug]);
  if(!id||id.rowCount==0){
    return false
  }
  await query('delete from registration where event= $1',[id.rows[0].id]);
  const result = await query('DELETE FROM events WHERE slug = $1;', [slug]);

  if (!result) {
    return false;
  }

  return result.rowCount === 1;
}

export async function insertEvent(
  event: Omit<Event,'id'>
): Promise<Event | null> {
  const { name, slug, description } = event;
  const result = await query(
    'INSERT INTO events (name, slug, description) VALUES ($1, $2, $3) RETURNING id, name, slug, description, created, updated',
    [name, slug, description]
  );
  const mapped = eventMapper(result?.rows[0]);

  return mapped;
}

export async function conditionalUpdate(
  table: string,
  id: number,
  fields: Array<string | null>,
  values: Array<string | number | null>,
) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  console.log(filteredFields)
  const filteredValues = values.filter(
    (i): i is string | number => typeof i === 'string' || typeof i === 'number',
  );
  console.log(filteredValues)

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues: Array<string | number> = (
    [id] as Array<string | number>
  ).concat(filteredValues);
  const result = await query(q, queryValues);

  return result;
}
export async function insertEventImage(slug:string,img:string,url:string){
  if(!slug || !img || !url){
    return null;
  }
  const event = await getEventBySlug(slug);
  if(!event||!event.id){
    return null;
  }
  console.log(event)
  
  const insert = `insert into images (name,url) values ($1,$2) returning name,url,id;`;
  const qi = await query(insert,[img,url]);
  console.log(qi)
  if(!qi){
    return null;
  }
  const insert2 = `insert into eventImages (image,event) values ($1,$2)returning *;`;
  await query(insert2,[qi.rows[0].id]);
  return [qi.rows[0].name,qi.rows[0].url];
}
export async function getImagesByEventSlug(slug:string){
  if(!slug){
    return [];
  }
  const list = [];
  const q = `select images.id as id,images.name as name,images.url as url 
    from eventImages left join events 
    on eventImages.event= events.id
    left join images on images.id = eventImages.id
    where events.slug = $1 `;
  const imgs = await query(q,[slug]);
  if(!imgs){
    return [];
  }
  for(const row of imgs.rows){
    const content = ImgMapper(row);
    list.push(content);
  }
  return list;
}
export async function getSpecificImageByName(name:string){
  console.log(name);
  const select = `select id,name,url from images where name = $1`;
  const result = await query(select,[name]);
  console.log(result);
  if(!result){
    return null;
  }
  const ret = ImgMapper(result.rows[0]);
  return ret;
}
export async function putEventImage(image:Img,event:Event):Promise<boolean>{
  console.error(image.id)
  console.error(event.id)
  const insert = await query('insert into eventImages (image,event) values ($1,$2) returning 1;',[image.id,event.id]);
  if(!insert){
    return null;
  }
  return true;
}
export async function addImageToDatabase(name:string,url:string):Promise <Img | null> {
  console.error(url)
  const insert = `insert into images (name,url) values ($1,$2) returning id, name, url;`;
  const result = await query(insert,[name,url]);
  if(!result){
    return null;
  }
  console.error(result.rows[0])
  const ret = ImgMapper(result.rows[0]);
  console.error(ret);
  return ret;

}
export async function deleteFullyImageByName(name: string){
  const image = await getSpecificImageByName(name);
  if(!image){
    return null;
  }
  await query(`delete from eventImages where image = $1;`,[image.id]);
  const deleter = await query(`delete from images where id = $1 returning 1;`,[image.id]);
  if(!deleter){
    return null;
  }
  return true;
}
export async function deleteImageFromEvent(name: string,event:string){
  const image = await getSpecificImageByName(name);
  const ev = await getEventBySlug(event);
  if(!image||!ev){
    return null;
  }
  const del = `delete from eventImages where image = $1 and event =$2 returning 1;`;
  const d = await query(del,[image.id,ev.id]);
  if(!d){
    return null
  }
  return true;

}
export async function allImages(){
  const q = `select id,name,url from images`;
  const images = await query(q,[]);
  const list = [];
  if(!images){
    return list;
  }
  for(const row of images.rows){
    list.push(ImgMapper(row));
  }
  return list;
}

export async function end() {
  await pool.end();
}