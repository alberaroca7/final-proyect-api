import express from "express";
import { validateUser } from './auth.middleware.js';
import { registerCtrl, validateEmailCtrl, loginCtrl } from './auth.controller.js';


const router = express.Router();

// endpoint for the user register
router.post('/register', validateUser, registerCtrl);

// endpoint for the validate user email
router.get('/validate', validateEmailCtrl);

// endpoint to the users login 
router.post('/login', loginCtrl);

export default router;