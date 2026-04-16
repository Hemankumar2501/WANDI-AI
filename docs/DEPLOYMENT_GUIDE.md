# 🚀 WanderWise Deployment Guide

Deploy your WanderWise app to the internet and make it publicly accessible!

## 📋 Prerequisites

Before deploying, make sure you have:

- ✅ Supabase project set up with database tables
- ✅ Email authentication enabled in Supabase
- ✅ All features tested locally
- ✅ GitHub account (for deployment)

## 🌐 Recommended Deployment Options

### Option 1: Vercel (Recommended - Easiest & Free)

**Why Vercel?**

- ✅ Free hosting for personal projects
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from GitHub
- ✅ Perfect for React/Vite apps

**Steps:**

1. **Push your code to GitHub**

   ```bash
   # Initialize git (if not already done)
   git init
   git add .
   git commit -m "Initial commit - WanderWise"

   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/wanderwise.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variables:
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - Click "Deploy"

3. **Your app will be live at**: `https://your-project-name.vercel.app`

---

### Option 2: Netlify (Also Free & Easy)

**Steps:**

1. **Push code to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to https://netlify.com
   - Sign up with GitHub
   - Click "Add new site" → "Import an existing project"
   - Choose your GitHub repository
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Add Environment Variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Your app will be live at**: `https://your-project-name.netlify.app`

---

### Option 3: GitHub Pages (Free but requires more setup)

**Steps:**

1. **Install gh-pages**

   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   Add these lines:

   ```json
   {
     "homepage": "https://YOUR_USERNAME.github.io/wanderwise",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts**

   ```typescript
   export default defineConfig({
     base: "/wanderwise/",
     // ... rest of config
   });
   ```

4. **Deploy**

   ```bash
   npm run deploy
   ```

5. **Your app will be live at**: `https://YOUR_USERNAME.github.io/wanderwise`

---

## 🔧 Post-Deployment Configuration

### 1. Update Supabase Settings

After deployment, update your Supabase project:

**Authentication → URL Configuration:**

- **Site URL**: `https://your-deployed-url.vercel.app`
- **Redirect URLs**: Add these:
  - `https://your-deployed-url.vercel.app/`
  - `https://your-deployed-url.vercel.app/dashboard`
  - `https://your-deployed-url.vercel.app/reset-password`

### 2. Configure Google OAuth (Optional)

If you want Google sign-in:

**In Google Cloud Console:**

- Add to **Authorized JavaScript origins**:
  - `https://your-deployed-url.vercel.app`
- Add to **Authorized redirect URIs**:
  - `https://YOUR_SUPABASE_REF.supabase.co/auth/v1/callback`

**In Supabase:**

- Go to Authentication → Providers → Google
- Enable and add your Google OAuth credentials

### 3. Custom Domain (Optional)

**Vercel:**

- Go to Project Settings → Domains
- Add your custom domain (e.g., `wanderwise.com`)
- Update DNS records as instructed

**Netlify:**

- Go to Domain Settings
- Add custom domain
- Update DNS records

---

## 📝 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] `.env` file is NOT committed to GitHub (it's in `.gitignore`)
- [ ] Environment variables are set in deployment platform
- [ ] Supabase database tables are created
- [ ] Email provider is enabled in Supabase
- [ ] All features tested locally
- [ ] Build command works: `npm run build`
- [ ] Preview build locally: `npm run preview`

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive keys
2. **Use environment variables** in deployment platform
3. **Enable Row Level Security** in Supabase (already done)
4. **Use HTTPS only** (automatic with Vercel/Netlify)
5. **Keep dependencies updated**: `npm audit fix`

---

## 🐛 Troubleshooting

### Build Fails

- Check that all dependencies are installed
- Run `npm run build` locally to test
- Check build logs for errors

### Environment Variables Not Working

- Make sure they start with `VITE_`
- Redeploy after adding environment variables
- Check spelling and values

### Authentication Not Working

- Verify Supabase URL configuration
- Check redirect URLs in Supabase
- Ensure environment variables are set correctly

### 404 Errors on Refresh

Add a `_redirects` file (Netlify) or `vercel.json` (Vercel):

**For Netlify** - Create `public/_redirects`:

```
/*    /index.html   200
```

**For Vercel** - Create `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## 📊 Monitoring & Analytics

After deployment, consider adding:

1. **Google Analytics** - Track user behavior
2. **Sentry** - Error tracking
3. **Vercel Analytics** - Performance monitoring
4. **Supabase Dashboard** - Monitor database usage

---

## 🎉 You're Live!

Once deployed, share your app:

- Share the URL with friends and family
- Post on social media
- Add to your portfolio
- Submit to product directories

**Your WanderWise app is now live on the internet!** 🌍✨

---

## 💡 Next Steps

1. **Monitor usage** - Check Supabase dashboard for user signups
2. **Gather feedback** - Ask users for improvements
3. **Add features** - Implement trip planning, AI chat, etc.
4. **Scale** - Upgrade Supabase plan if needed
5. **Monetize** - Add premium features

---

## 📞 Support

If you need help:

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Create issues in your repository

Good luck with your deployment! 🚀
