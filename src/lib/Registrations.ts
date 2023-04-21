import { Regi,RegisMapper } from "../routes/types.js";
import { NextFunction, Request,Response } from 'express';
import { getRegistrations, query, removeRegistration, conditionalUpdate } from '../lib/db.js'
import { QueryResult } from "pg";
import { atLeastOneBodyValueValidator, stringValidator, validationCheck, xssSanitizer } from "./validators-event.js";
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
export async function getRegistration(req:Request,res:Response,next:NextFunction){
    const {slug,username} = req.params;
    const id = await query('select id from events where slug = $1;',[slug])

    if(!id||id.rowCount==0){
      return res.status(404).json('no such event')
    }
    const result = await query(`select * from registrations where event=$1 and username= $2;`,[id.rows[0].id,username]);
    if(!result){
        return res.status(404).json('notandi ekki skráður á viðburð');
    }
    const ret = DbRegiToRegi(result.rows[0]);
    if(!ret){
        return res.status(500).json('vandamĺa með túlkun gagna úr gagnagrunni');
    }
    return res.status(200).json(ret);
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
    stringValidator({field: 'username',maxLength:64,optional:true}),
    stringValidator({ field: 'name', maxLength: 64, optional: true }),
    stringValidator({
      field: 'comment',
      valueRequired: false,
      maxLength: 1000,
      optional: true,
    }),
    xssSanitizer('username'),
    xssSanitizer('name'),
    xssSanitizer('comment'),
    validationCheck,
    postRegistrationHandler,
  ];
export async function patchRegistrationHandler(
    req: Request,
    res: Response,
    next: NextFunction,){
    if(!req.body.token){
          return res.status(401).json('ekki skráður inn');
    }
    const userInfo=jwt.decode(req.body.token)

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
    if(!req.body.token){
            return res.status(401).json('ekki skráður inn');
      }
    const userInfo=jwt.decode(req.body.token)
    const {slug,username} = req.params
    if(!userInfo||!(userInfo['username']==username||userInfo['admin'])){
        return res.status(401).json('only administrator or this user can alter this registration')
    }
    const id = await query('select id from events where slug = $1;',[slug])
    if(!id||id.rowCount==0){
        return res.status(404).json('viðburður finnst ekki')
    }
    const result = await removeRegistration(id.rows[0].id,username)
    if(!result){
        console.error("vandamál með að uppfæra skráningu")
        return res.status(500).json('vandamál með að uppfæra skráningu')
    }
    res.status(200).json({message:"skráning eytt af viðburði"})
}
export async function postRegistrationHandler(
    req:Request,
    res:Response,
    next:NextFunction){
    console.log("startpostreg");
    if(!req.body.token){
        return res.status(401).json('ekkert token');
    }
    const userInfo=jwt.decode(req.body.token)
    if(!userInfo||!userInfo['username']){
        return res.status(401).json('ekki skráður inn');
    }
    let {username} = req.body;
    if(!username){
        username = userInfo['username'];
    }
    if(!userInfo['username']==username&&!userInfo['admin']){
        return res.status(401).json('hefur ekki heimild til að breyta skráningu þessa notenda')
    }
    const {slug} = req.params;
    const eventId = await query('select id from events where slug = $1;',[slug])
    if(!eventId||eventId.rowCount==0){
        return res.status(404).json('no such event')
    }
    const registered = await query(`select * from registrations where event = $1 and username = $2 `,[eventId.rows[0].id,username])
    if(registered && registered.rowCount>0){
        return res.status(405).json('user already registered to event, can not create duplicate registrations')
    }
    let {comment,name} = req.body
    if(!name){
        const search = await query('select name from users where username=$1;',[username]);
        if(!search || search.rowCount==0){
            return res.status(404).json('no name found for signed in user');
        }
        name = search.rows[0].name;
    }
    const poscomm = comment? ',comment':'';
    const poscommnum = comment? ',$4':'';
    const vals = [eventId.rows[0].id,username,name]
    comment? vals.push(comment): null;
    const crea = await query(`insert into
     registrations (event,username,name${poscomm}) 
     values ($1,$2,$3${poscommnum})returning *;`,vals);
    if(!crea || crea.rowCount==0){
        return res.status(500).json('error in user registration insert command')
    }
    const newRegi = RegisMapper(crea.rows[0])
    return res.status(201).json(newRegi)
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
