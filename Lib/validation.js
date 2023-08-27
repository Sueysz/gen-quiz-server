import Joi from 'joi'

export const user = {
    post: Joi.object({
        username: Joi.string(),
        email: Joi.string().email(),
        password: Joi.string().min(4)
    })
}

export const quizz = {
    post: Joi.object({
        title: Joi.string(),
        color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/),
        questions: Joi.array().items(
            Joi.object({
                question: Joi.string(),
                solution: Joi.number().min(0).max(2).integer(),
                answers: Joi.array().min(3).max(3).items(Joi.string())
            })
        ),
        category: Joi.number().min(0).integer()
    })
}
