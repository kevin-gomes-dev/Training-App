/** The client with which to query the database. Requires the .env file to have DATABASE_URL in the form:
 * postgres://<user>:<password>@<address>/<database_name>
 * Address example: localhost:5432
 */

import pg from "pg";
const db = new pg.Client(process.env.DATABASE_URL);
export default db;
