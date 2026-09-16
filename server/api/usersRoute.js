/** Handles the /users endpoint. Note logging in and registering do not require a user, all others do. Some require admin. */

import express from "express";
import {
  deleteUser,
  getUserById,
  getUserByUsername,
  getUserIdByUsername,
  insertUser,
  updateUser,
} from "../db/queries/users.js";
import { createToken } from "../../server/utils/jwt.js";
import {
  getUserMessage,
  getUserMessages,
  getUserSentMessages,
  insertMessage,
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

/** For all endpoints that have an id, validates the user exists. Note we have access to req.user for the logged in user. */
usersRoute.param("id", async (req, res, next) => {
  const id = req.params.id;
  const user = await getUserById({ id: req.params.id });
  if (!user) res.status(404).send("No user found with id " + id);
  next();
});

/** Admin only - Updates a user's info, such as username and password. */
usersRoute.put("/:id", requireAdmin, requireBody(["username", "password"]), async (req, res) => {
  return res.status(200).send(
    await updateUser({
      id: req.params.id,
      ...req.body,
    }),
  );
});

/** Admin only - Deletes a user. */
usersRoute.delete("/:id", requireAdmin, async (req, res) => {
  return res.status(204).send(await deleteUser({ id: req.params.id }));
});

/** For all below routes, require user to be logged in. */
usersRoute.use(requireUser);

/** Will either get sent or received messages for user depending on query.
 * Admin overrides requirement to be logged in with the passed id.
 */
usersRoute.get("/:id/messages", async (req, res) => {
  if (req.user.role !== "admin" || req.user.id !== req.params.id)
    return res.status(403).send("Unauthorized access to this user's messages");
  if (req.query.sent)
    return res.status(200).send(await getUserSentMessages({ userId: req.user.id }));
  return res.status(200).send(await getUserMessages({ userId: req.user.id }));
});

/** Will get a specific message to the user. Admin overrides requirement to be logged in with the passed id. */
usersRoute.get("/:id/messages/:messageId", async (req, res) => {
  if (req.user.role !== "admin" || req.user.id !== req.params.id)
    return res.status(403).send("Unauthorized access to this user's messages");
  return res
    .status(200)
    .send(await getUserMessage({ messageId: req.params.messageId, userId: req.user.id }));
});

/** Ensures all future requests are given a username and allows usinig req.toUserId for sending messages to them. */
usersRoute.use(requireBody(["username"]), async (req, res, next) => {
  const toUserId = await getUserIdByUsername({ username: req.body.username });
  if (!toUserId) return res.status(404).send("User doesn't exist");
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
