# Telegram Ads Bot Manager

## Overview

This is a full-stack web application for managing automated Telegram advertisement campaigns. It provides a comprehensive dashboard for creating ads, managing Telegram groups, scheduling message deliveries, and monitoring campaign performance. The application features a React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Session Management**: Express sessions with PostgreSQL storage
- **Development**: tsx for TypeScript execution in development

### Database Layer
- **Primary Database**: PostgreSQL via NeonDB serverless connection
- **ORM**: Drizzle ORM with zod schema validation
- **Migrations**: Drizzle Kit for database schema management
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`

## Key Components

### Core Entities
1. **Ads**: Advertisement content with title, content, and active status
2. **Groups**: Telegram group management with chat IDs and activation status
3. **Schedules**: Automated message scheduling system
4. **Logs**: Activity tracking and error logging
5. **Settings**: Application configuration storage

### Services
1. **Telegram Bot Service**: Handles Telegram API integration and message sending
2. **Scheduler Service**: Cron-based automated message scheduling
3. **Storage Service**: Data access layer with in-memory fallback support

### Frontend Pages
- **Dashboard**: Overview with statistics, recent activity, and quick actions
- **Ads Management**: Create, edit, and manage advertisement content
- **Groups Management**: Telegram group configuration and monitoring
- **Schedule View**: Automated message scheduling overview
- **Activity Logs**: System activity and error monitoring
- **Settings**: Bot configuration and system preferences

## Data Flow

1. **Ad Creation**: Users create ads through the frontend form, validated with zod schemas
2. **Group Registration**: Telegram groups are registered with their chat IDs
3. **Automatic Scheduling**: The scheduler service automatically creates schedules based on active ads and groups
4. **Message Delivery**: Cron jobs process pending schedules and send messages via Telegram Bot API
5. **Activity Logging**: All operations are logged for monitoring and debugging
6. **Real-time Updates**: Frontend polls for updates every 30-60 seconds using React Query

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Database ORM with PostgreSQL dialect
- **node-telegram-bot-api**: Telegram Bot API integration
- **node-cron**: Scheduled task management
- **connect-pg-simple**: PostgreSQL session storage

### UI Dependencies
- **@radix-ui/***: Primitive UI components for accessibility
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **@hookform/resolvers**: Form validation resolvers
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Development server and build tool
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Process**: tsx runs the TypeScript server directly
- **Hot Reload**: Vite handles frontend hot module replacement
- **Port**: Application runs on port 5000

### Production Build
- **Frontend Build**: `vite build` creates optimized static assets
- **Backend Build**: `esbuild` bundles the server code
- **Output**: Static assets in `dist/public`, server bundle in `dist/index.js`
- **Deployment**: Configured for Replit autoscale deployment

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **TELEGRAM_BOT_TOKEN**: Telegram bot authentication token
- **NODE_ENV**: Environment specification (development/production)

### Database Management
- **Schema Push**: `npm run db:push` applies schema changes
- **Migrations**: Stored in `/migrations` directory
- **Connection**: Uses connection pooling via NeonDB serverless

## Changelog
- June 27, 2025. Initial setup
- June 27, 2025. Expanded bot configuration with username, ID, and phone number fields
- June 27, 2025. Added detailed group view with Telegram API integration
- June 27, 2025. Implemented bot connection testing functionality

## User Preferences

Preferred communication style: Simple, everyday language.