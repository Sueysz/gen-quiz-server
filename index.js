import express from "express";
import passport from "passport";
import cors from "cors"
import { db } from "./db.js"
import { sessionMiddleWare } from "./config/session.js";
import { ConfigPassport } from "./passport-config.js";

const errorHandling = (res, error, errorMessage = "an error has occurred") => {
    const errorTime = new Date().getTime();
    console.error(errorTime, error);
    res.status(500).json({ error: errorMessage, errorTime })
}

const app = express()
ConfigPassport()
app.use(sessionMiddleWare)
app.use(express.json())
app.use(cors())

app.get("/quiz", (req, res) => {
    db.query("SELECT * FROM quiz", (err, result) => {
        if (err) {
            errorHandling(res, err, "Erreur lors de la récupération des quiz");
        } else {
            res.json(result);
        }
    })
});

app.get("/quiz/:slug", (req, res) => {
    console.log(req.params.slug)
    db.query('SELECT * FROM quiz WHERE slug = ?', [req.params.slug], (err, result) => {
        if (err) {
            errorHandling(res, err, "Erreur lors de la récupération d'un quiz");

        } else {
            res.json(result[0])
        }
    })
});

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.json({ message: "Authentication successful" });
        });
    })(req, res, next);
});

app.listen(8800, () => {
    console.log("Connected")
})