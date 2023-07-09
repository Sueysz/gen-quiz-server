import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import bcrypt from "bcryptjs";
import { db } from "./db.js";
import jwt from 'jsonwebtoken';

const authenticateUser = async (email, password, done) => {
    console.log('Authenticating user...');
    try {
        const query = "SELECT * FROM users WHERE email = ?";
        const [rows] = await db.execute(query, [email]);

        if (!rows.length) {
            return done(null, false, { message: "Invalid credentials" });
        }

        const user = rows[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            console.log('Comparing passwords...');
            console.log('isMatch:', isMatch);
            if (err) {
                return done(err);
            }
            if (!isMatch) {
                return done(null, false, { message: "Invalid credentials" });
            }

            return done(null, user);
        });
    } catch (error) {
        return done(error);
    }
};

const serializeUser = (user, done) => {
    console.log('Serializing user...');
    done(null, user.id);
};

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


export const generateToken = (user) => {

    const payload = {
        id: user.id,
    };
    console.log(payload)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    return token;
}

export const configPassport = () => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);
};
