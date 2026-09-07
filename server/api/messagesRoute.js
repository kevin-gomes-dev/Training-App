import express from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import { getMessagess } from "../db/queries/messages.js";
const messagesRoute = express.Router();
export default messagesRoute;

messagesRoute.get("/", requireAdmin, async (req, res) => {
  return res.status(200).send(await getMessagess());
});
