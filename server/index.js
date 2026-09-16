/** The entry point that runs the server on PORT specified in .env file. */

import app from "./app.js";
import db from "./db/client.js";
const PORT = process.env.PORT || 3000;
await db.connect();
app.listen(PORT, () => {
  console.log("http://localhost:" + PORT);
});
