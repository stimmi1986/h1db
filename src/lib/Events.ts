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
  const { name, description } = req.body;

  const eventToCreate: Omit<Event, 'id'> = {
    name,
    slug: slugify(name, '-'),
    description,
    image: '',
    created: new Date,
    updated: new Date,
  };

  const createdEvent = await insertEvent(eventToCreate);
  console.log(createdEvent)
  if (!createdEvent) {
    return next(new Error('unable to create Event'));
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

  let image;
  try {
    const imagePath: any = "";

    const uploadResult = await uploadImage(imagePath);
    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('no secure_url from cloudinary upload');
    }
    image = uploadResult.secure_url;
  } catch (e) {
    logger.error('Unable to upload file to cloudinary', e);
    return res.status(500).end();
  }
  const imagePath: any = "";

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
  if (imagePath) {
    let image;
    try {
      const uploadResult = await uploadImage(imagePath);
      if (!uploadResult || !uploadResult.secure_url) {
        throw new Error('no secure_url from cloudinary upload');
      }
      image = uploadResult.secure_url;
    } catch (e) {
      logger.error('Unable to upload file to cloudinary', e);
      return res.status(500).end();
    }

    fields.push('image');
    values.push(image);
  }
 
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
    return next(new Error('unable to update event'));
  }
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
