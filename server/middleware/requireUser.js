/** Ensures the request user is set, returning status 401 if not */
export default async function requireUser(req, res, next) {
  if (!req.user) return res.status(401).send("Unauthorized");
  next();
}
