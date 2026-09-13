import express from "express";
import morgan from "morgan";
import requireBody from "./middleware/requireBody.js";
import usersRoute from "./api/usersRoute.js";
import messagesRoute from "./api/messagesRoute.js";
import getUserFromToken from "./middleware/getUserFromToken.js";
import requireAdmin from "./middleware/requireAdmin.js";
const app = express();
export default app;
const JSON_PARSE_ERROR_TYPE = "entity.parse.failed";
const INVALID_TYPE_ERROR_CODE = "22P02";
const UNIQUE_CONSTRAINT_ERROR_CODE = "23505";
const FOREIGN_KEY_ERROR_CODE = "23503";
app.use(express.json());
app.use(morgan("dev"));
app.use(getUserFromToken);

app.get("/", (req, res) => res.status(200).send("Home"));
app.use("/users", usersRoute);
app.use("/messages", requireAdmin, messagesRoute);
app.use((req, res) => res.status(404).send("Route not found"));

app.use((err, req, res, next) => {
  switch (err.code) {
    // Invalid type
    case INVALID_TYPE_ERROR_CODE:
      return res.status(400).send(err.message);
    // Unique constraint violation
    case UNIQUE_CONSTRAINT_ERROR_CODE:
    // Foreign key violation
    case FOREIGN_KEY_ERROR_CODE:
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === JSON_PARSE_ERROR_TYPE) return res.status(400).send("Badly formed request body.");
  return res.status(500).send("Server unknown error.");
});
