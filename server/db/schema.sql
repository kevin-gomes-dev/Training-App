DROP TABLE IF EXISTS users_messages CASCADE;
DROP TABLE IF EXISTS users_videos CASCADE;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS videos;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT
);

CREATE TABLE messages(
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    date TIMESTAMP NOT NULL
);

CREATE TABLE users_messages(
    id SERIAL PRIMARY KEY,
    from_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id INT NOT NULL REFERENCES messages(id) ON DELETE CASCADE
);

CREATE TABLE videos(
    id SERIAL PRIMARY KEY,
    length INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    date TIMESTAMP NOT NULL,
    filename TEXT NOT NULL
);

CREATE TABLE users_videos(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id INT NOT NULL REFERENCES videos(id) ON DELETE CASCADE
);