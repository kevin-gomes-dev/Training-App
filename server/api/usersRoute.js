import express from "express";
import { getUserByUsername, insertUser } from "../db/queries/users.js";
import { createToken } from "../../server/utils/jwt.js";
const usersRoute = express.Router();
export default usersRoute;

usersRoute.post("/register", async (req, res) => {
  const user = await insertUser({
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
  });
  return res.status(201).send(createToken({ id: user.id }));
});

usersRoute.post("/login", async (req, res) => {
  const user = await getUserByUsername({
    username: req.body.username,
    password: req.body.password,
  });
  if (!user) return res.status(401).send("Invalid credentials.");
  req.user = user;
  return res.status(200).send(createToken({ id: user.id }));
});
