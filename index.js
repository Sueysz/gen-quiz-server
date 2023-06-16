import express from 'express';
import passport from 'passport';
import cors from 'cors';
import { db } from './db.js';
import { sessionMiddleWare } from './config/session.js';
import { configPassport } from './config/passport.js';
import { hashPassword } from './utils/hashPassword.js';
import validator from 'validator';

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

app.post('/login', async (req, res, next) => {
    console.log('Attempting to log in...');

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
            return res.json({ message: 'Authentication successful' });
        });
    })(req, res, next);
});


app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    console.log(req.body)

    if (!email) {
        return res.status(400).json({ message: "L'e-mail est requis" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "L'e-mail est invalide" });
    }

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "L'utilisateur ou l'e-mail existe déjà" });
        }
        const hashedPassword = await hashPassword(password);
        const query = 'INSERT INTO users (username, email, password) VALUES (?,?,?)';
        const result = await db.query(query, [username, email, hashedPassword]);
        console.log(result);
    } catch (err) {
        errorHandling(res, err, "Erreur lors de l'inscription");
    }
    res.send({ message: 'Success' });
});

app.post('/logout', (req,res) =>{
    req.logout();
    res.json({ message: 'Déconnexion réussie'});
});



app.listen(8800, () => {
    console.log('Connected');
});
