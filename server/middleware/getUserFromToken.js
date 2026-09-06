import { getToken } from "../utils/jwt.js";
export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");
  // If none found, simply go next, the req.user being undefined
  if (!authorization || !authorization.startswith("Bearer ")) return next();
  const token = authorization.split(" ")[1];
  try {
    const { id } = getToken();
    const user = await getUserById({ id });
    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send("Invalid token");
  }
}
