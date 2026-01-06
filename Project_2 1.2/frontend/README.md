# PrepSphere Frontend

This is the frontend application for PrepSphere, built with Next.js, TailwindCSS, and ShadCN UI.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **UI Components**: ShadCN UI
- **Authentication**: Clerk
- **State Management**: React Context API

## Prerequisites

- Node.js 18.x or higher
- npm or yarn

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                 # App router pages
│   ├── dashboard/       # Role-based dashboards
│   │   ├── student/     # Student dashboard
│   │   ├── tpo/         # TPO dashboard
│   │   └── admin/       # Admin dashboard
│   └── ...              # Other pages
├── components/          # Reusable components
│   └── ui/             # ShadCN UI components
├── lib/                 # Utility functions
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run start` - Runs the built app in production mode
- `npm run lint` - Runs ESLint to check for issues

## Deployment

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.