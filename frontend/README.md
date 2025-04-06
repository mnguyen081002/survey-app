# Survey Platform Frontend

A modern survey platform built with React, TypeScript, and NextUI.

## Features

- Create and manage surveys
- Respond to surveys
- View survey reports
- Export reports to DOCX
- Google OAuth authentication

## Tech Stack

- React
- TypeScript
- Vite
- NextUI
- Tailwind CSS
- React Query
- SurveyJS
- React Router

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

To build the app for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── hooks/         # Custom hooks
├── services/      # API services
├── utils/         # Utility functions
├── contexts/      # React contexts
├── types/         # TypeScript types
└── assets/        # Static assets
```

## API Integration

The frontend expects a backend API at `http://localhost:3000`. The API endpoints are:

- `GET /api/surveys` - Get all surveys
- `GET /api/surveys/:id` - Get a survey by ID
- `POST /api/surveys` - Create a survey
- `PUT /api/surveys/:id` - Update a survey
- `DELETE /api/surveys/:id` - Delete a survey
- `POST /api/surveys/:id/responses` - Submit a response
- `GET /api/surveys/:id/responses` - Get survey responses
- `GET /api/reports/:id` - Get a report

## Authentication

The app uses Google OAuth for authentication. You'll need to:

1. Create a Google OAuth client ID
2. Add the client ID to your environment variables
3. Configure the backend to handle OAuth callbacks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
