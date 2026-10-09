# Social Red - Setup & Testing Guide

## Quick Start (5 minutes)

### 1. Clone & Install

```bash
git clone https://github.com/ceronbarbajoseluis43-svg/Social-red.git
cd Social-red
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and create
4. Wait for project initialization (2-3 minutes)
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `NEXT_SUPABASE_SERVICE_ROLE_KEY`

### 3. Setup Database

1. In Supabase, go to **SQL Editor**
2. Create new query
3. Copy entire content from `schema.sql` (in repo root)
4. Paste and run
5. Check for success message

### 4. Configure Environment

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Fill in values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_API_KEY=dev_social_red_2024_test_key
NODE_ENV=development
```

### 5. Enable Auth Methods

In Supabase Console:

1. Go to **Authentication → Providers**
2. Enable **Email**
3. Set **Confirm email**: Toggle OFF (for testing)
4. Save

### 6. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## Testing the Application

### Test Account 1: Manual Setup

1. Click **Sign Up**
2. Enter:
   - Email: `test1@example.com`
   - Password: `Test123!`
3. Click **Sign Up**
4. You're logged in! ✅

### Test Account 2: For Chat Testing

1. Open new incognito window
2. Go to `http://localhost:3000`
3. Sign up with:
   - Email: `test2@example.com`
   - Password: `Test123!`
4. Create a post
5. Return to original window
6. Find their post and comment/react

---

## API Testing

### Test API Key

```bash
# Health check
curl -X GET http://localhost:3000/api/health \
  -H "X-API-Key: dev_social_red_2024_test_key"

# Response:
# {"status":"ok","timestamp":"2024-10-09T...","version":"1.0.0"}
```

### Get Posts (No Auth Required)

```bash
curl -X GET http://localhost:3000/api/posts \
  -H "X-API-Key: dev_social_red_2024_test_key"
```

### Create Post (Requires User Auth + API Key)

```bash
# First, get auth token from browser session
curl -X POST http://localhost:3000/api/posts \
  -H "X-API-Key: dev_social_red_2024_test_key" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello from API!"}'
```

---

## Features to Test

### ✅ Authentication
- [ ] Sign up with email
- [ ] Login
- [ ] Logout
- [ ] Profile creation
- [ ] Profile update

### ✅ Posts
- [ ] Create post (text only)
- [ ] Create post (with image)
- [ ] View all posts
- [ ] Delete own post

### ✅ Reactions
- [ ] React to post (like, love, etc)
- [ ] Toggle reaction
- [ ] View reaction counts

### ✅ Comments
- [ ] Add comment to post
- [ ] View comments
- [ ] Delete own comment

### ✅ Real-time
- [ ] New posts appear without refresh
- [ ] Reactions update in real-time
- [ ] Comments appear instantly

### ✅ API Security
- [ ] Request without API key returns 401
- [ ] Invalid API key returns 401
- [ ] Rate limiting works (30 req/min)
- [ ] Rate limit headers present

---

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is required"

```bash
# Check .env.local exists and has values
cat .env.local

# Restart dev server
Ctrl+C
npm run dev
```

### "Auth session is invalid"

1. Clear browser cookies: Cmd+Shift+Del → All time → Cookies
2. Refresh page
3. Sign up again

### "Posts not loading"

1. Check database setup:
   ```bash
   # In Supabase Console:
   # Go to Table Editor → posts (should be empty or with data)
   ```
2. Check RLS policies:
   ```bash
   # In Supabase Console:
   # Go to Authentication → Policies
   # Verify "Los posts son visibles para todos" exists
   ```

### "Realtime not working"

1. In Supabase Console:
   - Go to **Database → Replication**
   - Check `posts`, `comments`, `reactions` are enabled
   - Click them if they're off

### API Key validation failed

1. Check header format:
   ```bash
   # Correct:
   -H "X-API-Key: dev_social_red_2024_test_key"
   
   # Incorrect:
   -H "API-Key: ..."
   -H "api-key: ..." (case-sensitive)
   ```

---

## Production Deployment

### 1. Update Environment Variables

```env
NODE_ENV=production
NEXT_PUBLIC_API_KEY=your-secure-api-key-prod
# Generate strong API key: openssl rand -hex 32
```

### 2. Build

```bash
npm run build
npm run start
```

### 3. Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel

# Add env vars in Vercel dashboard
# Redeploy
vercel --prod
```

---

## Security Checklist

- [ ] API keys are environment variables (never hardcoded)
- [ ] Rate limiting is enabled
- [ ] RLS policies are active in Supabase
- [ ] CORS is configured properly
- [ ] JWT tokens expire after 1 hour
- [ ] Sensitive data is not logged
- [ ] HTTPS only in production

---

## Performance Tips

1. **Enable Caching**:
   ```typescript
   revalidatePath("/feed"); // After mutations
   revalidateTag("posts"); // For tag-based revalidation
   ```

2. **Optimize Images**:
   - Use Next.js Image component
   - Set `width` and `height`
   - Use `placeholder="blur"`

3. **Reduce Database Queries**:
   - Select only needed columns
   - Use `.limit()` for pagination
   - Cache with Supabase client options

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: https://github.com/ceronbarbajoseluis43-svg/Social-red/issues
- **API Key Format**: Alphanumeric, min 32 characters recommended

---

**✨ Your Social Red app is ready to test!**
