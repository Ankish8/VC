# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a VectorCraft landing page built with Next.js 15, Tailwind CSS v4, and Magic UI components. It's designed as a modern SaaS marketing website for an AI-powered vector image conversion service.

## Development Commands
```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Technology Stack
- **Framework**: Next.js 15.3.5 with App Router
- **Styling**: Tailwind CSS v4 with custom utility classes
- **UI Components**: Custom components built with Radix UI primitives
- **Animations**: Framer Motion for animations and transitions
- **Icons**: Lucide React, React Icons, and Tabler Icons
- **Charts**: Recharts for data visualization
- **TypeScript**: Strict mode enabled for type safety

## Architecture Overview

### Directory Structure
- `/src/app/` - Next.js App Router pages and layouts
  - `(auth)/` - Authentication pages (login, signup)
  - `(marketing)/` - Marketing pages including blog
  - Main landing page sections imported from components
- `/src/components/` - Reusable React components
  - `sections/` - Major page sections (hero, features, pricing, etc.)
  - `magicui/` - Custom animated UI components
  - `ui/` - Base UI components (buttons, cards, inputs, etc.)
- `/src/lib/` - Utility functions and configuration
  - `config.tsx` - Site-wide configuration and content
  - `utils.ts` - Helper functions including `cn()` for className merging

### Key Patterns
1. **Component-based sections**: Main page assembled from modular section components
2. **Configuration-driven content**: Site content centralized in `lib/config.tsx`
3. **Tailwind v4 with CSS variables**: Uses oklch color space and CSS custom properties
4. **Path aliases**: Use `@/` to import from `src/` directory

### Styling Approach
- Global styles in `app/globals.css` with Tailwind directives
- Custom CSS properties for theming (light/dark mode support)
- Special classes:
  - `.aurora-text` - Animated gradient text effect
  - `.line-shadow-text` - Text with line shadow effect
  - `.rainbow-button` - Animated rainbow border button
  - `.shiny-button` - Button with shine effect
  - `.hero-gradient` - Hero section gradient background

### Component Guidelines
- All components use TypeScript with proper typing
- Framer Motion used for entrance animations and interactions
- Components follow composition pattern with variants
- Use `cn()` utility from `lib/utils` for conditional classNames
- Maintain consistent spacing using Tailwind utilities

## Important Notes
- This project uses Tailwind CSS v4 (latest alpha) with new features
- Images are served from `/public` directory
- Remote images allowed from `localhost` and `randomuser.me`
- Blog content uses MDX files in `/content` directory
- The site is optimized for performance with Next.js font optimization