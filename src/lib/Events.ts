import { NextFunction, Request, Response } from 'express';
import slugify from 'slugify';
import {
  conditionalUpdate,
  deleteEventBySlug,
  getEventBySlug,
  getEvents,
  insertEvent,
} from '../lib/db';

import {
  atLeastOneBodyValueValidator,
  eventDoesNotExistValidator,
  genericSanitizer,
  stringValidator,
  validationCheck,
  xssSanitizer,
} from '../lib/validators-event';
import { Event, eventMapper } from '../routes/types';

export async function listEvents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const event = await getEvents();

  if (!event) {
    return next(new Error('unable to get event'));
  }

  return res.json(event);
}

export async function getEvent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;

  const event = await getEventBySlug(slug);

  if (!event) {
    return next();
  }

  return res.json(event);
}

export async function createEventHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name, description } = req.body;

  const eventToCreate: Omit<Event, 'id'> = {
    name,
    slug: slugify(name),
    description,
    created: new Date,
    updated: new Date,
  };

  const createdEvent = await insertEvent(eventToCreate);
console.log(createdEvent)
  if (!createdEvent) {
    return next(new Error('unable to create department'));
  }

  return res.status(201).json(createdEvent);
}

export const createEvent = [
  stringValidator({ field: 'name', maxLength: 64 }),
  stringValidator({
    field: 'description',
    valueRequired: false,
    maxLength: 1000,
  }),
  eventDoesNotExistValidator,
  xssSanitizer('name'),
  xssSanitizer('description'),
  validationCheck,
  genericSanitizer('name'),
  genericSanitizer('description'),
  createEventHandler,
];

export const updateEvent = [
  stringValidator({ field: 'name', maxLength: 64, optional: true }),
  stringValidator({
    field: 'description',
    valueRequired: false,
    maxLength: 1000,
    optional: true,
  }),
  atLeastOneBodyValueValidator(['name', 'description']),
  xssSanitizer('name'),
  xssSanitizer('description'),
  validationCheck,
  updateEventHandler,
];

export async function updateEventHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return next();
  }

  const { name, description } = req.body;

  const fields = [
    typeof name === 'string' && name ? 'name' : null,
    typeof name === 'string' && name ? 'slug' : null,
    typeof description === 'string' && description ? 'description' : null,
  ];

  const values = [
    typeof name === 'string' && name ? name : null,
    typeof name === 'string' && name ? slugify(name).toLowerCase() : null,
    typeof description === 'string' && description ? description : null,
  ];

  const updated = await conditionalUpdate(
    'event',
    event.id,
    fields,
    values,
  );

  if (!updated) {
    return next(new Error('unable to update event'));
  }

  const updatedEvent = eventMapper(updated.rows[0]);
  return res.json(updatedEvent);
}

export async function deleteEvent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;
  const event = await getEventBySlug(slug);
console.log(slug) 
  if (!event) {
    return next();
  }

  const result = await deleteEventBySlug(slug);
console.log(slug)
  if (!result) {
    return next(new Error('unable to delete event'));
  }

  return res.status(204).json({});
}
