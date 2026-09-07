/** Ensures request's user is set and is "admin" role, returning 403 if not */
export default async function requireAdmin(req, res, next) {
  console.log(req.user);
  if (!req.user || req.user.role !== "admin") return res.status(403).send("Forbidden");
  next();
}
