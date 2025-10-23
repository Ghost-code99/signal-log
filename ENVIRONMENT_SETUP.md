# Environment Variables Setup Guide

## 🔐 **Environment Variables Configuration**

### **Required Environment Variables**

Create a `.env.local` file in your project root with these variables:

```bash
# Supabase Configuration (Client-Side - Safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://sbvxiljjfolgmpycabep.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNidnhpbGpqZm9sZ21weWNhYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDUzMTIsImV4cCI6MjA3Njc4MTMxMn0.6xt-RAwi8btnjvC6CY4w6uPUxus0PJr90xamcha88sY

# Supabase Service Role Key (Server-Side Only - NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNidnhpbGpqZm9sZ21weWNhYmVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIwNTMxMiwiZXhwIjoyMDc2NzgxMzEyfQ.PmO1gjKC6tY68MoJ1ohYU5EM6H6-aZ5O5qxoKj8YTTw

# Supabase CLI (for schema management)
SUPABASE_ACCESS_TOKEN=sbp_b494941af01571ccdf6c7d079d381f849c169ea4

# Vercel Deployment (for GitHub Actions)
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here
VERCEL_PROJECT_ID=your_vercel_project_id_here
```

## 🔒 **Security Implications**

### **Client-Side Variables (NEXT_PUBLIC_ prefix)**
- ✅ **Safe to expose** to the browser
- ✅ **Anon key** has limited permissions (respects RLS)
- ✅ **URL** is public information
- ⚠️ **Still validate** user permissions on server-side

### **Server-Side Variables (no NEXT_PUBLIC_ prefix)**
- 🚨 **NEVER expose** to the client
- 🚨 **Service role key** bypasses RLS
- 🚨 **Full database access** - use with extreme caution
- ✅ **Only use** in API routes and server actions

## 📚 **Documentation References**

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Environment Variables](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs#environment-variables)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Server-Side Rendering](https://supabase.com/docs/guides/auth/server-side/nextjs)
