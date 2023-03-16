import { Regi,RegisMapper,importRegi } from "../routes/types.js";
import { NextFunction, Request,Response } from 'express';
import { getEvents, getEventBySlug, getRegistrations, query, removeRegistration, updateRegistration } from '../lib/db.js'
import { QueryResult } from "pg";

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
      return null
    }
    const result = await getRegistrations(id.rows[0].id)
    if(!result){
        return next()
    }


    return res.json(result);
}
export async function patchRegistration(
    req: Request,
    res: Response,
    next: NextFunction,){
    const {slug,username} = req.params
    const {comment} = req.body
    const id = await query('select id from events where slug = $1;',[slug])
    if(!id||id.rowCount==0){
        console.error("vandamál með að finna viðburð")
      return next()
    }
    const result = await updateRegistration(id.rows[0].id,username,comment)
    if(!result){
        console.error("vandamál með að uppfæra skráningu")
        return next()
    }
    res.json(result)
}
export async function deleteRegistration(
    req:Request,
    res:Response,
    next: NextFunction){
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
}/*
export async function postRegistration(
    req:Request,
    res:Response,
    next:NextFunction){
    const {slug} = req.params
    let {username, comment} = req.body
    if(!username){
        return next()
    }
    if(!comment){
        comment = ''
    }
}*/




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
