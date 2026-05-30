AKI Assist - Chat Backend

This folder includes a minimal Express + PostgreSQL API to store user connect requests (Name, Mobile, Email, Country) and generate an 8-digit `connect_id`.

Setup

1. Install dependencies:

```bash
cd d:/github/web
npm install
```

2. Start the server. Provide `DATABASE_URL` if you want to override the default (the Railway URL can be used):

Windows (PowerShell):

```powershell
$env:DATABASE_URL = 'postgresql://postgres:yourpassword@host:port/dbname'
npm start
```

Linux / macOS:

```bash
DATABASE_URL='postgresql://postgres:yourpassword@host:port/dbname' npm start
```

If you omit `DATABASE_URL`, the embedded default (the Railway URL you provided) will be used.

Usage

POST /api/connect

Request JSON body:

{
  "option": "technical|odoo|web|mobile|other",
  "name": "Full Name",
  "mobile": "+1234567890",
  "email": "you@example.com",
  "country": "Country name"
}

Response (success):

{
  "success": true,
  "connect_id": "12345678"
}

The server creates the table `connect_requests` automatically if it does not exist.

Security

- The code reads `DATABASE_URL` from environment variables. Do not commit secrets to source control.
- The default value in the code is the connection string you provided; you can change it by setting `DATABASE_URL`.

Next steps

- Wire server behind HTTPS and configure CORS origins as needed.
- Optionally forward saved requests to email or ticketing system.
