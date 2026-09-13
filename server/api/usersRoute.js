import express from "express";
import { getUserByUsername, getUserIdByUsername, insertUser } from "../db/queries/users.js";
import { createToken } from "../../server/utils/jwt.js";
import {
  getUserMessage,
  getUserMessages,
  getUserSentMessages,
  insertMessage,
} from "../db/queries/messages.js";
import requireUser from "../middleware/requireUser.js";
import requireBody from "../middleware/requireBody.js";
const usersRoute = express.Router();
export default usersRoute;

usersRoute.post("/register", requireBody(["username", "password"]), async (req, res) => {
  const user = await insertUser({
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
  });
  return res.status(201).send(createToken({ id: user.id }));
});

usersRoute.post("/login", requireBody(["username", "password"]), async (req, res) => {
  const user = await getUserByUsername({
    username: req.body.username,
    password: req.body.password,
  });
  if (!user) return res.status(401).send("Invalid credentials.");
  req.user = user;
  return res.status(200).send(createToken({ id: user.id }));
});

usersRoute.use(requireUser);

// Will either get sent messages or messages sent to user depending on body
usersRoute.get("/messages", async (req, res) => {
  if (req.query.sent)
    return res.status(200).send(await getUserSentMessages({ userId: req.user.id }));
  return res.status(200).send(await getUserMessages({ userId: req.user.id }));
});

usersRoute.get("/messages/:messageId", async (req, res) => {
  return res
    .status(200)
    .send(await getUserMessage({ messageId: req.params.messageId, userId: req.user.id }));
});

usersRoute.use(requireBody(["username"]), async (req, res, next) => {
  const toUserId = await getUserIdByUsername({ username: req.body.username });
  if (!toUserId) return res.status(404).send("Receiving user doesn't exist");
  req.toUserId = toUserId;
  next();
});

// To send a message, body has message and username to send to
usersRoute.post("/messages", requireBody(["message", "username"]), async (req, res) => {
  const message = {
    messageText: req.body.message,
    date: new Date().toISOString(),
    fromUserId: req.user.id,
    toUserId: req.toUserId,
  };
  console.log(message);
  return res.status(201).send(await insertMessage(message));
});
