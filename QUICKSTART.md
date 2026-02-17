# Quick Start Guide

Follow these steps to get your Nira project up and running:

## Step 1: Setup PostgreSQL Database

1. Make sure PostgreSQL is installed and running
2. Open PostgreSQL command line or pgAdmin
3. Create the database:
```sql
CREATE DATABASE nira_db;
```

## Step 2: Setup Backend

1. Open terminal in the `Backend` folder
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (see `Backend/ENV_SETUP.md` for template)
4. Update `.env` with your database credentials
5. Run migrations to create tables:
```bash
npm run migrate
```

6. Start the backend server:
```bash
npm run dev
```

Backend should now be running on `http://localhost:5000`

## Step 3: Setup Frontend

1. Open a new terminal in the `Frontend` folder
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend should now be running on `http://localhost:3000`

## Step 4: Test the Application

1. Open your browser and go to `http://localhost:3000`
2. Click "Sign Up" to create a new account
3. After registration, you'll be redirected to the dashboard
4. Start creating projects and uploading 3D models!

## Troubleshooting

### Backend won't start
- Check that PostgreSQL is running
- Verify database credentials in `.env` file
- Make sure the database `nira_db` exists

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env` (if created)
- Check browser console for CORS errors

### Database connection errors
- Verify PostgreSQL service is running
- Check database name, user, and password in `.env`
- Ensure database `nira_db` has been created

## Next Steps

- Customize the UI colors and branding
- Add more features to the dashboard
- Implement 3D model viewer (consider Three.js or similar)
- Add more authentication features (password reset, email verification)
- Deploy to production
