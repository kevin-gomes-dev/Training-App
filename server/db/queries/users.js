import db from "../client.js";
import bcrypt from "bcrypt";

/** Store the hashed password in case of data breach */
export async function insertUser({ username, password, role }) {
  const SQL = `INSERT INTO users(username,password,role) VALUES($1,$2,$3) RETURNING *`;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(SQL, [username, hashedPassword, role]);
  return user;
}

/** Instead of comparing hashed password to db password, uses bcrypt compare method*/
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

export async function getUserIdByUsername({ username }) {
  const SQL = `SELECT id FROM users WHERE username = $1`;
  return (await db.query(SQL, [username])).rows[0]?.id;
}

export async function getUserById({ id }) {
  const SQL = `SELECT * FROM users WHERE id = $1`;
  const {
    rows: [user],
  } = await db.query(SQL, [id]);
  return user;
}

/** If no username, only updates password. */
export async function updateUser({ id, username, password }) {
  let SQL;
  if (!username) SQL = `UPDATE users SET password = $3 WHERE id = $1`;
  else
    SQL = `UPDATE users SET username = $2, password = $3
  WHERE id = $1 AND username IS DISTINCT FROM $2 RETURNING *`;
  console.log(SQL);
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(SQL, [id, username, hashedPassword]);
  return user;
}

export async function deleteUser({ id }) {
  const SQL = `DELETE FROM users WHERE id = $1`;
  const {
    rows: [user],
  } = await db.query(SQL, [id]);
  return null;
}
