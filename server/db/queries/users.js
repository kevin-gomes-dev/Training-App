/** All requests here are used in /users. Admin only routes are commented. */

import db from "../client.js";
import bcrypt from "bcrypt";

/** POST request for register endpoint. Store the hashed password in case of data breach. */
export async function insertUser({ username, password, role }) {
  const SQL = `INSERT INTO users(username,password,role) VALUES($1,$2,$3) RETURNING *`;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(SQL, [username, hashedPassword, role]);
  return user;
}

/** Instead of comparing hashed password to db password, uses bcrypt compare method. */
export async function getUserByUsername({ username, password }) {
  const SQL = `SELECT * FROM users WHERE username = $1`;
  const {
    rows: [user],
  } = await db.query(SQL, [username]);
  if (!user) return null;
  const verify = await bcrypt.compare(password, user.password);
  if (!verify) return null;
  return user;
}

/** Get only the user's id by username, helpful for sending messages without needing a password. */
export async function getUserIdByUsername({ username }) {
  const SQL = `SELECT id FROM users WHERE username = $1`;
  return (await db.query(SQL, [username])).rows[0]?.id;
}

/** Get entire user object given an id. */
export async function getUserById({ id }) {
  const SQL = `SELECT * FROM users WHERE id = $1`;
  const {
    rows: [user],
  } = await db.query(SQL, [id]);
  return user;
}

/** Admin only - PUT request to update user info.  */
export async function updateUser({ id, username, password, role }) {
  const SQL = `UPDATE users SET
  username = $2,
  password = $3,
  role = $4 WHERE id = $1 RETURNING *`;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(SQL, [id, username, hashedPassword, role]);
  return user;
}

/** Admin only - DELETE request to remove a user entirely. */
export async function deleteUser({ id }) {
  const SQL = `DELETE FROM users WHERE id = $1`;
  await db.query(SQL, [id]);
  return null;
}
