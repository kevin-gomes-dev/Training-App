import db from "../client.js";

export async function insertMessage({ messageText, date, fromUserId, toUserId }) {
  const SQL = `INSERT INTO messages(message,date,from_user_id,to_user_id) VALUES($1,$2,$3,$4) RETURNING *`;
  return (await db.query(SQL, [messageText, date, fromUserId, toUserId])).rows[0];
}

// Admin
export async function getMessages() {
  const SQL = `SELECT * FROM messages`;
  return (await db.query(SQL)).rows;
}

export async function getMessage({ id }) {
  const SQL = `SELECT * FROM messages WHERE id = $1`;
  return (await db.query(SQL, [id])).rows[0];
}

// User
export async function getUserMessages({ userId }) {
  const SQL = `SELECT * FROM messages WHERE to_user_id = $1`;
  return (await db.query(SQL, [userId])).rows;
}

export async function getUserMessage({ messageId, userId }) {
  const SQL = `SELECT * FROM messages WHERE id = $1 AND to_user_id = $2`;
  return (await db.query(SQL, [messageId, userId])).rows[0];
}

export async function getUserSentMessages({ userId }) {
  const SQL = `SELECT * FROM messages WHERE from_user_id = $1`;
  return (await db.query(SQL, [userId])).rows;
}
