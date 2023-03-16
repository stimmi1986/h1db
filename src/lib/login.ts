import passport from 'passport';
import { Strategy } from 'passport-local';
import { User } from '../routes/types';
import { comparePasswords, findById, findByUsername } from './Users';
import { Request, Response, NextFunction } from 'express';

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

// Notum local strategy með „strattinu“ okkar til að leita að notanda
passport.use(new Strategy(strat));

// getum stillt með því að senda options hlut með
// passport.use(new Strategy({ usernameField: 'email' }, strat));

// Geymum id á notanda í session, það er nóg til að vita hvaða notandi þetta er

//þurfum að lagfæra eftirfarandi villur
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Sækir notanda út frá id
passport.deserializeUser(async (id:number, done) => {
  try {
    const user = await findById(id);

    // Pössum að lykilorð geti ekki birtst neinstaðar
    if(user && user.password){
        delete user.password;
        done(null, user);}
  } catch (err) {
    done(err);
  }
});

// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /login
export function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user?.admin) {
    return next();
  }

  const title = 'Síða fannst ekki';
  return res.status(404).render('error', { title });
}

export default passport; 