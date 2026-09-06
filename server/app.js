import express from "express";
import morgan from "morgan";
import requireBody from "./middleware/requireBody.js";
import usersRoute from "./api/usersRoute.js";
const app = express();
export default app;
const JSON_PARSE_ERROR_TYPE = "entity.parse.failed";
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => res.status(200).send("Home"));
app.use("/users", requireBody(["username", "password"]), usersRoute);

app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === JSON_PARSE_ERROR_TYPE) return res.status(400).send("Badly formed request body.");
  return res.status(500).send("Server unknown error.");
});
