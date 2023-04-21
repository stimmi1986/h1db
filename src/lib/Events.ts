import { NextFunction, Request, Response } from 'express';
import { uploadImage } from '../imgs/img.js';
import { logger } from './logger.js'
import slugify from 'slugify';
import {
  conditionalUpdate,
  deleteEventBySlug,
  getEventBySlug,
  getEvents,
  insertEvent,
} from '../lib/db.js';
import jwt from "jsonwebtoken";

import {
  atLeastOneBodyValueValidator,
  eventDoesNotExistValidator,
  genericSanitizer,
  stringValidator,
  validationCheck,
  xssSanitizer,
} from '../lib/validators-event.js';
import { Event, eventMapper } from '../routes/types.js';

export async function listEvents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const event = await getEvents();
  console.error(event[0])
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
  if(!req.body.token){
    return res.status(401).json("ekki skráður inn")
  }
  const userInfo=jwt.decode(req.body.token)
  if(!userInfo||!userInfo['username']){
      return res.status(401).json('ekki skráður inn');
  }
  if(!userInfo['admin']){
    return res.status(401).json('hefur ekki heimild til að eiga við viðburði')
  }
  const { name, description } = req.body;

  const eventToCreate: Omit<Event, 'id'> = {
    name,
    slug: slugify(name, '-'),
    description,
    created: new Date,
    updated: new Date,
  };
  const createdEvent = await insertEvent(eventToCreate);
  if (!createdEvent) {
    return res.status(500).json('vandamál við að skapa viðburð');
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
  if(!req.body.token){
    return res.status(401).json("ekki skráður inn")
  }
  const userInfo=jwt.decode(req.body.token)
  if(!userInfo||!userInfo['username']){
      return res.status(401).json('ekki skráður inn');
  }
  if(!userInfo['admin']){
    return res.status(401).json('hefur ekki heimild til að eiga við viðburði')
  }
  const { slug } = req.params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return res.status(404).json('viðburður finnst ekki');
  }

  const { name, description } = req.body;
  const fields = [
    typeof name === 'string' && name ? 'name' : null,
    typeof name === 'string' && name ? 'slug' : null,
    typeof description === 'string' && description ? 'description' : null,
  ];
  const values = [
    typeof name === 'string' && name ? name : null,
    typeof name === 'string' && name ? slugify(name, '-').toLowerCase() : null,
    typeof description === 'string' && description ? description : null,
  ];
  
  try {
    const updated = await conditionalUpdate(
      'events',
      event.id,
      fields,
      values,
    );
    if (!updated) {
      return next(new Error('unable to update event'));
    }
    const updatedEvent = eventMapper(updated.rows[0]);
    return res.json(updatedEvent);
  } catch (err) {
    console.error('Error updating event:', err);
    return res.status(500).json('vandamál við að uppfæra viðburð');
  }
}

export async function deleteEvent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if(!req.body.token){
    return res.status(401).json("ekkert token")
  }
  const userInfo=jwt.decode(req.body.token)
  if(!userInfo||!userInfo['username']){
      return res.status(401).json('ekki skráður inn');
  }
  if(!userInfo['admin']){
    return res.status(401).json('hefur ekki heimild til að eiga við viðburði')
  }
  const { slug } = req.params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return res.status(404).json('viðburður ekki á skrá');
  }

  const result = await deleteEventBySlug(slug);
console.log(slug)
  if (!result) {
    return res.status(500).json('vandamál við eyðingu viðburðar');
  }

  return res.status(200).json('viðburði eytt');
}
