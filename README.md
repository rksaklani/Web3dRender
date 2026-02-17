# Web3DRender - 3D Visualization Platform

A full-stack web application for collaborative 3D model visualization, Web3DRender

## Project Structure

```
3dView/
├── Frontend/          # React.js frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   └── services/     # API services
│   └── package.json
│
└── Backend/           # Node.js backend
    ├── routes/        # API routes
    ├── middleware/    # Auth middleware
    ├── config/        # Database config
    ├── migrations/    # Database migrations
    └── package.json
```

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Multer (File uploads)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Web3DRender_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
```

5. Create the PostgreSQL database:
```sql
CREATE DATABASE Web3DRender_db;
```

6. Run migrations:
```bash
npm run migrate
```

7. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features

- ✅ User Authentication (Register/Login)
- ✅ Project Management
- ✅ 3D Model Upload
- ✅ Dashboard with Statistics
- ✅ Responsive UI matching Web3DRender.app design
- ✅ Multiple pages: Home, About, Pricing, Contact

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects (Requires Auth)
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Models (Requires Auth)
- `GET /api/models` - Get all models
- `GET /api/models/:id` - Get single model
- `POST /api/models/upload` - Upload 3D model
- `DELETE /api/models/:id` - Delete model

### Users (Requires Auth)
- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/stats` - Get user statistics

## Development

### Backend
- Development: `npm run dev` (uses nodemon)
- Production: `npm start`

### Frontend
- Development: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## License

MIT
