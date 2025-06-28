# Mentor-Mentee Matching Application

A full-featured web application for connecting mentors and mentees, built with Next.js frontend and FastAPI backend.

## Project Overview

This project implements a mentor-mentee matching platform where:
- Users can sign up as either mentors or mentees
- Mentees can search for and filter mentors based on skills and interests
- Users can send, accept, reject, and manage match requests
- Users can update their profiles and manage their connections

## Tech Stack

### Frontend
- **Framework**: Next.js with TypeScript
- **UI**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **API Client**: Axios

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite
- **Authentication**: JWT tokens
- **Password Security**: bcrypt hashing

## Project Structure

```
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── mentor_mentee.db           # SQLite database
│   └── create_test_accounts.py    # Script to create test accounts
│
└── frontend/
    ├── public/                    # Static assets
    └── src/
        ├── app/
        │   ├── api/               # Next.js API routes (proxy to backend)
        │   │   ├── auth/          # Authentication endpoints
        │   │   ├── profile/       # Profile management
        │   │   ├── mentors/       # Mentor listing and filtering
        │   │   ├── match-requests/# Match request management
        │   │   └── images/        # Image serving endpoints
        │   ├── (auth)/            # Authentication pages
        │   ├── (dashboard)/       # Protected dashboard pages
        │   └── layout.tsx         # Root layout
        ├── components/            # Reusable UI components
        ├── lib/
        │   └── api.ts             # API client for frontend
        └── middleware.ts          # Authentication middleware
```## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user details

### Profile Management
- `PUT /api/profile/update` - Update user profile

### Mentors
- `GET /api/mentors/list` - List and filter available mentors

### Match Requests
- `POST /api/match-requests/create` - Create a new match request
- `GET /api/match-requests/incoming` - View incoming match requests
- `GET /api/match-requests/outgoing` - View outgoing match requests
- `POST /api/match-requests/[id]/accept` - Accept a match request
- `POST /api/match-requests/[id]/reject` - Reject a match request
- `POST /api/match-requests/[id]/cancel` - Cancel an outgoing request

### Resources
- `GET /api/images/[role]/[id]` - Retrieve user profile images

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Create a Python virtual environment (recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install required dependencies:
   ```
   pip install fastapi uvicorn sqlalchemy bcrypt python-jose[cryptography]
   ```
4. Run the FastAPI server:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
5. Create test accounts (optional):
   ```
   python create_test_accounts.py
   ```### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install NPM dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Access the application at `http://localhost:3002`

## Test Accounts

The application comes with pre-configured test accounts for demonstration:

### Mentor Accounts
- Email: `mentor@example.com`
- Password: `password123`

### Mentee Accounts
- Email: `mentee@example.com`
- Password: `password123`

## Features Implemented

- ✅ User authentication (login/signup/logout)
- ✅ Role-based access control (mentor vs mentee)
- ✅ Profile management
- ✅ Mentor discovery with filtering
- ✅ Match request creation and management
- ✅ Responsive design for mobile and desktop
- ✅ JWT authentication via HTTP-only cookies
- ✅ Password security with bcrypt hashing
- ✅ API proxy layer for security and CORS handling

## Testing

All frontend UI elements have required data-testid and class attributes for automated testing. The application has been tested with the provided test accounts to ensure all user flows work correctly.

## Deployment

The application is configured for deployment, with environment variables handling different backend URLs in production vs development environments.

```
BACKEND_URL=http://api.example.com  # Production backend URL
```

For local development, the default backend URL is `http://localhost:8000/api`.