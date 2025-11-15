# Neon PostgreSQL Setup Guide

## Setup Instructions

### 1. Create Environment File

Create a `.env` file in the root directory with your database connection:

```env
DATABASE_URL=postgresql://neondb_owner:npg_8St4RbYgosaN@ep-jolly-union-ahnu5ito-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3001
VITE_API_URL=http://localhost:3001/api
```

### 2. Setup Database Schema

Run the migration script to create all tables:

```bash
npx ts-node --esm scripts/setup-pg-db.ts
```

Or manually run the SQL from `database/migrations/pg_schema.sql` in your Neon database console.

### 3. Start the API Server

In one terminal, start the API server:

```bash
npm run server
```

Or for development with auto-reload:

```bash
npm run server:dev
```

The server will run on `http://localhost:3001`

### 4. Start the Vite Dev Server

In another terminal, start the frontend:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and will connect to the API server.

## How It Works

1. **Frontend (Vite)**: Runs on port 3000, makes HTTP requests to the API
2. **API Server (Express)**: Runs on port 3001, handles all database operations
3. **Database (Neon PostgreSQL)**: Stores all data including images as base64 strings

## Image Storage

Images are stored as base64 strings in the `photo` column of the `members` table. The API server accepts JSON payloads up to 50MB to handle large base64 images.

## Troubleshooting

- **Connection errors**: Make sure your `.env` file has the correct `DATABASE_URL`
- **CORS errors**: The API server has CORS enabled, but make sure `VITE_API_URL` matches your API server URL
- **Image not saving**: Check the browser console and API server logs for errors. Make sure the API server is running.

