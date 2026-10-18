# TeamFlow — MERN Team Management System

A role-based team management app with three roles:
- **Owner:** creates organizations and admin accounts; sees organization analytics.
- **Admin:** creates teams, adds employees, assigns tasks, and manages team members.
- **Employee:** views assigned tasks, updates task status, and privately chats with employees in the same team.

## Project structure

- `Backend/` — Express, MongoDB/Mongoose, JWT cookie authentication, role authorization, Socket.IO.
- `Frontend/front/` — React + Vite, React Router, Redux Toolkit, Tailwind CSS.

## Run locally (Windows PowerShell)

### 1. Configure backend

```powershell
cd Backend
Copy-Item .env.example .env
npm install
```

Open `Backend/.env` and set `DB_URL` to your MongoDB connection string and `JWT_SECRET` to a long random secret. Keep `.env` private; do not push it to GitHub.

### 2. Create the first owner

Add these temporary values to `Backend/.env` (choose your own password):

```env
OWNER_NAME=Your Name
OWNER_EMAIL=you@example.com
OWNER_PASSWORD=YourStrongPassword@123
```

Then run:

```powershell
npm run seed:owner
```

After the owner is created, remove the three `OWNER_*` values from `.env` if you prefer. Start the backend:

```powershell
npm run dev
```

The API runs on `http://localhost:8080` by default.

### 3. Configure and run frontend

Open a second terminal:

```powershell
cd Frontend/front
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Log in with the owner account, create an organization, create an admin for that organization, then log in as that admin to create teams/employees/tasks. Employee accounts can then log in to update tasks and use Team Chat.

## Important behavior

- Authentication is stored in an HTTP-only cookie; frontend API requests must use `withCredentials: true`.
- `FRONTEND_URL` must match the frontend origin exactly when deployed.
- The backend requires a reachable MongoDB instance.
- Do not include `.env`, `node_modules`, or production secrets in commits.

## Before deployment

Test the full owner → organization → admin → team → employee → task flow with separate browser sessions. Verify cookie settings for HTTPS deployment, set production environment variables, and review validation/error handling. The original project files were updated with the owner Organization/Admin screens and fixes for authentication guards, organization status, owner routes, and task/team validation. External database credentials and a live end-to-end test are not included in this source bundle.
