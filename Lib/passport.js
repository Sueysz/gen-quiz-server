import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import bcrypt from "bcryptjs";
import { db } from "./db.js";
import jwt from 'jsonwebtoken';

// gérer mon authentification avec l'email 

const authenticateUser = async (email, password, done) => {
    console.log('Authenticating user...');
    try {
        const query = "SELECT * FROM users WHERE email = ?"; // recherche de l'users avec l'email reçus 
        const [rows] = await db.execute(query, [email]);

        if (!rows.length) {
            //si l'utilisateur n'est pas trouvé, renvoie une erreur
            return done(null, false, { message: "Invalid credentials" });
        }

        const user = rows[0];

        //comparaison du mot de passe fourni avec le mot de passe haché stocké dans la db
        bcrypt.compare(password, user.password, (err, isMatch) => {
            console.log('Comparing passwords...');
            console.log('isMatch:', isMatch);
            if (err) {
                return done(err);
            }
            if (!isMatch) { //vérifi si les mots de passe ne correspondent pas
                return done(null, false, { message: "Invalid credentials" });
            }

            return done(null, user);
        });
    } catch (error) {
        return done(error);
    }
};

//converti l'objet user et renvoie son id
const serializeUser = (user, done) => {
    console.log('Serializing user...');
    done(null, user.id);
};

//Reçois l'id de l'user et cherche les données de l'user dans la db puis renvoie l'objet 
const deserializeUser = async (id, done) => {
    console.log('Deserializing user...');
    try {
        const query = "SELECT * FROM users WHERE id = ?";
        const [rows] = await db.execute(query, [id]);

        if (!rows.length) {
            throw new Error("User not found");
        }

        const user = rows[0];
        return done(null, user);
    } catch (error) {
        return done(error);
    }
};

// Fonction pour générer un token JWT à partir de l'objet user
export const generateToken = (user) => {

    const payload = {
        id: user.id,
    };
    console.log(payload)

    // Génère un token JWT signé avec la clé secrète process.env.JWT_SECRET elle est configurée pour expirer dans une heure
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    return token;
}

//configuration de passport 
export const configPassport = () => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);
};
