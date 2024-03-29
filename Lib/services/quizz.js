import { Router } from "express";
import { addQuizCategories, checkQuizCreator, deleteQuiz, getAllQuizz, getQuizById, addQuiz } from '../db.js';
import { errorHandling } from "../errorHandling.js";
import { quizz as quizzSchema } from '../validation.js'

export const unauthorizedQuizzRouter = new Router;

unauthorizedQuizzRouter.get('/quiz', async (req, res) => {
    try {
        const result = await getAllQuizz();
        res.json(result);
    } catch (err) {
        errorHandling(res, err, 'Error occurred while retrieving quizzes.', 500);
    }
});

unauthorizedQuizzRouter.get('/quiz/:id', async (req, res) => {
    try {
        const [result] = await getQuizById(req.params.id)
        res.json(result)
    } catch (err) {
        errorHandling(res, err, "Error occurred while retrieving quizzes.",500);
    }
});

export const authorizedQuizzRouter = new Router()

authorizedQuizzRouter.post('/createQuiz', async (req, res) => {
    const validationResult = quizzSchema.post.validate(req.body) 
    if(validationResult.error){
        return errorHandling(res, validationResult.error, 'Invalid input', 400)
        
    }
    const { title, color, questions, category } = req.body;
    const userId = req.user.id;

    console.log(req.body)

    try {
        const result = await addQuiz(title, color, questions, userId)
        
        const quizId = result.insertId;
        
        await addQuizCategories(category,quizId);

        const quiz = {
            id: quizId,
            title,
            color,
            questions,
            category,
        }

        res.status(200).json({ message: 'Quiz created successfully', quiz });
    } catch (err) {
        errorHandling(res, err, 'An Error occurred.', 500);
        console.log(err)
    }
});

authorizedQuizzRouter.delete('/deleteQuiz/:quizId', async (req, res) => {
    const quizId = req.params.quizId;
    const userId = req.user.id; // je m'assure que l'utilisateur est authentifié et autorise à supprimer ce quiz
    
    try {
        // Je vérifie d'abord si le quiz appartient à l'utilisateur avant de le supprimer
        const quizCheckResult =await checkQuizCreator(quizId,userId);

        if (quizCheckResult.length === 0) {
            return res.status(403).json({ message: "You don't have permission to delete this quiz." });
        }

        // Supprimez le quiz
        await deleteQuiz(quizId);
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        errorHandling(res, err, 'An error occurred.',500);
        console.log(err);
    }
});