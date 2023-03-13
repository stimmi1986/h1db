import express, {Request,Response,NextFunction} from 'express';

export const router = express.Router();

router.get('/events',eventIndex)
router.post('/events',createEvent)
router.get('/events/:slug',specificEvent)
router.post('/events/:slug',addRegistration)
router.get('/events/:event/:user', registerDetails)
router.patch('/events/:event/:user',updateRegistration)
router.patch('/events/:slug',updateEvent)
router.post('/login',loginCheck)

