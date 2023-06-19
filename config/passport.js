import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import bcrypt from "bcryptjs";
import { db } from "../Lib/db.js";
import jwt from 'jsonwebtoken';

const authenticateUser = (email, password, done) => {
    console.log('Authenticating user...');
    const query = "SELECT * FROM users WHERE email = ?";
    db.execute(query, [email])
        .then(([rows]) => {
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
        })
        .catch((error) => {
            return done(error);
        });
};

const serializeUser = (user, done) => {
    console.log('Serializing user...');
    done(null, user.id);
};

const deserializeUser = (id, done) => {
    console.log('Deserializing user...');
    const query = "SELECT * FROM users WHERE id = ?";
    db.execute(query, [id])
        .then(([rows]) => {
            if (!rows.length) {
                throw new Error("User not found");
            }
            const user = rows[0];
            return done(null, user);
        })
        .catch((error) => {
            return done(error);
        });
};

export const generateToken = (user) => {

    const payload = {
        id: user.id,
        email: user.email,
    };
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
