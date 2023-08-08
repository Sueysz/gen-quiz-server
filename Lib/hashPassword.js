import bcrypt from "bcryptjs"

//crypt les password que l'on m'envois 
export const hashPassword = async (password) => {
    if (!password) {
        throw new Error('Password is required');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};
