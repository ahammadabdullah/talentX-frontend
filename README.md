# TalentX Frontend

A Next.js 15 frontend for the TalentX MVP - an AI-powered talent matching platform.

## Tech Stack

- **Next.js 15** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **NextAuth.js v5** - Authentication
- **shadcn/ui** - Component library

## Architecture

- Backend is the source of truth
- Frontend does not duplicate business logic
- All role enforcement in UI AND backend
- REST API only (no direct DB access)

## Features

### Public Pages

- `/jobs` - Job listing with search
- `/jobs/[id]` - Job detail page with apply functionality

### Authentication

- `/login` - Email-based authentication
- `/onboarding` - Role selection (EMPLOYER | TALENT)

### Employer Features

- `/employer/dashboard` - View jobs and applications
- `/employer/jobs/new` - Create jobs with AI-generated descriptions
- `/employer/jobs/[id]` - View applicants and AI talent matching

### Talent Features

- `/talent/dashboard` - AI-ranked job feed
- `/talent/invitations` - Manage job invitations

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with:

   ```
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── jobs/              # Public job pages
│   ├── login/             # Authentication
│   ├── onboarding/        # Role selection
│   ├── employer/          # Employer dashboard & features
│   └── talent/            # Talent dashboard & features
├── components/            # React components
│   ├── ui/               # shadcn components
│   └── navigation.tsx    # Navigation component
├── lib/                  # Utilities
│   ├── auth.ts          # NextAuth configuration
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
├── providers/           # React providers
├── types/              # TypeScript types
└── middleware.ts       # Route protection
```

## Key Features

### Authentication

- NextAuth.js with email-based authentication
- JWT session strategy
- Role-based access control
- Automatic redirects based on user role

### Job Management

- Public job listing with search
- AI-generated job descriptions
- Application tracking
- Deadline management

### AI-Powered Matching

- Talent scoring (0-100)
- Ranked job recommendations
- Intelligent invitations

### Responsive Design

- Mobile-first approach
- Clean, professional UI
- Tailwind CSS for consistency

## API Integration

All API calls go through the backend REST API:

- Authentication: `/auth/login`
- Jobs: `/jobs/*`
- Employer: `/employer/*`
- Talent: `/talent/*`

Every authenticated request includes:

```
Authorization: Bearer <access_token>
```

## Development

### Type Safety

All types are defined in `/src/types/index.ts` and must match backend models:

```typescript
export type UserRole = "EMPLOYER" | "TALENT";
export type ApplicationSource = "MANUAL" | "INVITATION";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";
```

### Error Handling

- All API calls include proper error handling
- Loading states for all async operations
- User-friendly error messages

### Code Style

- TypeScript strict mode
- ESLint configuration
- Consistent component patterns

## Deployment

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Environment Variables

| Variable              | Description        | Example                 |
| --------------------- | ------------------ | ----------------------- |
| `NEXTAUTH_SECRET`     | NextAuth.js secret | `your-secret-key`       |
| `NEXTAUTH_URL`        | Application URL    | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend API URL    | `http://localhost:8080` |

## License

This project is part of the TalentX MVP.
