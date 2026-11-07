# Private BX work mailbox

The `/api/work-mail` HTTPS bridge connects the owner's `sv@savinov.club` mailbox to the owner-private ChatGPT Site. It reuses existing SMTP credentials without exposing them to the client or model.

Runtime variables: `BX_WORK_MAIL_BRIDGE_TOKEN` (minimum 48 characters; secret shared with the private Site), `BX_WORK_MAIL_ENABLED=true`, `BX_MAIL_IMAP_HOST=mail.nic.ru`. Existing `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_HOST`, `SMTP_PORT` and `DATABASE_URL` remain in Render. Disable the bridge by setting `BX_WORK_MAIL_ENABLED=false`; rotate the bridge token in Render and Sites together. Never commit credentials.

Reading and searches open folders read-only. UID and UIDVALIDITY are both required to read a message or attachment. Outbound mail requires an explicit user instruction and a unique stable request_id. A PostgreSQL journal reserves each request before SMTP; do not resend using a new ID when status is unknown or sending. SMTP acceptance is not proof of delivery or reading. Sent-folder copy failures do not trigger a second SMTP send.

Checks: `node --test test-work-mail.cjs` and `node test-intake.cjs`.
