import session from "express-session"
import dotenv from 'dotenv'

dotenv.config();

export const sessionMiddleWare = session({
  secure: false,
  secret:process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
})

