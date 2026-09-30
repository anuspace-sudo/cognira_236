# COGNIRA — AURION MOTORS

A working Next.js prototype for the COGNIRA conversational business intelligence product.

## Included
- Premium dark automotive enterprise landing page
- AURION MOTORS branding
- Login with demo company IDs
- Employee / Manager / Administrator role display
- Conversational query workspace
- Automotive-only suggested questions
- Demo query result with chart and data table
- CSV export
- Query history
- Reports
- Analytics
- User management
- Profile and settings
- Responsive dark neon UI

## Run
```bash
npm install
npm run dev
```
Open http://localhost:3000

Demo IDs:
- EMP001
- MGR001
- ADM001

Any non-empty password is accepted in this prototype.

## Next production integrations
1. Firebase Authentication for real company login.
2. Firestore for users, history, reports and audit logs.
3. FastAPI backend for the COGNIRA processing engine.
4. MySQL/Aurion Motors database.
5. Speech-to-text for voice input.
6. Validated NL-to-SQL generation and role-based query enforcement.
7. PDF/Excel report generation.

The current prototype deliberately keeps the demo data local so it can run immediately without requiring credentials.
