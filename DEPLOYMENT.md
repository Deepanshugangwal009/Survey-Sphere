# Survey Sphere — Deployment Guide

## Stack

- Node.js 20+ / Express 5 (server-rendered MVC)
- EJS views with `express-ejs-layouts`, Bootstrap 5 + Font Awesome from CDN
- Sequelize ORM + `mysql2` driver, **MySQL** database
- Sessions stored in MySQL via `express-mysql-session`
- Schema managed by Sequelize migrations, demo data by a Sequelize seeder

Because the app renders HTML on the server and keeps sessions in MySQL, it needs a
real Node process. Static-only hosts (Netlify, GitHub Pages) cannot run it.

## Recommended hosting

| Piece | Service | Why |
| --- | --- | --- |
| Web app | **Render — Web Service (Free)** | Runs a persistent Node process, builds from GitHub, free HTTPS, blueprint file included |
| Database | **Aiven for MySQL (Free plan)** or **TiDB Cloud Serverless (MySQL-compatible, free)** | Render does **not** offer MySQL — only PostgreSQL. A separate MySQL provider is required. |

Alternatives for the web app: Fly.io (free allowance, needs a Dockerfile),
Koyeb free web service, Railway (trial credit only, not permanently free).

### Free-tier limits you should know

- Render free web services **sleep after 15 minutes** of inactivity; the first
  request after sleeping takes ~30–60 seconds.
- Render free services have 512 MB RAM and a shared CPU.
- Aiven free MySQL: 1 GB storage, single node, no backups.
- TiDB Cloud Serverless free tier: 5 GB storage, request-unit quota per month.

## Required environment variables (Render dashboard)

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | a long random string (Render can generate it) |
| `DATABASE_URL` | `mysql://user:password@host:port/dbname` from your MySQL provider |
| `DB_SSL` | `true` |
| `DB_SSL_REJECT_UNAUTHORIZED` | `false` (or `true` plus `DB_SSL_CA` holding the provider's CA certificate) |
| `DB_POOL_MAX` | `3` |

`PORT` is injected by Render automatically — do not set it.

If your provider gives separate values instead of a URL, set `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER`, `DB_PASSWORD` instead of `DATABASE_URL`.

## Commands

- Build command: `npm install && npm run migrate`
- Start command: `npm start`

The migrations run during every build, so the schema is created on the first deploy
and kept up to date afterwards.

## Step-by-step

1. **Prepare the repository.** From `complete with SQL`, run `git init`,
   `git add .`, `git commit -m "Survey Sphere"`, then push to a GitHub repo named
   `Survey Sphere`. Confirm `.env` is **not** in the commit (`git status` should not list it).
2. **Create the database.** Sign up at <https://aiven.io> (or <https://tidbcloud.com>),
   create a free MySQL service, and copy the connection URI. Aiven creates a
   `defaultdb` database you can use directly.
3. **Create the web service.** Sign up at <https://render.com>, choose
   *New → Web Service*, connect your GitHub repo. Render will pick up `render.yaml`;
   otherwise set Runtime = Node, Build = `npm install && npm run migrate`,
   Start = `npm start`, Plan = Free.
4. **Set environment variables** from the table above, then deploy.
5. **Verify migrations ran.** The build log should list the six `create-*` migrations.
6. **(Optional) load demo data.** Open the Render *Shell* tab and run `npm run seed`.
   Demo accounts: `admin@example.com`, `riya@example.com`, `arjun@example.com`,
   all with password `secret123`. **Change or remove these before sharing the site.**
7. **Test the deployed app:** register → log in → create a survey → add questions →
   publish → open the `/s/<slug>` link in a private window → submit → view results.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Build fails on `sequelize-cli: not found` | `sequelize-cli` is a runtime dependency in `package.json`; make sure you committed the updated file. |
| `ER_ACCESS_DENIED_ERROR` | wrong user/password in `DATABASE_URL`. |
| `ETIMEDOUT` / `ENOTFOUND` at startup | wrong host, or the provider requires SSL — set `DB_SSL=true`. |
| `self signed certificate in certificate chain` | set `DB_SSL_REJECT_UNAUTHORIZED=false`, or paste the provider CA into `DB_SSL_CA`. |
| Login works but you are logged out on the next click | `SESSION_SECRET` is missing, or the session store cannot write to MySQL. |
| Site logs "SESSION_SECRET must be set" and exits | add the `SESSION_SECRET` variable. |
| First request after idle is very slow | expected on Render's free tier (cold start). |

## Local development is unchanged

Copy `.env.example` to `.env`, fill in your local MySQL details, then:

```bash
npm install
npm run db:setup
npm run dev
```
