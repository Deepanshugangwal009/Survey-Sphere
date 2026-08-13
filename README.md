# Online Survey System

A web application where registered users create surveys, publish them with a shareable link,
collect answers from anyone who opens that link, and view the results as counts, percentages
and charts. Built with Node.js, Express, EJS and MySQL following the MVC pattern.

---

## Description

A survey creator registers an account and logs in. From the dashboard they create a survey,
add questions of four different types, and publish it. Publishing generates a unique public
link that anybody can open without an account. Every submitted response is stored across the
`responses` and `answers` tables inside a single transaction, so a half saved response can
never exist. The creator can then open the results page, where all the counting is done with
SQL `GROUP BY`, `COUNT` and `AVG` queries rather than by loading rows into JavaScript.

An admin account can oversee the whole system: every user, every survey, and the totals.

---

## Features

**Survey creator**
- Registration, login and logout with bcrypt hashed passwords (via `bcryptjs`)
- Sessions stored in MySQL so a server restart does not log everyone out
- Dashboard listing only your own surveys, with a response count per survey
- Create, edit and delete surveys
- Add, edit, reorder and delete questions of four types: single choice, multiple choice,
  short text and rating
- Draft, published and closed lifecycle with a copy-to-clipboard public link
- Results page with per question counts, percentages, averages and Chart.js charts

**Respondent (no account needed)**
- Opens the public link and answers the survey
- The correct input is rendered per question type (radio, checkbox, textarea, rating)
- Required questions, option ownership and rating ranges are all validated on the server
- Closed surveys politely refuse new responses

**Admin**
- Separate admin area guarded by the `role` column on `users`
- Totals for users, surveys and responses
- Paginated list of all users with their survey counts
- Paginated list of all surveys with owner and response counts
- Delete abusive users or surveys, relying on `ON DELETE CASCADE`

---

## Technologies Used

| Layer | Technology |
|-------|------------|
| Language | JavaScript (Node.js) |
| Web framework | Express.js |
| Architecture | MVC (Model - View - Controller) |
| View engine | EJS with express-ejs-layouts |
| Styling | CSS, Bootstrap 5, Font Awesome 6 |
| Charts | Chart.js |
| Database | MySQL |
| ORM | Sequelize with the mysql2 driver |
| Validation | Joi |

---

## npm Packages and Why They Are Needed

**Dependencies**

| Package | Why it is needed |
|---------|------------------|
| `express` | The web framework that handles routing and middleware |
| `ejs` | The template engine that renders the HTML pages |
| `express-ejs-layouts` | Gives EJS a shared master layout so every page reuses the navbar and footer |
| `sequelize` | The ORM used for models, associations, queries and transactions |
| `mysql2` | The MySQL driver that Sequelize uses to talk to the database |
| `sequelize-cli` | Runs the migrations and seeders from the command line |
| `dotenv` | Loads the database and session settings from the `.env` file |
| `express-session` | Creates and reads the login session |
| `express-mysql-session` | Stores those sessions in a MySQL `sessions` table instead of memory |
| `connect-flash` | Carries one time success and error messages across a redirect |
| `cookie-parser` | Parses the request cookies |
| `bcryptjs` | Hashes passwords so plain text is never stored. Pure JavaScript, so it needs no native build step on the deployment host |
| `joi` | Validates every submitted form on the server |
| `method-override` | Lets an HTML form send PUT and DELETE requests |

**Dev dependency**

| Package | Why it is needed |
|---------|------------------|
| `nodemon` | Restarts the server automatically while developing |

---

## Folder Structure

```
complete with SQL/
├── app.js                  Application entry point
├── package.json            Scripts and dependencies
├── .env                    Local configuration (not committed)
├── .env.example            Template showing which variables are required
├── .gitignore
├── .sequelizerc            Tells sequelize-cli where config, models, migrations and seeders live
├── README.md
│
├── config/
│   ├── config.js           Environment driven database settings for sequelize-cli
│   └── database.js         Sequelize instance, connection check and friendly connection errors
│
├── migrations/             The schema, one file per table, in dependency order
│   ├── ...-create-users.js
│   ├── ...-create-surveys.js
│   ├── ...-create-questions.js
│   ├── ...-create-question-options.js
│   ├── ...-create-responses.js
│   └── ...-create-answers.js
│
├── seeders/
│   └── ...-demo-data.js    Sample users, surveys, questions, options and responses
│
├── models/
│   ├── index.js            Requires every model and wires all associations
│   ├── User.js             Password hashing hook, password hidden by default
│   ├── Survey.js
│   ├── Question.js
│   ├── QuestionOption.js
│   ├── Response.js
│   └── Answer.js
│
├── controllers/
│   ├── homeController.js       Landing, about and contact pages
│   ├── authController.js       Register, login, logout
│   ├── surveyController.js     Survey CRUD plus publish, close and reopen
│   ├── questionController.js   Question CRUD inside a transaction
│   ├── responseController.js   Public survey page and response submission
│   ├── resultsController.js    Results page and chart data
│   └── adminController.js      Admin dashboard, user and survey management
│
├── routes/
│   ├── homeRoutes.js
│   ├── authRoutes.js
│   ├── surveyRoutes.js
│   ├── questionRoutes.js
│   ├── responseRoutes.js       Public routes mounted at /s
│   └── adminRoutes.js
│
├── middleware/
│   ├── auth.js             isAuthenticated and isGuest guards
│   ├── currentUser.js      Loads the logged in user onto res.locals for every request
│   ├── ownership.js        Loads a survey or question scoped to the current user, or 404
│   ├── admin.js            isAdmin guard
│   ├── validate.js         Shared Joi validation runner
│   └── errorHandler.js     404 catch-all and the global error handler
│
├── validators/
│   ├── authValidator.js       Register and login rules
│   ├── surveyValidator.js     Survey and question rules
│   └── responseValidator.js   Builds answer rules from the survey's own questions
│
├── utils/
│   ├── slug.js             Generates a unique public share slug
│   ├── queryHelpers.js     Shared include so questions and options always come back ordered
│   ├── aggregate.js        All the SQL aggregation queries and the percentage helper
│   └── AppError.js         Error class carrying an HTTP status
│
├── views/
│   ├── layouts/main.ejs        Master layout
│   ├── partials/               navbar, footer, flash, statusBadge, pagination
│   ├── home/                   index, about, contact
│   ├── auth/                   register, login
│   ├── surveys/                index, new, show, edit, results, _form
│   ├── questions/              new, edit, _form
│   ├── respond/                show, thankyou
│   ├── admin/                  dashboard, users, surveys
│   └── errors/                 404, 500
│
└── public/
    ├── css/style.css
    └── js/
        ├── questionForm.js   Shows the right fields per question type, adds option rows
        ├── share.js          Copies the public link to the clipboard
        └── results.js        Draws the Chart.js charts from the injected data
```

---

## Database Schema

| Table | Columns |
|-------|---------|
| `users` | `id`, `name`, `email` (unique), `password` (bcrypt hash), `role` ENUM('user','admin'), timestamps |
| `surveys` | `id`, `user_id` FK, `title`, `description`, `status` ENUM('draft','published','closed'), `share_slug` (unique), `published_at`, `closed_at`, timestamps |
| `questions` | `id`, `survey_id` FK, `text`, `type` ENUM('single_choice','multiple_choice','short_text','rating'), `is_required`, `min_value`, `max_value`, `position`, timestamps |
| `question_options` | `id`, `question_id` FK, `text`, `position`, timestamps |
| `responses` | `id`, `survey_id` FK, `submitted_at`, `respondent_ip`, timestamps |
| `answers` | `id`, `response_id` FK, `question_id` FK, `option_id` FK (nullable), `text_value`, `rating_value`, timestamps |
| `sessions` | Created and managed automatically by express-mysql-session |

**Relationships**

- A user has many surveys. `surveys.user_id` → `users.id` `ON DELETE CASCADE`
- A survey has many questions. `questions.survey_id` → `surveys.id` `ON DELETE CASCADE`
- A question has many options. `question_options.question_id` → `questions.id` `ON DELETE CASCADE`
- A survey has many responses. `responses.survey_id` → `surveys.id` `ON DELETE CASCADE`
- A response has many answers. `answers.response_id` → `responses.id` `ON DELETE CASCADE`
- An answer points at one question and optionally one option

One answer row is stored per selected option, so a multiple choice question produces several
rows for the same response. Single choice fills `option_id`, short text fills `text_value`
and rating fills `rating_value`.

Because every foreign key cascades, deleting a user removes their surveys, questions, options,
responses and answers in one database operation.

---

## Installation Steps

1. Install Node.js (LTS) and MySQL Server.
2. Open a terminal in the `complete with SQL` folder.
3. Install the packages:

   ```
   npm install
   ```

---

## Database Setup Steps

1. Create an empty database and a user that owns it:

   ```sql
   CREATE DATABASE survey_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'survey_user'@'localhost' IDENTIFIED BY 'survey_pass';
   GRANT ALL PRIVILEGES ON survey_system.* TO 'survey_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. Copy `.env.example` to `.env` and fill in the values.

3. Create the tables:

   ```
   npm run migrate
   ```

4. Load the sample data (optional but useful for a demo):

   ```
   npm run seed
   ```

---

## Migration and Seed Commands

| Command | What it does |
|---------|--------------|
| `npm run migrate` | Creates every table |
| `npm run migrate:undo` | Rolls back the most recent migration |
| `npm run migrate:undo:all` | Drops every table created by the migrations |
| `npm run seed` | Inserts the demo users, surveys, questions, options and responses |
| `npm run seed:undo` | Removes the demo data again |

---

## Environment Variables

| Variable | Meaning |
|----------|---------|
| `PORT` | Port the server listens on |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_NAME` | Database name |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | Password for that user |
| `DB_DIALECT` | Always `mysql` for this project |
| `DB_SSL` | `true` when the MySQL server requires TLS (all cloud providers). `false` locally |
| `DB_SSL_REJECT_UNAUTHORIZED` | `false` only if the provider uses a self signed certificate |
| `DB_POOL_MAX` | Maximum pooled MySQL connections. Defaults to `5`. Lower it on small free database plans |
| `NODE_ENV` | `production` on a deployed site, `development` locally |
| `SESSION_SECRET` | Long random string used to sign the session cookie |

`.env` is listed in `.gitignore` and must never be committed. `.env.example` documents the
same variables with placeholder values.

---

## How to Run

Development, with automatic restarts:

```
npm run dev
```

Normal start:

```
npm start
```

Then open `http://localhost:3000`.

The app checks the database connection first and refuses to start with a clear message if
MySQL is unreachable, the database does not exist, or the credentials are wrong.

**Demo accounts created by the seeder** (all use the password `secret123`):

| Email | Role |
|-------|------|
| `admin@example.com` | admin |
| `riya@example.com` | user, owns the published demo survey |
| `arjun@example.com` | user, owns a draft survey |

The published demo survey is reachable at `http://localhost:3000/s/demo-course-feedback`.

---

## Project Workflow

1. A visitor registers and logs in.
2. From the dashboard they create a survey, which starts as a draft.
3. They add questions. Questions can only be changed while the survey is a draft.
4. They publish the survey. A unique `share_slug` is generated and the public link appears.
5. They share that link. Anyone can open it and submit answers without logging in.
6. Each submission writes the response row and all of its answer rows in one transaction.
7. The creator opens the results page and sees counts, percentages, averages and charts.
8. When enough answers are collected they close the survey, which stops new responses.
   A closed survey can be reopened later.
9. An admin can review every user and survey and remove anything unwanted.

---

## Scripts

| Script | Command |
|--------|---------|
| `npm start` | `node app.js` |
| `npm run dev` | `nodemon app.js` |
| `npm run db:setup` | `npm run migrate && npm run seed` |
| `npm run migrate` | `sequelize-cli db:migrate` |
| `npm run migrate:undo` | `sequelize-cli db:migrate:undo` |
| `npm run migrate:undo:all` | `sequelize-cli db:migrate:undo:all` |
| `npm run seed` | `sequelize-cli db:seed:all` |
| `npm run seed:undo` | `sequelize-cli db:seed:undo:all` |

---

## Production Notes

- Set `NODE_ENV=production`. The session cookie then sets the `secure` flag, which requires
  the site to be served over HTTPS.
- Replace `SESSION_SECRET` with a long random value that is not stored in version control.
- Use a MySQL account that only has rights on this one database rather than `root`.
- The Sequelize connection pool is configured in `config/database.js` and can be raised there
  if the site gets busy.
- Run the app behind a real process manager or WSGI style host rather than leaving
  `npm run dev` running.

---

## Deployment

This is an ordinary long running Express server. It needs a host that keeps a Node process
alive and a MySQL database that is reachable over the internet. Any host that can run
`npm install` and then `npm start` will serve it without code changes.

### What the host needs to know

| Setting | Value |
|---------|-------|
| Build command | `npm install` |
| Start command | `npm start` |
| Node version | 20 or newer (declared in `engines`) |
| Port | Taken from `PORT`, which the host sets automatically |

The server binds to `0.0.0.0` and reads `process.env.PORT`, which is what every managed host
requires in order to route traffic to it.

### Step 1: create the database

A deployed site cannot reach the MySQL running on your own machine, so the database has to
live somewhere with a public hostname. Create an empty MySQL database with any provider,
then put its credentials in your local `.env` and run the migrations once from your machine:

```bash
npm run migrate
```

Add `npm run seed` as well if you want the demo users and surveys.

Every hosted MySQL provider requires TLS, so set `DB_SSL=true` for a hosted database and
leave it `false` for a local one.

### Step 2: deploy the application

1. Push the project to a Git repository.
2. Create a new web service on your chosen host and point it at that repository.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Add every variable from `.env.example` in the host's environment variable settings, using
   the hosted database credentials, plus `NODE_ENV=production`, `DB_SSL=true` and a fresh
   `SESSION_SECRET`.
5. Deploy.

Do not upload `.env` itself. It is ignored by Git on purpose, and every host has its own
place to store these values.

### Notes for free tiers

- Free web services usually sleep after a period of inactivity. The first request after that
  wakes the process and can take up to a minute. This is a property of the free plan, not a
  fault in the application.
- Free database plans allow only a small number of connections. `DB_POOL_MAX` controls the
  Sequelize pool size and can be lowered to `2` or `3` if the provider starts refusing
  connections.
- Sessions are stored in MySQL rather than in memory, so logged in users stay logged in
  across restarts and sleep cycles.

### Serverless platforms

Netlify and Vercel are built for static sites and short lived functions rather than a long
running server, and this application is not configured for them. Use a host that runs a
normal Node process.

---

## Assumptions Made

- The requirements listed C++ as the language while also requiring a Node.js, Express and EJS
  stack. A server rendered web application on that stack has to be written in JavaScript, so
  JavaScript on Node.js is used throughout.
- Answering a published survey does not need an account. Creating and managing surveys does.
- Questions can only be added, edited or deleted while a survey is still a draft. This keeps
  the collected answers meaningful, because published questions never change under a
  respondent.
- One response per form submission. The system does not try to stop the same person from
  answering twice, since respondents are anonymous.
- `respondent_ip` is stored only for basic traceability and is never shown in the interface.
- Percentages on the results page are calculated against the number of answers that question
  received, not against the total number of responses, because optional questions can be
  skipped.
- Short text answers on the results page are paginated ten at a time, newest first.
- Emails are validated against real top level domains by Joi, so addresses ending in `.local`
  or other made up suffixes are rejected.
- Admin accounts are created by the seeder or by setting `role` to `admin` directly in the
  database. There is no sign up form for admins.
- Bootstrap, Font Awesome and Chart.js are loaded from a CDN, so the interface needs an
  internet connection to look right.
