import express from "express";
import cors from "cors"
import { db } from "./db.js"


const app = express()

const errorHandling = (res,error,errorMessage="an error has occurred") => {
    const errorTime = new Date().getTime();
    console.error(errorTime, error);
    res.status(500).json({ error: errorMessage, errorTime })

}


app.use(express.json())
app.use(cors())


app.get("/quiz", (req, res) => {
    db.query("SELECT * FROM quiz", (err, result) => {
        if (err) {
            errorHandling(res,err,"Erreur lors de la récupération des quiz");
        } else {
            res.json(result);
        }
    })
});

app.get("/quiz/:slug", (req, res) => {
    console.log(req.params.slug)
    db.query('SELECT * FROM quiz WHERE slug = ?', [req.params.slug], (err, result) => {
        if (err) {
            errorHandling(res,err,"Erreur lors de la récupération d'un quiz");

        } else {
            res.json(result[0])
        }
    })
});




app.listen(8800, () => {
    console.log("Connected")
})