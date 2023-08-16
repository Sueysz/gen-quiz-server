import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

//connection à ma db 
export const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset: 'utf8mb4',
});

export const getAllQuizz = async () => {
    try {
        const [result] = await db.execute('SELECT id,title,color FROM quiz');
        return result;
    } catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const getQuizById = async (id) => {
    try {
        const [result] = await db.execute('SELECT id,questions,color,title FROM quiz WHERE id = ?', [id]);
        return result;
    } catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const checkUsersExistance = async (username, email) => {
    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser.length > 0) {
            return true;
        }
        return false

    } catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const addUser = async (username, email, hashedPassword) => {
    try {
        const query = 'INSERT INTO users (username, email, password) VALUES (?,?,?)';
        const result = await db.query(query, [username, email, hashedPassword]);
        return result
    } catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const getAllCategories = async (categoriesId) =>{
    try{
        const result = await db.execute('SELECT id,name FROM categories',[categoriesId])
        return result 
    } catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const addQuizToCategory = async (categoryId, quizId) => {
    try{
        await db.execute('INSERT INTO categories_quiz (category_id, quiz_id) VALUES (?, ?)',[categoryId, quizId]);
    } catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const listQuizCategories = async (quizCategoriesId) => {
    try{
        const result = await db.execute('SELECT * FROM categories_quiz',[quizCategoriesId]);
        return result
    } catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const listUsers = async(userId) =>{
    try{
        const result = await db.execute('SELECT id,username,email FROM users WHERE id = ?', [userId]);
        return result
    } catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const allQuizCreator = async (userId) =>{
    try{
        const result = await db.execute('SELECT * FROM quiz WHERE creator_id = ?', [userId]);
        return result
    } catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const addQuiz = async (title, color, questions, userId) => {
    try{
        const query = `INSERT INTO quiz (title, color, questions, creator_id) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(query, [title, color, JSON.stringify(questions),userId]);
        return result
    } catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const addQuizCategories = async (category, quizId) =>{
    try{
        await db.execute('INSERT INTO categories_quiz (category_id, quiz_id) VALUES (?, ?)', [category, quizId]);
    }catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const checkQuizCreator = async (quizId, userId) => {
    try{
        const [quizCheckResult] = await db.execute(`SELECT * FROM quiz WHERE id = ? AND creator_id = ?`, [quizId, userId]);
        return quizCheckResult
    }catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};

export const deleteQuiz = async (quizId) =>{
    try{
        await db.execute(`DELETE FROM quiz WHERE id = ?`, [quizId]);
    }catch (err) {
        console.error("DB Error", err)
        throw err;
    }
};


console.log('Connected to the MySQL database');
