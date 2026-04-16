# Supabase Setup Guide for WanderWise

This guide will help you set up real Google OAuth authentication and database storage for WanderWise using Supabase.

## Prerequisites

- A Supabase account (free tier works fine)
- A Google Cloud Console account for OAuth credentials

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: WanderWise (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Click "Create new project" and wait for it to initialize (takes ~2 minutes)

## Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

3. Create a `.env` file in the root of your project:
   ```bash
   # In wanderwise-ai-main folder
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 3: Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the SQL
6. You should see success messages for all tables created

This will create:

- `profiles` table (user profiles)
- `trips` table (saved trips)
- `chats` table (chat history)
- Row Level Security policies (users can only access their own data)
- Automatic triggers for profile creation and timestamp updates

## Step 4: Configure Google OAuth

### 4.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: WanderWise
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: WanderWise
   - Authorized JavaScript origins:
     - `http://localhost:8080` (for development)
     - Your production domain (when deployed)
   - Authorized redirect URIs:
     - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
     - Replace `YOUR_SUPABASE_PROJECT_REF` with your actual project reference
7. Click **Create** and copy:
   - **Client ID**
   - **Client Secret**

### 4.2 Configure Google OAuth in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list and click to expand
3. Enable Google provider
4. Paste your Google OAuth credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
5. Copy the **Callback URL** shown (you may need to add this to Google Console if not done already)
6. Click **Save**

### 4.3 Configure Redirect URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:8080` (development)
   - **Redirect URLs**: Add these:
     - `http://localhost:8080/dashboard`
     - `http://localhost:8080/`
     - Your production URLs when deployed
3. Click **Save**

## Step 5: Test the Integration

1. Make sure your `.env` file has the correct Supabase credentials
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:8080` in your browser
4. Try the following:
   - Click "Sign Up" or "Sign In"
   - Click "Continue with Google"
   - You should see the Google account picker with your actual Google accounts
   - Select an account and authorize the app
   - You should be redirected to the dashboard
   - Your profile should be automatically created in the database

## Step 6: Verify Database

1. In Supabase dashboard, go to **Table Editor**
2. Check the `profiles` table - you should see your user profile
3. The `trips` and `chats` tables will be empty initially

## Features Now Working

✅ **Real Google OAuth** - Users see their actual Google accounts
✅ **Protected Routes** - Dashboard, Chat, and Explore require login
✅ **Database Storage** - User data stored in Supabase
✅ **Row Level Security** - Users can only access their own data
✅ **Automatic Profile Creation** - Profile created on first login
✅ **Session Management** - Persistent login across page refreshes
✅ **Email/Password Auth** - Also works alongside Google OAuth

## Troubleshooting

### Google OAuth not working

- Check that redirect URIs match exactly in both Google Console and Supabase
- Make sure Google provider is enabled in Supabase
- Verify Client ID and Secret are correct
- Check browser console for errors

### Database errors

- Verify all SQL commands ran successfully
- Check that Row Level Security policies are enabled
- Make sure you're using the correct Supabase credentials

### Environment variables not loading

- Make sure `.env` file is in the root directory
- Restart the dev server after creating/modifying `.env`
- Variable names must start with `VITE_` for Vite to expose them

### "User already registered" error

- This means the email is already in the auth.users table
- You can either:
  - Use a different email
  - Delete the user from Supabase dashboard (Authentication → Users)
  - Use the login page instead of signup

## Next Steps

Once everything is working:

1. **Deploy to production**:
   - Update `.env` with production Supabase credentials
   - Add production URLs to Google OAuth and Supabase redirect URLs
   - Deploy your app

2. **Customize the database**:
   - Add more fields to profiles table
   - Create additional tables for features
   - Modify the schema as needed

3. **Add more features**:
   - Implement trip creation and management
   - Add chat message storage
   - Create user preferences
   - Add social features

## Security Notes

- Never commit your `.env` file to version control
- Keep your Supabase credentials secret
- Use Row Level Security policies for all tables
- Validate user input on both client and server
- Use the `anon` key for client-side, never the `service_role` key

## Support

- Supabase Docs: https://supabase.com/docs
- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2
- Supabase Discord: https://discord.supabase.com
