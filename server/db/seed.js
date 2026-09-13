import db from "./client.js";
import { insertUser } from "./queries/users.js";
import { insertMessage } from "./queries/messages.js";

await db.connect();
await seed();
await db.end();

/** Seeds db with 3 users (1 admin, 2 normal) and many messages between them  */
async function seed() {
  const users = [1, 2, 3];
  for (let i of users) {
    i === 1
      ? await insertUser({
          username: "user" + i,
          password: "password",
          role: "admin",
        })
      : await insertUser({ username: "user" + i, password: "password" });
  }

  // Messages
  for (let i = 0; i < 20; i++) {
    const userOne = 1 + (i % 3);
    const userTwo = 1 + ((i + 1) % 3);
    // Each date should be a second apart
    const date = new Date();
    date.setTime(date.getTime() + i * 1000);
    await insertMessage({
      messageText: `Test message #${i} from user${userOne} to user${userTwo}.`,
      date: date.toISOString(),
      fromUserId: userOne,
      toUserId: userTwo,
    });
  }
}
