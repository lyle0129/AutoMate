import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (payload, res) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });

  res.cookie("jwt", token, {
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    httpOnly: true,             // prevent XSS attacks
    sameSite: "strict",         // prevent CSRF
    secure: process.env.NODE_ENV !== "development", // only send via HTTPS in production
  });

  return token;
};
