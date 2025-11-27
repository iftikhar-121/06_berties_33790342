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

## Validation (Task 3 & 4)

Registration (`/users/registered`):
- Email must be a valid email address.
- Username 5–20 characters and alphanumeric.
- Password minimum 8 characters.
- First and last name must not be empty.

Books:
- Add Book (`/books/bookadded`): name required (max 50 chars), letters/numbers/spaces only (no symbols); price must be a number ≥ 0.
- Search (`/books/search-result`): keyword trimmed and limited to 50 chars (optional), exact toggle supported.

Notes:
- Client-side browser checks (e.g., `type="email"`, `required`) provide immediate feedback; server-side validation via `express-validator` enforces rules regardless of client behavior.
- On validation errors, pages are re-rendered to let the user correct inputs.

## Sanitisation (Task 6)

Where sanitisation is applied:
- Registration inputs: `first`, `last`, `username`, and `email` are sanitised on the server using `req.sanitize(...)` before storage and before echoing back to the client.
- Login: `username` is sanitised before database lookup, audit logging, and sending any response text.
- Books Search: the `keyword` query parameter is sanitised before being echoed back on the search page and before building the SQL parameter.
- Add Book: the `name` field is sanitised before inserting into the database and before echoing back in the confirmation message.

Where sanitisation is not applied:
- `password` is NOT sanitised to avoid altering user secrets (e.g., removing characters). It is validated for minimum length and then hashed with bcrypt.
- Numeric fields like `price` are validated as numbers and range-checked; sanitising isn’t necessary once validation constrains the type.

Reasoning:
- Sanitising free-text and identifier fields prevents stored and reflected XSS if data is later rendered or included in messages.
- Passwords must remain unchanged; only validation and hashing are appropriate.
- For numeric-only inputs, strict validation is sufficient; additional sanitisation would be redundant.