/** Handles the /users endpoint. Note logging in and registering do not require a user, all others do. Some require admin. */

import express from "express";
import {
  deleteUser,
  getUserByUsername,
  getUserIdByUsername,
  insertUser,
  updateUser,
} from "../db/queries/users.js";
import { createToken } from "../../server/utils/jwt.js";
import {
  deleteMessageById,
  deleteUserMessage,
  getMessageById,
  getUserMessages,
  getUserSentMessages,
  insertMessage,
  updateMessageById,
} from "../db/queries/messages.js";
import requireUser from "../middleware/requireUser.js";
import requireBody from "../middleware/requireBody.js";
import requireAdmin from "../middleware/requireAdmin.js";
const usersRoute = express.Router();
export default usersRoute;

/** Creates a user. Requires unique username and any password. Allows for optional role. Returns the token with userId as payload. */
usersRoute.post("/register", requireBody(["username", "password"]), async (req, res) => {
  const user = await insertUser({
    ...req.body,
  });
  return res.status(201).send(createToken({ id: user.id }));
});

/** Creates a token with Bearer auth upon correct username and password. */
usersRoute.post("/login", requireBody(["username", "password"]), async (req, res) => {
  const user = await getUserByUsername({
    ...req.body,
  });
  if (!user) return res.status(401).send("Invalid credentials.");
  req.user = user;
  return res.status(200).send(createToken({ id: user.id }));
});

/** For all endpoints, need to be logged in. */
usersRoute.use(requireUser);

/** For all endpoints that have an id, require user and validate the user id is the logged in user.
 * Note we have access to req.user for the logged in user. If admin, allow access. */
usersRoute.param("id", async (req, res, next) => {
  if (req.user.id !== Number(req.params.id) && req.user.role !== "admin")
    return res.status(403).send("Unauthorized access to this user.");
  next();
});

/** Admin only - Updates a user's info, such as username and password. */
usersRoute.put("/:id", requireAdmin, requireBody(["username", "password"]), async (req, res) => {
  return res.status(200).send(
    await updateUser({
      id: req.user.id,
      ...req.body,
    }),
  );
});

/** Admin only - Deletes a user. */
usersRoute.delete("/:id", requireAdmin, async (req, res) => {
  return res.status(204).send(await deleteUser({ id: req.params.id }));
});

/** Will either get sent or received messages for user depending on query.
 * To get sent messages, append ?sent=true or any value equating to true in the URL
 */
usersRoute.get("/:id/messages", async (req, res) => {
  if (req.query.sent)
    return res.status(200).send(await getUserSentMessages({ userId: req.user.id }));
  return res.status(200).send(await getUserMessages({ userId: req.user.id }));
});

/** For any route using a message id, need to confirm it exists and linked to user.
 * Gives us access to req.message */
usersRoute.param("messageId", async (req, res, next) => {
  const message = await getMessageById({ id: req.params.messageId });
  if (!message) return res.status(404).send("Message not found.");
  if (req.user.id !== message.from_user_id && req.user.id !== message.to_user_id)
    return res.status(403).send("User is not involved with message.");
  req.message = message;
  next();
});

/** Will get a specific message sent either from or to the user. */
usersRoute.get("/:id/messages/:messageId", async (req, res) => {
  return res.status(200).send(req.message);
});

/** Will update a specific message the user has sent. */
usersRoute.put("/:id/messages/:messageId", requireBody(["message"]), async (req, res) => {
  if (req.message.from_user_id !== req.user.id)
    return res.status(403).send("User did not send this message.");
  return res
    .status(200)
    .send(await updateMessageById({ id: req.message.id, newMessage: req.body.message }));
});

/** Will delete a specific message the user has sent. */
usersRoute.delete("/:id/messages/:messageId", async (req, res) => {
  if (req.message.from_user_id !== req.user.id)
    return res.status(403).send("User did not send this message.");
  return res.status(204).send(await deleteMessageById({ id: req.params.messageId }));
});

/** Ensures all future requests are given a username and allows using req.toUserId for sending messages to them. */
usersRoute.use(requireBody(["username"]), async (req, res, next) => {
  const toUserId = await getUserIdByUsername({ username: req.body.username });
  if (!toUserId) return res.status(404).send("User not found.");
  req.toUserId = toUserId;
  next();
});

/** To send a message, body has message and username to send to.
 * Username is required to get the userId you are sending the message to.
 */
usersRoute.post("/:id/messages", requireBody(["message", "username"]), async (req, res) => {
  const message = {
    messageText: req.body.message,
    date: new Date().toISOString(),
    fromUserId: req.user.id,
    toUserId: req.toUserId,
  };
  return res.status(201).send(await insertMessage(message));
});
