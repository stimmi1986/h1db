import express, {Request, Response} from 'express';
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from '../lib/Events';

export const router = express.Router();

export async function index(req: Request, res: Response) {
    return res.json([
      {
        href: '/event',
        methods: ['GET', 'POST'],
      },
      {
        href: '/event/:slug',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
      {
        href: '/event/:slug/events',
        methods: ['GET', 'POST'],
      },
      {
        href: '/event/:slug/events/:user',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
    ]);
}


router.get('/', index) // virkar 
router.get('/event', listEvents); // virkar 
router.post('/event', createEvent); // á að virka ?????
router.get('/event/:slug', getEvent); // virkar
router.patch('/event/:slug', updateEvent); // á að virka ????
router.delete('/event/:slug', deleteEvent); // virkar en ekki sem er með id 1 


//router.get('/event', eventsIndex)
//router.post('/event', createEvent)
//router.get('/event/:slug',specificEvent)
//router.post('/event/:slug',addRegistration)
//router.get('/event/:events/:user', registerDetails)
//router.patch('/event/:events/:user',updateRegistration)
//router.patch('/event/:slug',updateEvent)


//router.post('/login',loginCheck)
//router.get('/logout',endSession)

