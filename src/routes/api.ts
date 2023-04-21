import express, {Request, Response} from 'express';
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from '../lib/Events.js';

import { getRegistrations } from '../lib/db.js';

import {getRegistration,postRegistration, deleteRegistration, getEventRegistrations, patchRegistration } from '../lib/Registrations.js';
import { createUser, findByUsername, getStandardNameOfUser, getUsernames } from '../lib/Users.js';
import passport, { authMiddleware, isUser, signOut } from '../lib/login.js';
import { addImage, addImageToEvent, getImage,getEventImages, getEventImage, removeImageFromEvent, getImages, deleteImage } from '../lib/imgapi.js';



export const router = express.Router();

export async function index(req:Request, res: Response) {
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
        response:['200 OK','400 Bad Request','401 Unauthorized','404 not found','500 server side error']
      },
      {
        href: '/login',
        methods: ['POST'],
        response: ["200 OK", "400 Bad request", "401 Unauthorized"],
      },
      {
        href: '/logout',
        methods: ['POST'],
        response: ["200 OK"]
      },
      {
        href: '/signup',
        methods: ['POST'],
      },
      {
        href:'/event/:slug/img',
        methods: ['GET - all images related to event','POST - add image from imagebase to event with its name']
      },
      {
        href:'/event/:slug/img/:image',
        methods: ['GET - get this particular image if it in the event','DELETE - remove the image from this event']
      },
      {
        href:'/image',
        methods: ['GET - get all imagesgi','POST - add image to database']
      },
      {
        href:'/image/:image',
        methods: ['GET - get specific image','DELETE - fully remove image and references to it.']
      }
      
    ]);
}


router.get('/', index) // virkar 
router.get('/event', listEvents); // virkar 
router.post('/event', createEvent); // virkar
router.get('/event/:slug', getEvent); // virkar
router.patch('/event/:slug', updateEvent); // virkar
router.delete('/event/:slug', deleteEvent); // virkar en ekki sem er með id 1 


router.get('/event/:slug/img',getEventImages)
router.post('/event/:slug/img',addImageToEvent)
router.get('/event/:slug/img/:image',getEventImage)
router.delete('/event/:slug/img/:image',removeImageFromEvent)

router.get('/image',getImages)
router.post('/image',addImage)
router.get('/image/:image', getImage)
router.delete('/image/:image',deleteImage)

//router.delete('/event/:slug/img/:image',delImage)

router.get('/event/:slug/regis',getEventRegistrations);
router.patch('/event/:slug/regis/:username',patchRegistration);
router.get('/event/:slug/regis/:username',getRegistration);
router.delete('/event/:slug/regis/:username',deleteRegistration);
router.post('/event/:slug',postRegistration);
//router.get('/event/:events/:user', registerDetails)
//router.patch('/event/:eventss/:user',updateRegistration)

router.post('/login', passport.authenticate("local", {session: false}), authMiddleware);
router.post('/signup', createUser);
router.post('/logout',signOut);
router.post('/usernames',getUsernames);
router.get('/users/:user',getStandardNameOfUser)
//router.post('/login',loginCheck)
//router.get('/logout',endSession)

