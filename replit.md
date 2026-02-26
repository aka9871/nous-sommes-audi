# Nous Sommes Audi

Plateforme de présentation des assets de communication Audi pour Romance Agency.

## Architecture

- **Frontend**: React 19 + TypeScript + TailwindCSS v4 + Framer Motion + Wouter
- **Backend**: Express 5 + Node.js + dotenv
- **Build**: Vite 7
- **UI Components**: Radix UI / shadcn
- **Fonts**: Audi Type (custom, in attached_assets/)

## Key Features

- PIN authentication (server-side, env var `AUTH_PIN`)
- Dynamic directory scanning from `content/` folder (env var `CONTENT_DIR`)
- Device mockups for video display (iPhone/TikTok/FB/Instagram, iPad, TV)
- JSON metadata files for asset descriptions and type overrides
- Confidentiality notices

## File Structure

- `server/index.ts` - Express server entry with dotenv
- `server/routes.ts` - API routes: `/api/auth/verify`, `/api/folders`, `/api/folders/:id`, static `/uploads`
- `client/src/components/auth/AuthGuard.tsx` - PIN auth guard
- `client/src/components/layout/AppLayout.tsx` - Main layout with sidebar nav (fetches from API)
- `client/src/components/media/DeviceFrame.tsx` - Device mockup components
- `client/src/pages/Home.tsx` - Main page (fetches folders/assets from API)
- `client/src/data/mockData.ts` - TypeScript types only
- `content/` - Where webmasters place asset files (not in git)

## Environment Variables

- `AUTH_PIN` - PIN code for authentication
- `PORT` - Server port (default 5000)
- `CONTENT_DIR` - Path to content directory (default `./content`)

## GitHub

Repo: https://github.com/aka9871/nous-sommes-audi (private)
Deployed at: https://www.noussommesaudi.fr
