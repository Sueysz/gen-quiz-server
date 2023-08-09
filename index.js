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
        const [result] = await db.execute('SELECT id,title,color FROM quiz');
        res.json(result);
    } catch (err) {
        errorHandling(res, err, 'Error occurred while retrieving quizzes.');
    }
});

app.get('/quiz/:id', async (req, res) => {
    try {
        const [result] = await db.execute('SELECT id,questions,color,title FROM quiz WHERE id = ?', [req.params.id]);
        res.json(result[0]);
    } catch (err) {
        errorHandling(res, err, "Error occurred while retrieving quizzes.");
    }
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

app.get('/categories', async (req,res) =>{
    try{
        const categoriesId = req.body;
        console.log(categoriesId)
        const [rows] = await db.execute('SELECT id,name FROM categories',[categoriesId]);

        if(!rows.length){
            return res.status(404).json({message:'categories not found'});
        }
        const categories = rows;
        res.json(categories);
    } catch (err){
        errorHandling(res, err, 'Failed to fectch categories');
    }
})

app.post('/addQuizToCategory', async (req,res) =>{
    const { categoryId, quizId } = req.body;
    console.log(categoryId, quizId);
    try{
        await db.execute('INSERT INTO categories_quiz (category_id, quiz_id) VALUES (?, ?)',[categoryId, quizId]);
        console.log('Relation added successfully');
        res.status(200).json({ message: 'Relation added successfully'});
    } catch (err){
        errorHandling(res, err, 'Error while inserting into categories_quiz table:', err);
    }
})



app.get('/quiz_categories', async (req,res) =>{
    try{
        const quizCategoriesId = req.body;
        console.log(quizCategoriesId)
        const [rows] = await db.execute('SELECT * FROM categories_quiz',[quizCategoriesId]);

        if(!rows.length){
            return res.status(404).json({message:'categories not found'});
        }
        const quizCategories = rows;
        res.json(quizCategories);
    } catch (err){
        errorHandling(res, err,'Failed to fetch categories_quiz');
    }
})

app.post('/login', async (req, res, next) => {
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

app.use((req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        console.log('Authorization header missing');
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.slice("Bearer ".length);
    console.log('Received token:', token); // Ajoutez cette ligne

    try {
        const decodeur = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decodeur.id };
        next();
    } catch (error) {
        console.log('Invalid token:', error); // Ajoutez cette ligne
        return res.status(401).json({ message: "Invalid token" });
    }
});

app.get('/user', async (req,res) =>{
    try {
        const userId = req.user.id;
        console.log(userId)
        const [rows] = await db.execute('SELECT id,username,email FROM users WHERE id = ?', [userId]);

        if(!rows.length){
            return res.status(404).json({message: 'User not found'});
        }
        const user = rows[0];
        user.password = undefined;
        res.json(user);
    } catch (err) {
        errorHandling(res, err, 'Failed to fecht user');
    }
})

app.post('/createQuiz', async (req, res) => {
    const { title, color, questions, category } = req.body;
    const userId = req.user.id;

    console.log(req.body)

    try {
        const query = `INSERT INTO quiz (title, color, questions, userId) 
                    VALUES (?, ?, ?, ?)`;

        const [result] = await db.execute(query, [title, color, JSON.stringify(questions),userId]);
        const quizId = result.insertId;
        
        await db.execute('INSERT INTO categories_quiz (category_id, quiz_id) VALUES (?, ?)', [category, quizId]);

        const quiz = {
            id: quizId,
            title,
            color,
            questions,
            category_id: category,
        }

        res.status(200).json({ message: 'Quiz created successfully', quiz });
    } catch (err) {
        errorHandling(res, err, 'An Error occurred.');
        console.log(err)
    }
});

app.listen(8800, () => {
    console.log('Connected');
});