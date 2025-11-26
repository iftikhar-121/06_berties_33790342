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

## Access control (Task 5)

Protected pages (require login via session):
- `/users/list` — list registered users (users.js)
- `/users/audit` — view login audit history (users.js)
- `/books/addbook` — display 'add book' form (books.js)
- `/books/bookadded` — handle 'add book' form submission (books.js)
- `/logout` — logout page (main.js) — accessible only when logged in

Public pages (no login required):
- `/` — home page
- `/about`
- `/books/search` and `/books/search-result`
- `/books/list` and `/books/bargainbooks`
- `/users/register`, `/users/registered` (registration flow)
- `/users/login`, `/users/loggedin` (login flow)

How to test access control:
1. Visit `/users/list`, `/users/audit`, or `/books/addbook` without logging in — you should be redirected to the login page.
2. Log in via `/users/login`, then revisit the pages — they should load as expected.
3. Use the browser developer tools to inspect the session cookie created after login.