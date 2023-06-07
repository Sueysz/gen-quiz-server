import express from 'express';
import passport from 'passport';
import cors from 'cors';
import { db } from './db.js';
import { sessionMiddleWare } from './config/session.js';
import { configPassport } from './config/passport.js';
import { hashPassword } from './utils/hashPassword.js';

const errorHandling = (res, error, errorMessage = 'An error has occurred') => {
    const errorTime = new Date().getTime();
    console.error(errorTime, error);
    res.status(500).json({ error: errorMessage, errorTime });
};

const app = express();
configPassport();
app.use(sessionMiddleWare);
app.use(express.json());
app.use(cors());

app.get('/quiz', async (req, res) => {
    try {
        const [result] = await db.execute('SELECT * FROM quiz');
        res.json(result);
    } catch (err) {
        errorHandling(res, err, 'Erreur lors de la récupération des quiz');
    }
});

app.get('/quiz/:slug', async (req, res) => {
    try {
        const [result] = await db.execute('SELECT * FROM quiz WHERE slug = ?', [req.params.slug]);
        res.json(result[0]);
    } catch (err) {
        errorHandling(res, err, "Erreur lors de la récupération d'un quiz");
    }
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.json({ message: 'Authentication successful' });
        });
    })(req, res, next);
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)

    try {
        const hashedPassword = await hashPassword(password);
        const query = 'INSERT INTO users (username, password) VALUES (?,?)';
        const result = await db.execute(query, [username, hashedPassword]);

        if (result.affectedRows === 1) {
            res.json({ message: 'Registration successful' });
        } else {
            throw new Error('Failed to register user');
        }
    } catch (err) {
        errorHandling(res, err, "Erreur lors de l'inscription");
    }
});

app.listen(8800, () => {
    console.log('Connected');
});
