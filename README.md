# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://www.citymasjid.info/

## Features

- **Role-Based Access Control**: Support for Admin, Imam, and Muazzin roles with different permission levels
- **User Registration**: New users can register as Imam or Muazzin
- **Mosque Management**: Manage multiple mosques with their prayer times, members, and events
- **Prayer Times**: Track and update daily prayer schedules
- **Announcements**: Post and manage community announcements
- **Donations**: Record and track donations
- **Events**: Manage community events and Iftari slots
- **Members**: Maintain mosque member profiles

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `DATABASE_URL` in your environment or `.env` file to your PostgreSQL database connection string
3. Set up the database:
   `npm run setup-db`
4. (For existing installations) Run role migration:
   `npm run migrate`
5. Create an admin user:
   `npm run create-admin`
6. Start the backend server:
   `npm run server:dev`
7. In a new terminal, start the frontend:
   `npm run dev`

## Documentation

- [Role-Based Access Control System](./RBAC_README.md) - Complete documentation for user roles and permissions
