# Environment Files Setup

Since `.env` files are typically gitignored, you need to create them manually. Here's how:

## Backend .env File

1. Go to the `Backend` folder
2. Copy the file `env.template` and rename it to `.env`
3. Update the following values:
   - `DB_PASSWORD`: Change `postgres` to your actual PostgreSQL password
   - `JWT_SECRET`: Change to a secure random string (you can generate one online)

### Quick Copy Command (Windows PowerShell):
```powershell
cd Backend
Copy-Item env.template .env
```

Then edit `.env` and update the password and JWT secret.

## Frontend .env File (Optional)

1. Go to the `Frontend` folder
2. Copy the file `env.template` and rename it to `.env`
3. The default value should work, but you can change the API URL if your backend runs on a different port

### Quick Copy Command (Windows PowerShell):
```powershell
cd Frontend
Copy-Item env.template .env
```

## Important Notes

- **Never commit `.env` files to git** - they contain sensitive information
- The `.env` files are already in `.gitignore`
- Update `DB_PASSWORD` with your actual PostgreSQL password
- Change `JWT_SECRET` to a secure random string for production

## Default Values

### Backend
- Port: 5000
- Database: nira_db
- Database User: postgres
- Database Password: **UPDATE THIS**

### Frontend
- API URL: http://localhost:5000/api
