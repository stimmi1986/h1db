import { QueryResult } from "pg";
import slugify from 'slugify';
import { Event, eventsMapper } from '../routes/types'
import { NextFunction, Request,Response } from 'express';
import { getEvent, getEventBySlug } from '../lib/db'


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

export async function getEvents(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { slug } = req.params;

    const department = await getEventBySlug(slug);

    if (!department) {
        return next();
    }

    return res.json(department);
}


export function mapDbEventToEvent(input: QueryResult<Event>| null): Event | null {
    if (!input){
        return null;
    }

    return eventsMapper(input);
}
export function mapDbEventsToEvents(
    input:QueryResult<Event>|null):Array<Event>{
    if (!input) {
        return [];
    }
    const mappedEvents = input?.rows.map(eventsMapper);

    return mappedEvents.filter((i): i is Event=>Boolean(i));
}

