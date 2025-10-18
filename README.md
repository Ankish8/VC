# Raster to SVG Converter

A modern, full-stack web application that converts raster images (PNG, JPG, WEBP) into scalable vector graphics (SVG) using the Fal.ai Recraft API.

## Features

### Core Functionality
- **Image Upload**: Drag-and-drop or click-to-browse file upload with real-time validation
- **AI-Powered Conversion**: Convert raster images to SVG using Fal.ai's Recraft vectorization API
- **Preview & Compare**: Side-by-side comparison of original and converted images
- **Download & Export**: Download SVG files or copy SVG code to clipboard
- **Conversion History**: View, manage, and re-download all your past conversions

### Technical Features
- **User Authentication**: Secure email/password authentication with NextAuth.js
- **Database Storage**: All conversions and user data stored in SQLite (Prisma ORM)
- **File Management**: Secure file storage using Vercel Blob Storage
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Progress**: Live progress tracking during upload and conversion
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Tech Stack

### Frontend
- **Next.js 15.5** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Hook Form** - Form validation and management
- **Zod** - Schema validation
- **Sonner** - Toast notifications
- **next-themes** - Dark mode support
- **lucide-react** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Modern ORM for database access
- **SQLite** - Lightweight embedded database
- **NextAuth.js v5** - Authentication library
- **bcryptjs** - Password hashing
- **@fal-ai/client** - Fal.ai API integration
- **@vercel/blob** - File storage solution

## Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Fal.ai API Key** (already configured in `.env.local`)
- **Vercel Account** (optional, for blob storage in production)

## Getting Started

### 1. Installation

```bash
cd raster-to-svg
npm install
```

### 2. Environment Setup

The project already has `.env.local` configured with:
- `DATABASE_URL` - SQLite database path
- `NEXTAUTH_URL` - Application URL (http://localhost:3000)
- `NEXTAUTH_SECRET` - Secret for JWT signing
- `FAL_API_KEY` - Fal.ai API key (already configured)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token (add your own for production)

**Important**: Generate a secure `NEXTAUTH_SECRET` for production:
```bash
openssl rand -base64 32
```

### 3. Database Setup

The database is already migrated and ready to use:

```bash
# To reset the database (if needed)
npx prisma migrate reset

# To generate Prisma client after schema changes
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
raster-to-svg/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/         # Protected dashboard pages
│   │   │   ├── convert/         # Main conversion page
│   │   │   └── history/         # Conversion history
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # NextAuth & registration
│   │   │   ├── upload/          # File upload endpoint
│   │   │   ├── convert/         # Conversion endpoint
│   │   │   └── conversions/     # History API
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page (redirects)
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── auth/                # Auth form components
│   │   ├── converter/           # Conversion UI components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── layout/              # Layout components (Navbar)
│   │   └── providers/           # Context providers
│   ├── lib/                     # Utility libraries
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── db.ts                # Prisma client
│   │   ├── fal-client.ts        # Fal.ai API wrapper
│   │   ├── validation.ts        # Image validation
│   │   ├── file-utils.ts        # File handling utilities
│   │   ├── session.ts           # Session helpers
│   │   └── utils.ts             # General utilities
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts             # Shared types
│   │   └── next-auth.d.ts       # NextAuth type extensions
│   └── middleware.ts            # Route protection middleware
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── dev.db                   # SQLite database
│   └── migrations/              # Database migrations
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── .env.example                 # Environment template
├── API_KEY.md                   # API key documentation
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js configuration
└── package.json                 # Dependencies

```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth authentication
- `GET /api/auth/[...nextauth]` - NextAuth session management

### Conversion
- `POST /api/upload` - Upload image file
- `POST /api/convert` - Convert image to SVG
- `GET /api/conversions` - List user's conversions
- `GET /api/conversions/[id]` - Get single conversion
- `DELETE /api/conversions/[id]` - Delete conversion

## Database Schema

### Users Table
- `id` - Unique identifier
- `email` - User email (unique)
- `password` - Hashed password
- `name` - User name (optional)
- `createdAt` - Registration date
- `updatedAt` - Last update date

### Conversions Table
- `id` - Unique identifier
- `userId` - Owner user ID (foreign key)
- `originalImageUrl` - Original image URL (blob storage)
- `svgUrl` - Converted SVG URL (blob storage)
- `originalFilename` - Original file name
- `svgFilename` - SVG file name
- `originalFileSize` - Original file size in bytes
- `svgFileSize` - SVG file size in bytes
- `originalDimensions` - Image dimensions (width x height)
- `status` - Conversion status (pending/processing/completed/failed)
- `errorMessage` - Error message (if failed)
- `createdAt` - Conversion date

## Image Constraints

- **Supported Formats**: PNG, JPG, JPEG, WEBP
- **Maximum File Size**: 5 MB
- **Maximum Resolution**: 16 Megapixels
- **Maximum Dimension**: 4096 pixels
- **Minimum Dimension**: 256 pixels

## Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXTAUTH_SECRET`
   - `FAL_API_KEY`
   - `BLOB_READ_WRITE_TOKEN`
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Railway**
- **Render**
- **AWS Amplify**
- **DigitalOcean App Platform**

**Note**: Update `DATABASE_URL` to use PostgreSQL or MySQL for production instead of SQLite.

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

### Database Commands
```bash
# View database in Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Delete `.next` folder and rebuild: `rm -rf .next && npm run build`
- Regenerate Prisma client: `npx prisma generate`

### Database Issues
- Reset database: `npx prisma migrate reset`
- Check DATABASE_URL in `.env.local`
- Ensure database file has write permissions

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### API Errors
- Verify FAL_API_KEY is correct
- Check network connectivity
- Review API logs in console

## Security Considerations

- ✅ Passwords are hashed with bcryptjs (12 rounds)
- ✅ JWT tokens used for session management
- ✅ Protected routes with middleware
- ✅ Input validation on all endpoints
- ✅ CSRF protection via NextAuth
- ✅ SQL injection prevention via Prisma
- ✅ File type validation
- ✅ Rate limiting recommended for production

## Performance

- ✅ Server-side rendering for fast initial load
- ✅ Code splitting for optimized bundles
- ✅ Image optimization with Next.js Image
- ✅ Lazy loading for components
- ✅ Database indexing on frequently queried fields
- ✅ Caching strategies for API responses

## License

This project is proprietary software developed for image conversion services.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments for implementation details
3. Check Fal.ai documentation for API-related issues

## Credits

- **Fal.ai** - AI-powered image vectorization
- **shadcn/ui** - Beautiful UI components
- **Next.js** - React framework
- **Vercel** - Hosting and blob storage
- **Prisma** - Database ORM

---

Built with ❤️ using Next.js, TypeScript, and Fal.ai
