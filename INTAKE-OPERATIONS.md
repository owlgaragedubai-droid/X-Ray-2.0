# Website intake

Public `POST /api/leads` requires a valid INN, a question, and an email or phone. Each submission has its own receipt; UUID submission keys make unchanged retries idempotent. The endpoint returns only a receipt, never a client record. New requests must be committed to PostgreSQL before success is reported.

`/leads.html`, `/leads`, `/crm-demo`, `/demo/aluminstar` and lead-reading APIs require HTTPS Basic authentication. Configure `BX_ADMIN_USER` and `BX_ADMIN_PASSWORD` (at least 20 characters) in Render secrets. Missing credentials deny all access. Do not put credentials in this repository or URLs.

Notifications require `SMTP_HOST`, `SMTP_PORT` (465 for implicit TLS or 587 for STARTTLS), `SMTP_USER`, `SMTP_PASSWORD`, and `LEAD_NOTIFY_TO`. Use only the owner-approved mailbox. Missing configuration leaves notifications pending in PostgreSQL. Configure secrets directly in Render, never in chat or source files.

The durable queue checks every 30 seconds, uses database row locks, and retries failures up to eight attempts. The private card displays delivery state. `sent` means the SMTP server accepted the message; verify inbox receipt separately. A crash between SMTP acceptance and the database commit can cause a repeated notification with the same Message-ID.

Validation: `node test-intake.cjs` covers authorization, encoded paths, private data isolation, contact persistence, retry idempotency, storage failure and notification retries with simulated dependencies. After deployment, check public pages and forms, anonymous 401 responses on private routes, authenticated access, saved contact/question, and actual inbox delivery. Keep test inquiries clearly labelled as internal BX tests.

The web service and PostgreSQL database have separate Render plans. Paid web compute does not remove free database expiry. Retain a paid database and backups before relying on this intake for client work.
