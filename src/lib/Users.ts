import bcrypt from 'bcrypt';
import { QueryResult } from 'pg';
import { User } from '../routes/types.js';
import { query } from './db.js';

export async function comparePasswords(password:string, hash:string):Promise<boolean>  {
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    console.error('Gat ekki borið saman lykilorð', e);
  }

  return false;
}

export async function findByUsername(username:string):Promise<User|null> {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result?.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function findById(id:number):Promise<User|null> {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);
    if (result && result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}

export async function createUser(name:string, username:string, password:string):Promise<User|null> {
  // Geymum hashað password!
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = `
    INSERT INTO
      users (name, username, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const result = await query(q, [name, username, hashedPassword]);

  if (result?.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function isAdmin(username: string) {
  const q = `
    SELECT admin
    FROM users
    WHERE username = $1;
  `;
  try {
    const result = await query(q, username);
    if(result)
    return result.rows[0];
  } catch (error) {
    console.error('Finnur ekki notanda.');
  }
}
 