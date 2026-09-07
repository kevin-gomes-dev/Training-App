/** Ensures request's user is set and is "admin" role, returning 403 if not */
export default async function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") return res.status(403).send("Forbidden");
  next();
}
