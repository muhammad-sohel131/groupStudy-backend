# Server-Side Documentation for Group-Study Project

## Description
A server-side application for managing assignments with JWT authentication and MongoDB integration.

## Features
- Create, update, and delete assignments.
- Filter assignments by difficulty level.
- Search assignments by title.
- Authentication using JWT.
- Secure login with cookies.

## Installation
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file and add your environment variables (e.g., database URI, JWT secret).
4. Start the server with `npm start`.

## Endpoints
- `POST /assignments`: Create a new assignment.
- `GET /assignments`: Fetch all assignments.
- `PUT /assignments/:id`: Update an assignment.
- `DELETE /assignments/:id`: Delete an assignment.

## Tools & Technologies
- Node.js
- Express.js
- MongoDB
- JWT Authentication
