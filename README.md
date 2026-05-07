# JusticeFlow - Judgment Compliance Workbench

JusticeFlow is a high-integrity decision support engine designed for government departments to track and manage compliance with court judgments. It uses AI to extract actionable directives from legal documents and provides a verified workflow for departmental task assignment.

## Features

- **AI-Powered Extraction:** Automatically parses PDF judgments using Gemini 1.5 Flash.
- **Compliance Workflow:** Transform legal text into actionable departmental tasks.
- **Secure Access:** Role-based authentication (Admin/Officer simulation).
- **Interactive Dashboard:** Real-time compliance monitoring and directive distribution.
- **Dynamic Configuration:** In-app API key management via System Settings.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Motion
- **Backend:** Express, SQLite (via `better-sqlite3`)
- **AI Integration:** Google Gemini API (1.5 Flash)
- **Deployment:** Optimized for Cloud Run

## Getting Started

### Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Gemini API Key:**
   You can either:
   - Create a `.env` file with `GEMINI_API_KEY=...`
   - **OR** navigate to **System Settings** in the app UI after logging in to save your key locally.

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

### Authentication
The prototype uses a simulated high-integrity login. Enter any official government email format (e.g., `admin@justice.gov`) to access the workbench.

## Project Structure

- `server.ts`: Main entry point for the Express server and Vite middleware.
- `src/context/AuthContext.tsx`: Authentication and session management.
- `src/components/UploadView.tsx`: PDF processing and AI extraction pipeline.
- `src/components/Settings.tsx`: System-wide configuration and API keys.
- `src/lib/server/db.ts`: SQLite schema for judgments and compliance tasks.

### Production Deployment

To build and start the production-ready instance:

1. **Clean and Build Assets:**
   ```bash
   npm run clean
   ```
   ```bash
   npm run build
   ```

2. **Start the Production Server:**
   ```bash
   npm start
   ```
   The server will serve the static assets from the `dist` folder and the API endpoints from `server.ts`.

## Project Structure

- `server.ts`: Main entry point for the Express server and Vite middleware.
- `src/main.tsx`: Client-side entry point.
- `src/App.tsx`: Main React application component.
- `src/lib/server/db.ts`: Database schema and initialization (SQLite).
- `src/services/api.ts`: API client for frontend-backend communication.
- `src/components/`: Reusable UI components.

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the server in development mode using `tsx`. |
| `npm run build` | Builds the frontend assets for production. |
| `npm start` | Runs the production server using `node`. |
| `npm run lint` | Runs TypeScript type checking. |
| `npm run clean` | Deletes the `dist` directory. |

---
*Human-in-the-loop verification protocol active.*
