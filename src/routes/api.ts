import express, {Request, Response, NextFunction} from 'express';

export const router = express.Router();
// setti þetta upp eins og í verk3 en
// spurning hvort við köllum þetta einhvað annað en events og event 
export async function eventsIndex(req: Request, res: Response) {
    return res.json([
      {
        href: '/events',
        methods: ['GET', 'POST'],
      },
      {
        href: '/events/:slug',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
      {
        href: '/events/:slug/event',
        methods: ['GET', 'POST'],
      },
      {
        href: '/events/:slug/event/:user',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
    ]);
}


router.get('/', eventsIndex)
/*
router.post('/events',createEvent)
router.get('/events/:slug',specificEvent)
router.post('/events/:slug',addRegistration)
router.get('/events/:event/:user', registerDetails)
router.patch('/events/:event/:user',updateRegistration)
router.patch('/events/:slug',updateEvent)


router.post('/login',loginCheck)
router.get('/logout',endSession)
*/
