# Staff Step

Jared is a mechanic for a company specializing in car repairs. It's his first day on the job since he went through the video training, but it didn't come close to covering everything that would be required. Though his coworkers try to help coach him, the additional workload causes a strain on productivity. If Jared had a way to communicate on demand with trainers while on the job, he would have no problem adapting to the work environment while immediately providing value to the company.

Enter **Staff Step**, an app specializing in enabling communication between trainers and trainees. It offers conversations among different registered users to avoid the many distractions using a phone or similar messaging app would. Only registered users can access and use the app. Soon to come features include an admin dashboard to handle managing user and message data as well as a video section where trainers and trainees can upload and annotate training videos.

We hope you'll enjoy using this app to expedite and help evolve the potential talent residing within.

**Login**

![login](images/loginPage.png)

**Dashboard**

![dashboard](images/dashboardPage.png)

**Messages**

![messages](images/messagesPage.png)

[Visit us now!](https://staffstep.netlify.app)

# The Schema

Here are the schemas used. Feel free to look at server/db/schema.sql to see all relationships. To explain, users have their credentials and whether they are special (not currently used). Messages have who it was from, who it was sent to (both ids), date and the message itself. This is then used to display and send messages to different users. Currently, the videos schema and users_videos are unused and are relevant for a stretch goal.

**users**: id, username (unique), password, role

**messages**: id, message, date, from_user_id, to_user_id

**videos**: id, length, title, description, type, date, filename

**users_videos**: id, user_id, video_id

# Tech stack

The backend uses [PostgreSQL](https://www.postgresql.org/) as the database and [Express](https://expressjs.com/) framework to create routed API methods. It uses a combination of [bcrypt](https://www.npmjs.com/package/bcrypt) and [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) for storing and validating credentials and tokens, respectively. For the database calls, it uses [pg](https://www.npmjs.com/package/pg). For logging it uses [morgan](https://www.npmjs.com/package/morgan) and for deployment, [cors](https://www.npmjs.com/package/cors).

The frontend mainly uses the [React](https://react.dev/) framework with [Vite](https://vite.dev/). It routes pages accordingly using [React Router](https://reactrouter.com/).

# How to run

To run locally, first clone using git clone (URL) [DIR]. Then in server directory, create a file named .env and inside, add the following:

PORT=(NUMBER)

JWT_SECRET=(super secret string)

DATABASE_URL=(database to login in, if PSQL, something like postgresql://(USER):(PASSWORD)@localhost:(PORT different from PORT var)/(DATABASE NAME))

Next, run **npm install** or whichever package manager you use to install the dependencies in both frontend and server directories. Setup seeded database via scripts in server dir **(db:schema, then db:seed)**. Then start the server and frontend using their respective **npm run dev**.
