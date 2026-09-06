import express from "express";
import { insertUser } from "../db/queries/users.js";
import { createToken } from "../../utils/jwt.js";
const usersRoute = express.Router();
export default usersRoute;

usersRoute.post("/register", async (req, res) => {
  console.log("Registering...");
  const user = await insertUser({
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
  });
  const token = createToken({ id: user.id });
  return res.status(201).send(token);
});

usersRoute.post("/login", async (req, res) => {
  res.status(200).send("test");
});
