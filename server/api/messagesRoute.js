/** Admin only /messages endpoint for getting, updating or deleting messages.
 * Since an admin is a user, they can insert a message just as users can via the /users endpoint.
 */

import express from "express";
import {
  getMessages,
  getMessageById,
  updateMessageById,
  deleteMessageById,
} from "../db/queries/messages.js";
import requireBody from "../middleware/requireBody.js";
const messagesRoute = express.Router();
export default messagesRoute;

/** Get all messages. */
messagesRoute.get("/", async (req, res) => {
  return res.status(200).send(await getMessages());
});

/** If we are trying to access a message, need to make sure it exists.
 * Gives access to req.message
 */
messagesRoute.param("id", async (req, res, next) => {
  const message = await getMessageById({ id: req.params.id });
  if (!message) return res.status(404).send("Message not found.");
  req.message = message;
  next();
});

/** Get message by id. */
messagesRoute.get("/:id", async (req, res) => {
  res.status(200).send(req.message);
});

/** Update a message by id. The text should be in req.body.message */
messagesRoute.put("/:id", requireBody(["message"]), async (req, res) => {
  console.log(req.message);
  return res
    .status(200)
    .send(await updateMessageById({ id: req.message.id, newMessage: req.body.message }));
});

/** Delete a message by id. */
messagesRoute.delete("/:id", async (req, res) => {
  return res.status(204).send(await deleteMessageById({ id: req.message.id }));
});
