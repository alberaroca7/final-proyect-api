import * as EmailValidator from 'email-validator';
import jwt from 'jsonwebtoken';
import { jwt_secret } from './auth.secrets.js';


/**
 * validate that the email its correct
 * ....
 * if is not correct, return error 400 bad request
 */

export const validateUser = (req, res, next) => {
    //if the propiertie email in the body request its valid then call the next middleware
    if(EmailValidator.validate(req.body.email)) {
        next(); // call next middleware
    } else {
        res.status(400).json({ error: 'Email not valid, please enter a correct format'}); //if email its not valid send a response to client in this case a 400 error 
    }
}

/**
 * Validate the token and if its valid add the email to the request
 */

export const validateAuth = (req, res, next) => {
    try {
        // obtain the email from token
        const auth = req.header('Authorization'); // return the header value
        // What structure have the header --> Bearer _token_jwt_
        const token = auth.split(' ')[1]; // obtain the token
        const payload = jwt.verify(token, jwt_secret);
        // adds atribute to request
        req.email = payload.email;
        next();

    } catch (err) {
        // the token it´s not valid or doesn´t exits
        console.error(err);
        res.sendStatus(401);
    }
}

