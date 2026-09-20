/** Admin only /messages endpoint for getting all or specific messages. */

import express from "express";
import { getMessages, getMessage } from "../db/queries/messages.js";
const messagesRoute = express.Router();
export default messagesRoute;

/** Get all messages. */
messagesRoute.get("/", async (req, res) => {
  return res.status(200).send(await getMessages());
});

/** Get message by id. */
messagesRoute.get("/:id", async (req, res) => {
  const message = await getMessage({ id: req.params.id });
  return message ? res.status(200).send(message) : res.status(404).send("Message not found");
});
