# ProfileForge

A production-ready bio link platform inspired by guns.lol — built with Next.js 15, PostgreSQL, Prisma, NextAuth, UploadThing, and Framer Motion.

## Features

- **Authentication** — Register, login, logout, password reset, email verification, OAuth (Discord, Google, GitHub)
- **Profiles** — Public pages at `yoursite.com/username` with avatar, banner, bio, social links
- **Customization** — Colors, fonts, glassmorphism, neon effects, particles, mouse effects, video/GIF backgrounds
- **Music** — MP3 uploads, autoplay, loop, volume control, playlists, audio visualizer
- **Analytics** — Views, unique visitors, link clicks, devices, daily growth charts
- **Premium** — Tiered plans with badges, animated usernames, custom domains, advanced analytics
- **Admin Panel** — User management, ban system, premium grants, platform stats

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS 4 |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v5 |
| Uploads | UploadThing |
| Animation | Framer Motion |
| Charts | Recharts |
| Email | Resend |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local, Neon, Supabase, or Vercel Postgres)

### Installation

```bash
cd profileforge
npm install
cp .env.example .env
```

### Environment Variables

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/profileforge"
AUTH_SECRET="run: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# OAuth (optional)
AUTH_DISCORD_ID=""
AUTH_DISCORD_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Email
RESEND_API_KEY=""
EMAIL_FROM="ProfileForge <noreply@yourdomain.com>"

# UploadThing — get keys at uploadthing.com
UPLOADTHING_TOKEN=""
UPLOADTHING_APP_ID=""

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma db push
# or for migrations:
npx prisma migrate dev --name init
```

### Create Admin User

After registering a user, promote them to admin via Prisma Studio or SQL:

```bash
npx prisma studio
```

Set `role` to `ADMIN` on your user record.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.example`
4. Add Vercel Postgres or connect Neon/Supabase `DATABASE_URL`
5. Deploy

Post-deploy:

```bash
npx prisma db push
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, password reset
│   ├── (dashboard)/     # Dashboard, editor, analytics, music
│   ├── admin/           # Admin panel
│   ├── [username]/      # Public profile pages
│   ├── api/             # REST API routes
│   └── demo/            # Demo profile
├── components/
│   ├── layout/          # Navigation
│   ├── profile/         # Profile display, music, effects
│   ├── landing/         # Landing page
│   └── ui/              # Reusable UI components
└── lib/
    ├── auth.ts          # NextAuth configuration
    ├── prisma.ts        # Database client
    ├── email.ts         # Resend email helpers
    └── validations.ts   # Zod schemas
prisma/
└── schema.prisma        # Full database schema
```

## API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/register` | POST | Create account |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers |
| `/api/forgot-password` | POST | Send reset email |
| `/api/reset-password` | POST | Reset password |
| `/api/verify-email` | POST | Verify email |
| `/api/profile` | GET, PATCH | Own profile CRUD |
| `/api/profile/[username]` | GET, POST | Public profile + view tracking |
| `/api/analytics` | GET | Analytics data |
| `/api/follow` | GET, POST | Follow/unfollow |
| `/api/like` | POST | Like/unlike |
| `/api/social-links` | GET, POST, DELETE | Social links |
| `/api/music` | GET, POST, PATCH, DELETE | Music playlist |
| `/api/link-click` | POST | Track link clicks |
| `/api/uploadthing` | GET, POST | File uploads |
| `/api/admin` | GET, PATCH | Admin actions |
| `/api/settings` | GET, PATCH | User settings |
| `/api/theme` | PATCH | Custom theme |

## License

MIT
