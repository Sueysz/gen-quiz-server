import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import bcrypt from "bcryptjs";
import { db } from "../db.js";

const authenticateUser = (username, password, done) => {
    const query = "SELECT * FROM users WHERE username = ?";
    db.execute(query, [username])
        .then(([rows]) => {
            if (!rows.length) {
                return done(null, false, { message: "Invalid credentials" });
            }
            const user = rows[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
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
    done(null, user.id);
};

const deserializeUser = (id, done) => {
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

export const configPassport = () => {
    passport.use(new LocalStrategy(authenticateUser));
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);
};
