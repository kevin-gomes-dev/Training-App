/** All functions here are to query the message table. They are used in both /messages and /users */
import db from "../client.js";

/** Add a message to the database and return the message */
export async function insertMessage({ messageText, date, fromUserId, toUserId }) {
  const SQL = `INSERT INTO messages(message,date,from_user_id,to_user_id) VALUES($1,$2,$3,$4) RETURNING *`;
  return (await db.query(SQL, [messageText, date, fromUserId, toUserId])).rows[0];
}

/** Admin only - get all messages in entire table */
export async function getMessages() {
  const SQL = `SELECT * FROM messages`;
  return (await db.query(SQL)).rows;
}

/** Admin only - get a specific message by id (not user id) */
export async function getMessage({ id }) {
  const SQL = `SELECT * FROM messages WHERE id = $1`;
  return (await db.query(SQL, [id])).rows[0];
}

/** Get all messages sent to a specific user. */
export async function getUserMessages({ userId }) {
  const SQL = `SELECT * FROM messages WHERE to_user_id = $1`;
  return (await db.query(SQL, [userId])).rows;
}

/** Get specific user's messages. */
export async function getUserMessage({ messageId, userId }) {
  const SQL = `SELECT * FROM messages WHERE id = $1 AND to_user_id = $2`;
  return (await db.query(SQL, [messageId, userId])).rows[0];
}

/** Get specific user's sent messages. */
export async function getUserSentMessages({ userId }) {
  const SQL = `SELECT * FROM messages WHERE from_user_id = $1`;
  return (await db.query(SQL, [userId])).rows;
}
