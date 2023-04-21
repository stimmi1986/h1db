import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { User, userMapper } from '../routes/types.js';
import { query } from './db.js';
import jwt from 'jsonwebtoken';

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
export async function getUsernames(req:Request,res:Response,next:NextFunction){
  const {token} = req.body;
  const admin = jwt.decode(token) as {admin:boolean};
  const usernames = [];
  console.log(admin)
  if(!admin || !admin.admin){
    return res.status(401).json("einungis admin hefur aðgang að notandalista");
  }
  const q = `SELECT username from Users;`
  try{
    const result = await query(q,[]);
    console.log(result);
    if(result){
      for(const re of result.rows){
        usernames.push(re.username);
      }
    }
    return res.status(200).json(usernames);
  }catch(error){
    console.error(error);
    return res.status(500).json("server side villa");
  }
}
export async function getStandardNameOfUser(req:Request,res:Response,next:NextFunction){
  const {user} = req.body;
  const q = 'select name as nafn from users where username =$1;';
  const result = await query(q,[user]);
  if(!result){
    return res.status(404).json("no such user");
  }
  const nafn = result.rows[0].nafn;
  return res.status(200).json({nafn});
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  // Geymum hashað password!
  const { name, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = `
    INSERT INTO
      users (name, username, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const result = await query(q, [name, username, hashedPassword]);
  
  if(!result) return res.status(500);
  const mapped = userMapper(result.rows[0])
  console.error(mapped);
  
  if (mapped) {
    return res.status(201).json(mapped);
  }

  return res.status(401);
}
