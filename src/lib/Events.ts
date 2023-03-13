import { QueryResult } from "pg";
import slugify from 'slugify';


export type Event = {
    id: number;
    name: string;
    slug: string;
    location?:string;
    url?: string;
    description?: string;
    created: Date;
    updated: Date;
}
type importEvent = {
    name:string;
    location?:string;
    url?:string;
    description?:string;
}

export function importEventToEvent(input:unknown):Omit<Event,'id'>|null{
    const potEvent = input as Partial<importEvent> |null;
    if(!potEvent||!potEvent.name){
        return null;
    }
    const event: Omit<Event,'id'>={
        name: potEvent.name,
        slug: slugify(potEvent.name).toLowerCase(),
        url: potEvent.url? potEvent.url : undefined,
        description: potEvent.description? potEvent.description : undefined,
        created: new Date(),
        updated: new Date(),
    };
    return event

}
export function mapDbEventToEvent(input: QueryResult<Event>| null): Event | null {
    if (!input){
        return null;
    }

    return eventMapper(input);
}
export function mapDbEventsToEvents(
    input:QueryResult<Event>|null):Array<Event>{
    if (!input) {
        return [];
    }
    const mappedEvents = input?.rows.map(eventMapper);

    return mappedEvents.filter((i): i is Event=>Boolean(i));
}

function eventMapper(input: unknown): Event | null {
    const potentialEvent = input as Partial<Event> | null
    if(!potentialEvent
        ||!potentialEvent.id
        ||!potentialEvent.name
        ||!(potentialEvent.slug)
        ||!potentialEvent.created
        ||!potentialEvent.updated){
        return null;
    }

    const event: Event={
        id: potentialEvent.id,
        name: potentialEvent.name,
        slug: potentialEvent.slug,
        created: new Date(potentialEvent.created),
        updated: new Date(potentialEvent.updated),
    };

return event;
}