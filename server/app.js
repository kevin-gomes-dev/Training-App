/** The app is the bulk of this. Routes related endpoints together,
 * uses appropriate middleware that affects entire routes or otherwise and unrelated error checking.
 */

import express from "express";
import morgan from "morgan";
import usersRoute from "./api/usersRoute.js";
import messagesRoute from "./api/messagesRoute.js";
import getUserFromToken from "./middleware/getUserFromToken.js";
import requireAdmin from "./middleware/requireAdmin.js";
import cors from "cors";
const app = express();
export default app;

// Error codes
const JSON_PARSE_ERROR_TYPE = "entity.parse.failed";
const INVALID_TYPE_ERROR_CODE = "22P02";
const UNIQUE_CONSTRAINT_ERROR_CODE = "23505";
const FOREIGN_KEY_ERROR_CODE = "23503";
const INDETERMINATE_DATA_TYPE_ERROR_CODE = "42P18";

// For the deployed backend
// app.use(cors({ origin: process.env.API_URL }));
app.use(cors());

// Important middleware used by all routes. Only parse JSON requests, log error codes and requests when run.
app.use(express.json());
app.use(morgan("dev"));

// If no user, go next(). Otherwise, will attempt to authenticate token. If it does, req.user will be available to all requests.
app.use(getUserFromToken);

// All routes, any not supported will return required message.
app.get("/", (req, res) => res.status(200).send("Home"));
app.use("/users", usersRoute);
app.use("/messages", requireAdmin, messagesRoute);
app.use((req, res) => res.status(404).send("Route not found"));

// Error checking the anticipated errors.
app.use((err, req, res, next) => {
  if (err.type === JSON_PARSE_ERROR_TYPE) return res.status(400).send("Badly formed request body.");
  switch (err.code) {
    // Invalid type
    case INVALID_TYPE_ERROR_CODE:
    // PSQL cannot determine data type
    case INDETERMINATE_DATA_TYPE_ERROR_CODE:
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

// Any other errors not anticipated.
app.use((err, req, res, next) => {
  return res.status(500).send("Server unknown error.");
});
