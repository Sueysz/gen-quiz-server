import { Router } from "express";
import validator from 'validator';
import passport from 'passport';
import { addUser, allQuizCreator, checkUsersExistance, listUsers } from "../db.js";
import {hashPassword} from "../hashPassword.js"
import { errorHandling } from "../errorHandling.js";
import { generateToken } from "../passport.js";

export const unauthorizedUsersRouter = new Router

unauthorizedUsersRouter.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    console.log("req.body:register"+req.body)

    if (!email) {
        return res.status(400).json({ message: "L'e-mail is required" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "The email is invalid." });
    }

    try {
        const existingUser = await checkUsersExistance()
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "The user or email already exists." });
        }
        const hashedPassword = await hashPassword(password);
        const result = await addUser(username, email, hashedPassword)
        console.log("result:"+result);
    } catch (err) {
        errorHandling(res, err, "Error during registration.");
    }
    res.send({ message: 'Success' });
});

unauthorizedUsersRouter.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log('Logout error:', err);
            return res.status(500).json({ message: 'An error occured during' });
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
            return next(err);
        }
        if (!user) {
            console.log('Invalid credentials');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log('Login error:', err);
                return next(err);
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
            return res.status(404).json({message: 'User not found'});
        }
        const user = resultUsers[0];
        user.password = undefined;

        const [resultQuizCreator] =await allQuizCreator(userId)
        const userQuiz = resultQuizCreator
        console.log(userQuiz)
        res.json({user, quiz: userQuiz});
    } catch (err) {
        errorHandling(res, err, 'Failed to fetch user');
    }
})