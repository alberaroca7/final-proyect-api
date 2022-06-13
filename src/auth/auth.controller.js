import jwt from 'jsonwebtoken';
import { encodePassword, generateValidationToken } from './auth.utils.js';
import { sendValidationEmail } from '../adapters/email.js';
import { jwt_secret } from './auth.secrets.js';


/**
 * 1. the register data comes to the body. We need to validate the body
 * 2. Generate users entity and saved into DDBB 
 * 3. Generate a validation token and saved into DDBB associated user
 * 4. Send email with validation URL  
 */

export const registerCtrl = async (req, res) => {
    try {
        /**
         * 1. check that email thats no exits in database final-proyect collection users
         * if so send an error message 
         * otherwise encript the password user
         */
        const user = await req.app.locals.ddbbClient.usersCol.findOne({email: req.body.email});
        if (user === null) {
            req.body.password = encodePassword(req.body.password);
            await req.app.locals.ddbbClient.usersCol.insertOne({ ...req.body, status: 'PENDING_VALIDATION' }); //step 2
            //step 3
            const token = generateValidationToken();
            await req.app.locals.ddbbClient.tokenCol.insertOne({
                token,
                user: req.body.email
            });
            //step 4
            // ¡¡¡eyes!!! that the host is the our react app
            sendValidationEmail(req.body.email, `http://localhost:3000/validate?token=${token}`);
            res.sendStatus(201);
        } else {
            // send a 409 (conflict) because user already exits on DDBB
            res.sendStatus(409);
        }

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

/**
 * 1. Obtain the token
 * 2. validate that token exits on DDBB and obtain the asociated user
 * 3. Delete the DDBB token
 * 4. Update the user chaning status to success
 */

export const validateEmailCtrl = async (req, res) => {
    const { token } = req.query; //step 1
    try {
        // check that token already exists on final proyect collection validate-token and update user status
        //otherwise send an error
        const valToken = await req.app.locals.ddbbClient.tokenCol.findOne({token});
        if (valToken !== null) { //step 2
            //token exits
            await req.app.locals.ddbbClient.tokenCol.deleteOne({ token }); //step 3
            //step 4

            // update the user status to SUCCESS
            const updateDoc = {
                $set: {
                    status: 'SUCCESS'
                },
            };
            await req.app.locals.ddbbClient.usersCol.updateOne({email: valToken.user}, updateDoc);
            res.send(200);
        } else {
            res.sendStatus(404);
        }

    } catch (err) {
        console.error(err);
    }
}


/**
 * 1. Verify that users exits with passw and have an SUCCESS status too
 *  a. encryt the body passw
 * 2. generates a JWT token
 * 3. Returns into the user
 */

export const loginCtrl = async (req, res) => {
    const { email, password } = req.body;
    // step 1
    try {
        const query = {
            email,
            password: encodePassword(password),
            status: 'SUCCESS'
        }
        const user = await req.app.locals.ddbbClient.usersCol.findOne(query);
        // the user exits with this conditions
        if (user !== null) {
            const token = jwt.sign({ email: user.email, hola: 'finalproyect' }, jwt_secret); // step 2
            res.status(201).json({ access_token: token }); // step 3
        } else {
            res.sendStatus(404);
        }

    } catch (err) {
        console.error(err);
    }
}