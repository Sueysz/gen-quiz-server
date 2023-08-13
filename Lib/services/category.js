import { Router } from "express";
import { addQuizToCategory, getAllCategories, listQuizCategories } from "../db.js";
import { errorHandling } from "../errorHandling.js";

export const unauthorizedCategories = new Router

unauthorizedCategories.get('/categories', async (req,res) =>{
    try{
        const categoriesId = req.body;
        const [result] = await getAllCategories(categoriesId);

        if(!result.length){
            return res.status(404).json({message:'categories not found'});
        }
        const categories = result;
        res.json(categories);
    } catch (err){
        errorHandling(res, err, 'Failed to fectch categories');
    }
});

unauthorizedCategories.post('/addQuizToCategory', async (req,res) =>{
    const { categoryId, quizId } = req.body;
    console.log("categories & quizId:id"+categoryId, quizId);
    try{
        await addQuizToCategory(categoryId, quizId);
        console.log('Relation added successfully');
        res.status(200).json({ message: 'Relation added successfully'});
    } catch (err){
        errorHandling(res, err, 'Error while inserting into categories_quiz table:', err);
    }
});

unauthorizedCategories.get('/quiz_categories', async (req,res) =>{
    try{
        const quizCategoriesId = req.body;
        const [result] = await listQuizCategories(quizCategoriesId);

        if(!result.length){
            return res.status(404).json({message:'categories not found'});
        }
        const quizCategories = result;
        res.json(quizCategories);
    } catch (err){
        errorHandling(res, err,'Failed to fetch categories_quiz');
    }
})