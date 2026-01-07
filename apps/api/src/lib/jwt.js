import jwt from "jsonwebtoken";

export function signToken(payload) {
  const secret = process.env.JWT_SECRET || "change-me";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || "change-me";
  return jwt.verify(token, secret);
}
