import { Regi,RegisMapper,importRegi } from "../routes/types.js";
import { NextFunction, Request,Response } from 'express';
import { getEvents, getEventBySlug, getRegistrations, query, removeRegistration, conditionalUpdate } from '../lib/db.js'
import { QueryResult } from "pg";
import { atLeastOneBodyValueValidator, stringValidator, validationCheck, xssSanitizer } from "./validators-event.js";
import { findById } from "./Users.js";
import { User } from "../routes/types.js";
import jwt from "jsonwebtoken";
/*
export async function eventsIndex(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const event = await getEvent();

    if (!event) {
        return next(new Error('unable to get event'));
    }

    return res.json(event);
}
*/
export async function getEventRegistrations(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { slug } = req.params;

    const id = await query('select id from events where slug = $1',[slug])
    if(!id||id.rowCount==0){
      return res.status(404).json('no such event')
    }
    const result = await getRegistrations(id.rows[0].id)
    if(!result){
        return res.status(500).json('resources not found')
    }


    return res.json(result);
}
export const patchRegistration = [
    stringValidator({ field: 'name', maxLength: 64, optional: true }),
    stringValidator({
      field: 'comment',
      valueRequired: false,
      maxLength: 1000,
      optional: true,
    }),
    atLeastOneBodyValueValidator(['name', 'comment']),
    xssSanitizer('name'),
    xssSanitizer('comment'),
    validationCheck,
    patchRegistrationHandler,
  ];
export const postRegistration = [
    stringValidator({
      field: 'comment',
      valueRequired: false,
      maxLength: 1000,
      optional: true,
    }),
    xssSanitizer('comment'),
    validationCheck,
    postRegistrationHandler,
  ];
export async function patchRegistrationHandler(
    req: Request,
    res: Response,
    next: NextFunction,){
    if(!req.cookies?.signin){
          return res.status(401).json('ekki skráður inn');
    }
    const userInfo=jwt.decode(req.cookies.signin)

    const {slug,username} = req.params;
    if(!userInfo ||!(userInfo['admin']||userInfo['username']==username)){
        return res.status(401).json('hefur ekki heimild til að breyta skráningu þessa notenda')
    }
    const id = await query('select id from events where slug = $1;',[slug])
    if(!id||id.rowCount==0){
        return res.status(404).json('viðburður finnst ekki')
    }
    const regId = await query('select id from registrations where username=$1 and event =$2;',[username,id.rows[0].id])
    
    if(!regId||regId.rowCount==0){
        return res.status(404).json('skráning finnst ekki')
    }
    const {name,comment} = req.body
    const fields = [
        typeof name === 'string' && name ? 'name':null,
        typeof comment === 'string' && comment ? 'comment':null,
    ]
    const values = [
        typeof name === 'string' && name ? name : null,
        typeof comment === 'string' && comment ? comment:null,
    ]
    try{
        const updated = await conditionalUpdate(
            'registrations',
            regId.rows[0].id,
            fields,
            values
        );
        if (!updated){
            return res.status(500).json('error')
        }
        const updatedRegi = RegisMapper(updated.rows[0]);
        return res.json(updatedRegi);
    }catch (err){
        console.error('Error updating registration:',err);
        return res.status(500).json('error')
    }
}
export async function deleteRegistration(
    req:Request,
    res:Response,
    next: NextFunction){
    // if(!req.user||!req.user.id){
    //     return res.status(401).render('error',{'msg':'not logged in'})
    // }
    const userFind = await findById((req.user as User).id)
    if(!userFind||!userFind.name){
        return res.status(401).json('no user with your id')
    }
    if(!(userFind.name==req.params.usernam)&&!(req.user as User).admin){
        return res.status(401).json('only administrator or this user can alter this registration')
    }
    const {slug,username} = req.params
    const id = await query('select id from events where slug = $1;',[slug])
    if(!id||id.rowCount==0){
        console.error("vandamál með að finna viðburð")
        return next()
    }
    const result = await removeRegistration(id.rows[0].id,username)
    if(!result){
        console.error("vandamál með að uppfæra skráningu")
        return next()
    }
    res.json({message:"skráning eytt af viðburði"})
}
export async function postRegistrationHandler(
    req:Request,
    res:Response,
    next:NextFunction){
    // if(!req.user || !req.user.id){
    //     return res.status(401).render('error', {'msg':'not logged in. cannot register'})
    // }
    const {slug} = req.params
    const eventId = await query('select id from events where slug = $1;',[slug])
    if(!eventId||eventId.rowCount==0){
        return res.status(404).json('no such event')
    }
    const {id} = req.user as User
    const userFind = await findById(id)
    if(!userFind || !userFind.username || !userFind.name){
        return res.status(404).json('no user with your id')
    }
    const registered = await query(`select 1 from registrations where event = $1 and username = $2 `,[eventId,userFind.username])
    if(registered&&registered.rowCount>0){
        return res.status(405).json('user already registered to event, can not create duplicate registrations')
    }
    let {comment} = req.body
    if(!comment){
        comment = ''
    }
    const crea = await query(`insert into
     registrations (event,username,name,comment) 
     values ($1,$2,$3,$4)returning *`,[eventId,userFind.username,userFind.name,comment])
    const newRegi = DbRegiToRegi(crea)
    if(!newRegi){
        return res.status(500).json('error in user registration insert command')
    }
    return res.json(newRegi)
}




export function DbRegiToRegi(input: QueryResult<Regi>| null): Regi | null {
    if (!input){
        return null;
    }

    return RegisMapper(input);
}
export function DbRegisToRegis(
    input:QueryResult<Regi>|null):Array<Regi>{
    if (!input) {
        return [];
    }
    const mappedEvents = input?.rows.map(RegisMapper);

    return mappedEvents.filter((i): i is Regi=>Boolean(i));
}
