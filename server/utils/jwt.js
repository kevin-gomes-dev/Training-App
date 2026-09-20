/** Uses JWT_SECRET in .env file. Ensure this exists and is a super secret string. */

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

/** Creates a token with the given payload, expiring in 7 days. */
export function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

/** Extracts the payload from a token */
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
