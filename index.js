import express from 'express';
import passport from 'passport';
import cors from 'cors';
import validator from 'validator';
import jwt from "jsonwebtoken"
import { db } from './lib/db.js';
import { sessionMiddleWare } from './lib/session.js';
import { configPassport, generateToken } from './lib/passport.js';
import { hashPassword } from './lib/hashPassword.js';

const errorHandling = (res, error, errorMessage = 'An error has occurred') => {
    const errorTime = new Date().getTime();
    console.error(errorTime, error);
    res.status(500).json({ error: errorMessage, errorTime });
};

const app = express();
configPassport();
app.use(sessionMiddleWare);
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(passport.initialize());
app.use(passport.session());

app.get('/quiz', async (req, res) => {
    try {
        const [result] = await db.execute('SELECT * FROM quiz');
        res.json(result);
    } catch (err) {
        errorHandling(res, err, 'Error occurred while retrieving quizzes.');
    }
});

app.get('/quiz/:slug', async (req, res) => {
    try {
        const [result] = await db.execute('SELECT * FROM quiz WHERE slug = ?', [req.params.slug]);
        res.json(result[0]);
    } catch (err) {
        errorHandling(res, err, "Error occurred while retrieving quizzes.");
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

            const token = generateToken(user);

            return res.status(200).json({ message: 'Authentication successful', token });
        });
    })(req, res, next);
});

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    console.log(req.body)

    if (!email) {
        return res.status(400).json({ message: "L'e-mail is required" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "The email is invalid." });
    }

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "The user or email already exists." });
        }
        const hashedPassword = await hashPassword(password);
        const query = 'INSERT INTO users (username, email, password) VALUES (?,?,?)';
        const result = await db.query(query, [username, email, hashedPassword]);
        console.log(result);
    } catch (err) {
        errorHandling(res.status(500), err, "Error during registration.");
    }
    res.send({ message: 'Success' });
});

app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log('Logout error:', err);
            return res.status(500).json({ message: 'An error occured during' });
        }
    })
    return res.status(200).json({ message: 'Log-out successful.' })

});

const generateSlug = (title) => {
    const slug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .substring(0, 30);
    return slug
}

app.post('/createQuiz', async (req, res) => {
    const { title, color, questions } = req.body;

    const slug = generateSlug(title)

    try {
        const sql = `INSERT INTO quiz (title, color, questions, slug) 
                    VALUES (?, ?, ?, ?)`;

        await db.execute(sql, [title, color, questions, slug]);

        const quiz = {
            title,
            color,
            questions,
            slug,
        }

        res.status(200).json({ message: 'Quiz create successfly', quiz });
    } catch (err) {
        errorHandling(res, err, 'An Error occured.');
    }
});

app.use((req,res,next)=>{
    const token = req.header("Authorization").slice("Bearer ".length)
    const decodeur = jwt.decode(token);
    req.user = {id:decodeur.id}
    next()
})

app.get('/user', async (req,res) =>{
    try {
        const userId = req.user.id;
        console.log(userId)
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);

        if(!rows.length){
            return res.status(404).json({message: 'User not found'});
        }
        const user = rows[0];

        res.json(user);
    } catch (error) {
        console.error('Error detching user details:', error);
        res.status(500).json({ message: 'Failed to fetch user details' });
    }
})

app.listen(8800, () => {
    console.log('Connected');
});
