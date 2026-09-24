/** The client with which to query the database. Requires the .env file to have DATABASE_URL in the form:
 * postgres://<user>:<password>@<address>/<database_name>
 * Address example: localhost:5432
 */

import pg from "pg";
const options = { connectionString: process.env.DATABASE_URL };

// Need SSL for external database connection, code taken from Fullstack Academy
// https://github.com/FullstackAcademy/capstone-backend/blob/main/db/client.js
if (process.env.NODE_ENV === "production") {
  options.ssl = { rejectUnauthorized: false };
}
const db = new pg.Client(options);
export default db;
