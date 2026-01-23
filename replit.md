# Career Companion

## Overview

Career Companion is a web-based application designed to help students and early-career job seekers organize their job search process. The app provides three core features:

1. **Application Tracker** - Track job applications with status management (Saved, Applied, Interview, Rejected)
2. **Job Fit Analysis** - AI-powered analysis comparing CVs against job descriptions to provide fit scores and recommendations
3. **Cover Letter Generator** - AI-assisted cover letter generation based on CV content and job descriptions

The application follows a friendly, playful design aesthetic with pastel colors, rounded corners, and supportive microcopy to create a "companion-like" feel rather than a corporate tool.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Shadcn/ui component library (Radix primitives)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite

The frontend follows a pages-based architecture with shared components. Key directories:
- `client/src/pages/` - Route components (Welcome, Onboarding, Dashboard, etc.)
- `client/src/components/` - Reusable components including Layout and UI primitives
- `client/src/hooks/` - Custom hooks for data fetching (applications, documents, analysis)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Style**: REST endpoints under `/api/*`
- **Build**: esbuild for production bundling

Routes are defined in `server/routes.ts` with a typed API contract in `shared/routes.ts` using Zod schemas.

### Database Layer
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Schema Location**: `shared/schema.ts`
- **Migrations**: `drizzle-kit push` for schema synchronization

Core tables:
- `users` - User profiles with onboarding data
- `documents` - CVs and cover letters (text content)
- `applications` - Job applications with status tracking
- `analysis_results` - AI-generated job fit analysis
- `generated_cover_letters` - AI-generated cover letter content

### AI Integration
- **Provider**: OpenAI via Replit AI Integrations
- **Features**: Job fit analysis and cover letter generation
- **Configuration**: Uses `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Drizzle table definitions and Zod insert schemas
- `routes.ts` - API route definitions with input/output types

## External Dependencies

### Database
- **PostgreSQL** - Primary data store
- **Connection**: Via `DATABASE_URL` environment variable
- **Session Store**: connect-pg-simple for Express sessions

### AI Services
- **OpenAI API** - Accessed through Replit AI Integrations
- **Environment Variables**:
  - `AI_INTEGRATIONS_OPENAI_API_KEY`
  - `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod` - Database ORM and schema validation
- `@tanstack/react-query` - Async state management
- `framer-motion` - Animations
- `date-fns` - Date formatting
- `zod` - Runtime type validation

### Development Tools
- Vite with React plugin for frontend dev server
- Replit-specific plugins for error overlay and dev banner
- TSX for running TypeScript directly in development