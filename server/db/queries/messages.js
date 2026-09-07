import db from "../client.js";

export async function insertMessage({ messageText, date }) {
  const SQL = `INSERT INTO messages(message,date) VALUES($1,$2) RETURNING *`;
  const {
    rows: [message],
  } = await db.query(SQL, [messageText, date]);
  return message;
}

export async function getMessagess() {
  const SQL = `SELECT * FROM messages`;
  return (await db.query(SQL)).rows;
}
