# Quick Start Guide

Get your Raster to SVG converter running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Terminal/Command Line access

## Steps

### 1. Navigate to Project Directory

```bash
cd raster-to-svg
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages (takes 1-2 minutes).

### 3. Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.5.5
- Local: http://localhost:3000
```

### 4. Open the Application

Open your browser and go to: **http://localhost:3000**

You'll be automatically redirected to the login page.

### 5. Create an Account

1. Click "Create an account" or go to `/register`
2. Enter your email and password
3. Click "Create account"
4. You'll be automatically logged in and redirected to the converter

### 6. Convert Your First Image

1. Drag and drop an image (PNG, JPG, or WEBP)
   - Or click "Upload an image to convert" to browse
2. Wait for the conversion (usually 5-15 seconds)
3. View the result and download your SVG!

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database in browser
npx prisma studio

# Reset database (if needed)
npx prisma migrate reset
```

## First Time Setup Complete!

Your application is now running with:
- ✅ Database initialized (SQLite)
- ✅ Authentication configured
- ✅ Fal.ai API ready
- ✅ All dependencies installed

## Next Steps

### Access Your Conversions
- Go to `/history` to view all your conversions
- Search, filter, download, or delete conversions

### Customize
- Change app name in `src/components/layout/Navbar.tsx`
- Modify colors in `src/app/globals.css`
- Update metadata in `src/app/layout.tsx`

### Production Deployment
See `README.md` for detailed deployment instructions.

## Troubleshooting

### Port Already in Use
If port 3000 is busy, the app will automatically use the next available port.

### Build Errors
```bash
# Delete build cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Database Issues
```bash
# Reset the database
npx prisma migrate reset
```

### Still Having Issues?
Check the main `README.md` file for detailed troubleshooting steps.

---

Happy converting! 🎨➡️📐
