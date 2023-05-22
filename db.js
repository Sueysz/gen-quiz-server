import dotenv from 'dotenv';
import mysql from 'mysql';

dotenv.config();
export const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset:"utf8mb4"
});

db.connect((err)=>{
    if(err){
        console.error('Erreur de connexion à la base de données MySQL :', err);
    } else {
        console.log('Connecté à la base de données MySQL');
    }
});