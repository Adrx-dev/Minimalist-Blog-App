# Deploying MiniBlog to Cloudflare Pages

This guide will help you deploy your MiniBlog application to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account
2. Your Supabase project set up and running
3. Node.js 18+ installed locally

## Deployment Steps

### 1. Install Wrangler CLI

\`\`\`bash
npm install -g wrangler
\`\`\`

### 2. Login to Cloudflare

\`\`\`bash
wrangler login
\`\`\`

### 3. Build the Application

\`\`\`bash
npm run build
\`\`\`

### 4. Deploy to Cloudflare Pages

\`\`\`bash
npm run deploy
\`\`\`

Or manually:

\`\`\`bash
wrangler pages deploy .next --project-name=minimalist-blog
\`\`\`

### 5. Configure Environment Variables

In the Cloudflare Dashboard:

1. Go to Pages → Your Project → Settings → Environment Variables
2. Add the following variables for **Production**:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://bpzmonsdihmvawtlurhl.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your-anon-key`

3. Add the same variables for **Preview** environment

### 6. Configure Supabase Authentication

In your Supabase Dashboard:

1. Go to Authentication → Settings
2. Update **Site URL** to your Cloudflare Pages domain (e.g., `https://minimalist-blog.pages.dev`)
3. Add **Redirect URLs**:
   - `https://your-domain.pages.dev/auth/callback`
   - `https://your-domain.pages.dev/auth/confirm`

## Custom Domain (Optional)

1. In Cloudflare Pages → Custom Domains
2. Add your custom domain
3. Update Supabase settings with your custom domain

## Automatic Deployments

Connect your GitHub repository to Cloudflare Pages for automatic deployments:

1. Go to Pages → Create a project → Connect to Git
2. Select your repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Node.js version**: `18`

## Environment Variables in Production

Make sure to set these in Cloudflare Pages dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`

## Troubleshooting

### Build Issues

If you encounter build issues:

1. Check Node.js version (should be 18+)
2. Clear cache: `rm -rf .next node_modules && npm install`
3. Check environment variables are set correctly

### Authentication Issues

1. Verify Supabase URLs are correct in Cloudflare Pages settings
2. Check that redirect URLs match your domain
3. Ensure email confirmation is properly configured

### Performance Optimization

1. Images are automatically optimized for Cloudflare
2. Static assets are cached with appropriate headers
3. API routes are configured with no-cache headers

## Monitoring

Monitor your deployment:

1. Cloudflare Analytics for traffic and performance
2. Supabase Dashboard for database and auth metrics
3. Browser DevTools for client-side performance
