import express from "express";
import cors from "cors"
import { db }  from "./db.js"
const app = express()


app.use(express.json())
app.use(cors())

app.get("/quiz", (req, res) => {
    db.query("SELECT * FROM quiz", (err, result) => {
        if (err) {
            // Gérez l'erreur de requête à la base de données
            console.error(err);
            res.status(500).json({ error: "Erreur lors de la récupération des quiz" });
        } else {

            // Envoyer la liste des quiz en réponse
            res.json(result);
        }
    })
});

app.get("/quiz/:slug", (req,res)=>{
    console.log(req.params.slug)
    db.query(`SELECT * FROM quiz WHERE slug = '${req.params.slug}'`,(err,result)=>{
        if(err){
            console.error(err);
            res.status(500).json({ error: "Erreur lors de la récupération d'un quiz"})
        } else {
            res.json(result[0])
        }
    })
})


app.listen(8800, () => {
    console.log("Connected")
})