# Deployment Guide - FPGA Web Tool

## Production Build

### Build for Production

```bash
cd frontend
npm run build
```

Output directory: `frontend/dist/`

### Build Output

The production build creates:
- `dist/index.html` - Entry point
- `dist/assets/*.css` - Compiled Tailwind CSS (~10KB)
- `dist/assets/*.js` - Bundled JavaScript (~17KB)

### Production Configuration

The build is optimized with:
- ✅ Minified JavaScript and CSS
- ✅ Tree-shaking for unused code
- ✅ Asset hashing for cache busting
- ✅ CDN dependencies (JSZip, sql.js) loaded at runtime

## Deployment Options

### Option 1: Static Hosting (Recommended)

Deploy the `dist/` folder to any static hosting service:

**Netlify**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod --dir=dist
```

**Vercel**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**GitHub Pages**:
```bash
# Build first
npm run build

# Deploy to gh-pages branch
npx gh-pages -d dist
```

**AWS S3 + CloudFront**:
```bash
# Sync to S3
aws s3 sync dist/ s3://your-bucket-name/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Option 2: Docker Container

Create `Dockerfile` in project root:

```dockerfile
FROM nginx:alpine

# Copy built files
COPY frontend/dist /usr/share/nginx/html

# Copy nginx config (optional)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t fpga-web-tool .
docker run -p 8080:80 fpga-web-tool
```

### Option 3: Node.js Server (Simple)

Create `server.js`:

```javascript
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(express.static(join(__dirname, 'frontend/dist')))

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'frontend/dist/index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

Run:
```bash
node server.js
```

## Environment Configuration

### Required CDN Dependencies

The app loads these from CDN:
- `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`
- `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js`
- `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`

**Important**: Ensure your hosting allows loading external scripts (CSP headers).

### Content Security Policy (CSP)

Recommended CSP headers for production:

```nginx
add_header Content-Security-Policy "
  default-src 'self'; 
  script-src 'self' https://cdnjs.cloudflare.com https://jspm.dev 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data:; 
  connect-src 'self' https://api.openai.com;
" always;
```

### Nginx Configuration

Example `nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Enable gzip
    gzip on;
    gzip_types text/css application/javascript application/json;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

## Post-Deployment Checklist

### Functionality Tests
- [ ] Create a new project
- [ ] Generate RTL from natural language
- [ ] Generate testbench
- [ ] Run simulation
- [ ] Receive browser notification
- [ ] View run history
- [ ] Export project as ZIP
- [ ] Test AI Explain feature
- [ ] Test Debug Suggestions (on failed sim)
- [ ] Test Generate Docs

### Browser Compatibility Tests
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### Storage Tests
- [ ] sql.js loads successfully
- [ ] localStorage fallback works if sql.js fails
- [ ] Projects persist after page reload
- [ ] Export/import works correctly

### Performance Checks
- [ ] Initial load < 3 seconds
- [ ] RTL generation < 5 seconds (mock mode)
- [ ] Simulation completes < 30 seconds
- [ ] No console errors

## Monitoring & Analytics (Optional)

### Add Google Analytics

In `frontend/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Add Error Tracking (Sentry)

```bash
npm install @sentry/browser
```

In `frontend/src/main.js`:

```javascript
import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production'
})
```

## Scaling Considerations

### Current Limitations
- Client-side only (no backend)
- Data stored per-browser (not synced)
- API key stored in localStorage (security risk)

### Future Enhancements
1. **Add Backend API**: Node.js/Python server for persistent storage
2. **User Authentication**: OAuth/JWT for multi-device sync
3. **Database**: PostgreSQL/MongoDB for projects and artifacts
4. **API Key Management**: Server-side encryption/vaulting
5. **Real WASM Simulator**: Replace mock with actual Verilog simulator
6. **CDN Assets**: Self-host JSZip and sql.js for reliability

## Security Hardening

### Production Security Checklist
- [ ] Enable HTTPS (required for Notification API)
- [ ] Set appropriate CSP headers
- [ ] Add rate limiting (if backend added)
- [ ] Sanitize all user inputs
- [ ] Add CORS policy (if API added)
- [ ] Regular dependency updates
- [ ] Remove console.log in production

### API Key Security (Critical)

⚠️ **WARNING**: Current implementation stores API keys in localStorage.

**For Production**:
1. Implement server-side key storage with encryption
2. Use environment variables on server
3. Implement key rotation
4. Add usage monitoring
5. Never expose keys in client code

## Support & Maintenance

### Update Dependencies

```bash
cd frontend
npm update
npm audit fix
```

### Check for Vulnerabilities

```bash
npm audit
```

### Performance Monitoring

Monitor via browser DevTools:
- Network tab: Check load times
- Performance tab: Check rendering
- Application tab: Check storage usage

---

**Deployment Support**: See [README.md](../README.md) for additional information.

**Version**: MVP 1.0  
**Last Updated**: 2026-06-12
