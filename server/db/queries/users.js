import db from "../client.js";
import bcrypt, { hash } from "bcrypt";

// Store the hashed password in case of data breach
export async function insertUser({ username, password, role }) {
  const SQL = `INSERT INTO users(username,password,role) VALUES($1,$2,$3) RETURNING *`;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(SQL, [username, hashedPassword, role]);
  return user;
}

// Instead of comparing hashed password to db password, uses bcrypt compare
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

export async function getUserById({ id }) {
  const SQL = `SELECT * FROM users WHERE id = $1`;
  const {
    rows: [user],
  } = await db.query(SQL, [id]);
  return user;
}
