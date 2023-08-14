import express from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from "jsonwebtoken";
import { sessionMiddleWare } from './lib/session.js';
import { configPassport} from './lib/passport.js';
import { authorizedQuizzRouter, unauthorizedQuizzRouter } from './lib/services/quizz.js';
import { authorizedUsersRouter, unauthorizedUsersRouter } from './lib/services/user.js';
import { unauthorizedCategories } from './lib/services/category.js';


const app = express();
configPassport();
dotenv.config();
app.use(sessionMiddleWare);
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
}));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(passport.initialize());
app.use(passport.session());

app.use(unauthorizedQuizzRouter);
app.use(unauthorizedUsersRouter);
app.use(unauthorizedCategories);

app.use((req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        console.log('Authorization header missing');
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.slice("Bearer ".length);
    console.log('Received token:', token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('Token expired:', error.expiredAt);
            req.logout(); // Déconnexion automatique de l'utilisateur
            return res.status(401).json({ message: "Token expired. User has been logged out." });
        } else {
            console.log('Invalid token:', error);
            return res.status(401).json({ message: "Invalid token" });
        }
    }
});

app.use(authorizedQuizzRouter);
app.use(authorizedUsersRouter);


app.listen(8800, () => {
    console.log('Connected');
});