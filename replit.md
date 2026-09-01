# Replit setup and publishing

## Run

Use the **Start application** workflow.

- Frontend: React + Vite on port `5000`
- Backend: Express on port `5001`
- The frontend proxies `/api` and `/uploads` to the backend, so browser requests stay same-origin.

## Required secrets

- `MONGO_URI` — MongoDB connection string
- `SESSION_SECRET` — used by the Replit workflow and deployment as the JWT signing secret

## Publishing

The deployment builds the client from `client/`, serves the built SPA on port `5000`, and runs the API on port `5001`. Publish with the Replit Publishing tool after confirming that MongoDB Atlas allows connections from the deployment environment.

The database is not seeded automatically because `npm run seed` deletes existing data before creating demo records. New users can register from the login page.