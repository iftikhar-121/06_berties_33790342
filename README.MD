# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install
node index.js

## dotenv

To secure the database credentials, the application uses the **`dotenv`** module.

The hardcoded credentials in `index.js` have been replaced with environment variables loaded from a **`.env`** file. This separates configuration from code. Per the lecturer's instructions for marking, the `.env` file contains publicly known credentials (`BB_USER`, `BB_PASSWORD`, `BB_DATABASE`) and has been included in the repository to ensure ease of setup on the marking machine.

## audit

Audit logging has been implemented to track successful and failed login attempts. A new database table, `audit_log`, stores the `username`, `status` (SUCCESS or FAILURE), and `attempt_at` timestamp for every login attempt. A new route, `/users/audit`, allows administrators to view this full audit history.