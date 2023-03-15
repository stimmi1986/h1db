import express, {Request, Response, NextFunction} from 'express';
import { getRegistrations } from '../lib/db.js';
import { eventsIndex, /*createEvent, specificEvent, updateEvent*/ } from '../lib/Events.js'
import { deleteRegistration, getEventRegistrations, patchRegistration } from '../lib/Registrations.js';



export const router = express.Router();

export async function Index(req: Request, res: Response) {
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


router.get('/', Index)
router.get('/event', eventsIndex)
router.get('/event/:slug',getEventRegistrations)

router.patch('/event/:slug/:username',patchRegistration)
router.delete('/event/:slug/:username',deleteRegistration)
//router.post('/event', createEvent)
//router.get('/event/:slug',specificEvent)
//router.post('/event/:slug',addRegistration)
//router.get('/event/:events/:user', registerDetails)
//router.patch('/event/:events/:user',updateRegistration)
//router.patch('/event/:slug',updateEvent)


//router.post('/login',loginCheck)
//router.get('/logout',endSession)
