import bcrypt from "bcrypt"

export const hashPassword = (password) => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};