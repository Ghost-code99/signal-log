# 🚀 Deployment Guide for Signal Log

## Pre-Deployment Checklist

### ✅ **Environment Setup**
- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Authentication settings configured
- [ ] All tests passing

### ✅ **Code Quality**
- [ ] TypeScript compilation successful
- [ ] ESLint checks passing
- [ ] All tests passing
- [ ] Code formatted with Prettier

## 🧪 Testing Before Deployment

### Run All Tests
```bash
# Run all test suites
npm run test:all

# Run specific test categories
npm run test:unit        # Unit tests
npm run test:integration # Integration tests  
npm run test:components  # Component tests
npm run test:api        # API route tests
npm run test:auth       # Authentication tests
npm run test:ai         # AI feature tests

# Run with coverage
npm run test:coverage
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Project CRUD operations
- [ ] AI health scanner functionality
- [ ] Assumption challenger
- [ ] Idea capture system
- [ ] Experiment canvas generator
- [ ] Portfolio analysis features

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### 1. **Prepare Environment Variables**
Create a `.env.production` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

#### 2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Or use CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

#### 3. **Configure Vercel Settings**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Option 2: Docker Deployment

#### 1. **Build Docker Image**
```bash
# Build the image
docker build -t signal-log .

# Run locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-key \
  signal-log
```

#### 2. **Deploy to Cloud Provider**
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**

### Option 3: Traditional VPS

#### 1. **Server Setup**
```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx
```

#### 2. **Deploy Application**
```bash
# Clone repository
git clone <your-repo-url>
cd signal-log

# Install dependencies
npm ci --production

# Build application
npm run build

# Start with PM2
pm2 start npm --name "signal-log" -- start
pm2 save
pm2 startup
```

#### 3. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Production Configuration

### Supabase Production Setup

#### 1. **Database Migration**
```sql
-- Run in Supabase SQL Editor
-- Execute database-schema.sql
-- Execute rls-policies.sql
```

#### 2. **Authentication Configuration**
- Go to Authentication > Settings
- Set Site URL to your production domain
- Configure email templates
- Set up OAuth providers if needed

#### 3. **Security Settings**
- Enable Row Level Security (RLS)
- Configure CORS settings
- Set up API rate limiting

### Environment Variables

#### Required Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
```

#### Optional Variables
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 📊 Monitoring & Analytics

### Application Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error tracking

### Database Monitoring
- **Supabase Dashboard**: Built-in monitoring
- **Database logs**: Check for errors and performance
- **API usage**: Monitor rate limits and usage

### Health Checks
```bash
# Check application health
curl https://your-domain.com/api/health

# Check database connection
curl https://your-domain.com/api/projects
```

## 🔒 Security Checklist

### Authentication Security
- [ ] Strong password requirements
- [ ] Email verification enabled
- [ ] Rate limiting configured
- [ ] Session management secure

### Database Security
- [ ] RLS policies enabled
- [ ] API keys secured
- [ ] Database backups configured
- [ ] Access logs monitored

### Application Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Input validation implemented
- [ ] Error handling secure

## 🚨 Troubleshooting

### Common Issues

#### 1. **Build Failures**
```bash
# Check TypeScript errors
npm run type-check

# Check for missing dependencies
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

#### 2. **Database Connection Issues**
- Verify environment variables
- Check Supabase project status
- Verify RLS policies
- Check API key permissions

#### 3. **Authentication Issues**
- Verify Supabase auth settings
- Check site URL configuration
- Verify email templates
- Check CORS settings

### Debug Commands
```bash
# Check application logs
pm2 logs signal-log

# Check database connection
npm run test:api

# Verify environment variables
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

## 📈 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Optimize images
# Use Next.js Image component
# Implement lazy loading
```

### Runtime Optimization
- Enable Next.js caching
- Implement database query optimization
- Use Supabase connection pooling
- Monitor performance metrics

## 🎉 Post-Deployment

### Verification Checklist
- [ ] Application loads correctly
- [ ] User registration works
- [ ] Project creation works
- [ ] AI features function
- [ ] Database operations work
- [ ] Authentication flows work

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Database monitoring enabled
- [ ] User analytics tracking

### Documentation
- [ ] Update README with production URL
- [ ] Document environment variables
- [ ] Create user guide
- [ ] Set up support channels

Your Signal Log application is now ready for production! 🚀
