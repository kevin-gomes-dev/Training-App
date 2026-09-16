/** Gets a user given a JWT token, setting req.user for future requests. */

import { verifyToken } from "../utils/jwt.js";
import { getUserById } from "../db/queries/users.js";
export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");
  // If none found, simply go next, the req.user being undefined
  if (!authorization || !authorization.startsWith("Bearer ")) return next();
  const token = authorization.split(" ")[1];

  // Verify token, getting the id of the user, then try to get the user.
  try {
    const { id } = verifyToken(token);
    const user = await getUserById({ id });
    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send("Invalid token");
  }
}
