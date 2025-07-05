# Deploying MiniBlog to Cloudflare Pages

## Quick Deployment Steps

### 1. Prepare Your Repository
Make sure your code is pushed to GitHub with all the configuration files.

### 2. Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Connect to your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (leave empty)
   - **Environment variables**: Add your Supabase credentials

### 3. Environment Variables

In Cloudflare Pages → Settings → Environment Variables, add:

**Production Environment:**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://bpzmonsdihmvawtlurhl.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwem1vbnNkaWhtdmF3dGx1cmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjYxNDMsImV4cCI6MjA2NzMwMjE0M30.hMKc6mDAR7LXBIADx0v9wCQqZigDybMHDjXsNo3A8lo`
- `NODE_ENV` = `production`

**Preview Environment:**
- Same variables as production

### 4. Update Supabase Settings

In your Supabase Dashboard → Authentication → Settings:

1. **Site URL**: Update to your Cloudflare Pages domain
   - Example: `https://minimalist-blog.pages.dev`

2. **Redirect URLs**: Add these URLs:
   - `https://your-domain.pages.dev/auth/callback`
   - `https://your-domain.pages.dev/auth/confirm`
   - `https://your-domain.pages.dev/auth/auth-code-error`

### 5. Deploy

Once configured, Cloudflare Pages will automatically:
- Build your application
- Deploy to a global CDN
- Provide preview deployments for pull requests

## Manual Deployment (Alternative)

If you prefer manual deployment:

\`\`\`bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the application
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy .next --project-name=minimalist-blog
\`\`\`

## Custom Domain (Optional)

1. In Cloudflare Pages → Custom domains
2. Add your domain
3. Update DNS settings as instructed
4. Update Supabase authentication URLs to use your custom domain

## Troubleshooting

### Build Failures
- Check Node.js version (should be 18+)
- Verify environment variables are set correctly
- Check build logs for specific errors

### Authentication Issues
- Verify Supabase URLs match your deployment domain
- Check that redirect URLs are correctly configured
- Ensure environment variables are set in both production and preview

### Image Upload Issues
- Verify Supabase Storage is properly configured
- Check that storage policies allow authenticated users to upload
- Ensure the storage bucket exists and is public

## Performance Optimization

Your app is automatically optimized for Cloudflare Pages:
- Static assets cached globally
- Images optimized and served from CDN
- Automatic compression and minification
- HTTP/2 and HTTP/3 support

## Monitoring

Monitor your deployment:
- Cloudflare Analytics for performance metrics
- Supabase Dashboard for database and auth metrics
- Browser DevTools for client-side performance
