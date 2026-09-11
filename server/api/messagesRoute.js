import express from "express";
import { getMessages, getMessage } from "../db/queries/messages.js";
const messagesRoute = express.Router();
export default messagesRoute;

messagesRoute.get("/", async (req, res) => {
  return res.status(200).send(await getMessages());
});
messagesRoute.get("/:id", async (req, res) => {
  const message = await getMessage({ id: req.params.id });
  return message ? res.status(200).send(message) : res.status(404).send("Message not found");
});
