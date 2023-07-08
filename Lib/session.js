import session from "express-session";

export const sessionMiddleWare = session({
  secure: false,
  secret:process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
})

