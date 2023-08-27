import { Router } from "express";
import validator from 'validator';
import passport from 'passport';
import { addUser, allQuizCreator, checkUsersExistance, listUsers } from "../db.js";
import {hashPassword} from "../hashPassword.js"
import { errorHandling } from "../errorHandling.js";
import { generateToken } from "../passport.js";
import { user as userSchema } from '../validation.js'

export const unauthorizedUsersRouter = new Router

unauthorizedUsersRouter.post('/register', async (req, res) => {
    const validationResult = userSchema.post.validate(req.body) 
    if(validationResult.error){
        return errorHandling(res, validationResult.error, 'Invalid input', 400)
        
    }

    const { username, password, email } = req.body;
    console.log("req.body:register"+req.body)

    if (!email) {
        return errorHandling(res, "L'e-mail is required", 400);
    }

    if (!validator.isEmail(email)) {
        return errorHandling(res, "The email is invalid.", 400);
    }

    try {
        const existingUser = await checkUsersExistance()
        if (existingUser.length > 0) {
            return errorHandling(res, "The user or email already exists.", 409);
        }
        const hashedPassword = await hashPassword(password);
        const result = await addUser(username, email, hashedPassword)
        console.log("result:"+result);
    } catch (err) {
        if(err.code && err.code === 'ER_DUP_ENTRY'){
            return errorHandling(res, err, "duplicate value.", 409);
        }
        return errorHandling(res, err, "Error during registration.", 500);
    }
    res.send({ message: 'Success' });
});

unauthorizedUsersRouter.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log('Logout error:', err);
            return errorHandling(res, 'An error occured during', 500);
        }
    })
    return res.status(200).json({ message: 'Log-out successful.' })

});

unauthorizedUsersRouter.post('/login', async (req, res, next) => {
    console.log('Attempting to log in...');

    //utilisation du middleware d'authentification de passport pour vérifier les information de connexion
    await passport.authenticate('local', (err, user) => {
        if (err) {
            console.log('Passport authentication error:', err);
            return errorHandling(res, 'authentication error',err,500);
        }
        if (!user) {
            console.log('Invalid credentials');
            return errorHandling(res, 'Invalid credentials',err, 401);
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log('Login error:', err);
                return errorHandling(res, 'Invalid credentials', err, 500);
            }
            console.log('Authentication successful');

            const token = generateToken(user);

            return res.status(200).json({ message: 'Authentication successful', token });
        });
    })(req, res, next);
});

export const authorizedUsersRouter = new Router

authorizedUsersRouter.get('/user', async (req,res) =>{
    try {
        const userId = req.user.id;
        console.log(userId)
        const [resultUsers] = await listUsers(userId)

        if(!resultUsers.length){
            return errorHandling(res, 'User not found', 404);
        }
        const user = resultUsers[0];
        user.password = undefined;

        const [resultQuizCreator] =await allQuizCreator(userId)
        const userQuiz = resultQuizCreator
        console.log(userQuiz)
        res.json({user, quiz: userQuiz});
    } catch (err) {
        errorHandling(res, err, 'Failed to fetch user',500);
    }
})