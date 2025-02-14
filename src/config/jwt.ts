import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
import { Response } from "express";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret" ;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const generateToken = (
  user: { email: any},

  res: Response
) => {
  const token = jwt.sign({ user }, JWT_SECRET, {
    expiresIn: "8h",
  });

  res.cookie("jwt", token, {
    maxAge: 8 * 60 * 60 * 1000,
    // httpOnly: true,
  });
  return token;
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
