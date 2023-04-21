import passport, { PassportStatic, serializeUser, use } from 'passport';
import { Strategy } from 'passport-local';
import { User, userMapper } from '../routes/types.js';
import { comparePasswords, findById, findByUsername } from './Users.js';
import { Request, Response, NextFunction } from 'express';
import { query } from './db.js';
import jwt from "jsonwebtoken";


/**
 * Athugar hvort username og password sé til í notandakerfi.
 * Callback tekur við villu sem fyrsta argument, annað argument er
 * - `false` ef notandi ekki til eða lykilorð vitlaust
 * - Notandahlutur ef rétt
 *
 * @param {string} username Notandanafn til að athuga
 * @param {string} password Lykilorð til að athuga
 * @param {function} done Fall sem kallað er í með niðurstöðu
 */
async function strat(username:string, password:string, done:Function): Promise<User|null|false> {
  try {
    const user = await findByUsername(username);
    if (!user||!user.password) {
      return done(null, false);
    }

    // Verður annað hvort notanda hlutur ef lykilorð rétt, eða false
    const result = await comparePasswords(password, user.password);
    return done(null, result ? user : false);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

const sessionSecret = process.env.SESSION_SECRET;

function generateToken(user: User){
  const userInfo = {
    id: user.id,
    username: user.username,
    admin: user.admin,
    name:user.name,
  };

  const secret = process.env.SESSION_SECRET || "your-secret-key";

  const options = {
    expiresIn: "24h"
  }

  return jwt.sign(userInfo, secret, options)
}

// Notum local strategy með „strattinu“ okkar til að leita að notanda
passport.use(new Strategy(strat));


// getum stillt með því að senda options hlut með
// passport.use(new Strategy({ usernameField: 'email' }, strat));

// Geymum id á notanda í session, það er nóg til að vita hvaða notandi þetta er

passport.serializeUser((user: User, done) => {
  done(null, user.id);
})

// Sækir notanda út frá id
passport.deserializeUser(async (id:number, done) => {
  findById(id)
    .then((user) => {
      if(user){
        const userObject: User = {
          id:1,
          name: user.name,
          username: user.username,
          password: user.password,
          admin: user.admin,
        };
        done(null, userObject);
      } else {
        done(null, null);
      }
    })
    .catch((err) => {
      done(err, null);
    });
});

export function authMiddleware(req: Request, res: Response, next: NextFunction){
  if (!req.user){
    return res.status(401).json({message: "Finnur ekki notanda"});
  }
  
  const user = req.user as User;
  const accessToken = generateToken(user);
  res.clearCookie('signin');
  res.cookie('signin',`${accessToken}`);
  res.status(200).json({
    userId: user.id,
    username: user.username,
    isAdmin: user.admin,
    access_Token: accessToken,
    tokenType: "Bearer",
    expiresIn: 8000,
  });
}
export async function signOut(req:Request,res:Response,next:NextFunction){
  res.clearCookie('signin')
  res.status(200).json('user signed out');
}
// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /login


export async function isUser(req: Request, res: Response, next: NextFunction){
  const { username } = req.body;
  if(!username) return res.status(403).json({});

  const q = `
    SELECT *
    FROM users
    WHERE username = $1;
  `;

  try {
    const result = await query(q, [username]);
    const user = result.rows[0];    

    if (!user) return res.status(403).json({});

    const mapped = userMapper(user);
    return  res.status(200).json(mapped);
  } catch (error){
    console.error('Finnur ekki notanda.');
    return res.status(500).json({});
  }
}

export function checkTokenExpiration(req: Request, res: Response, next: NextFunction){
  const token = req.headers.authorization?.split(" ")[1];
  if(!token){
    return res.status(401).json({ message: "Finnur ekki notanda."});
  }
  
  if(!sessionSecret){
    return res.status(401).json({error: "No session secret"});
  }
  jwt.verify(token, sessionSecret, (err, decoded) => {
    if(err){
      if(err.name === "TokenExpiredError"){
        return res.status(401).json({message: "Token útrunnið"});
      }
      return res.status(500).json({ message: "Internal server error" });
    }
    req.user = decoded as User;
    next();
  });
}

export default passport as PassportStatic; 