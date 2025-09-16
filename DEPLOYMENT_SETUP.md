# Deployment Configuration

## Cloudflare Pages Setup Instructions

### 1. Create Cloudflare Pages Project

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to "Pages" in the left sidebar

2. **Create New Project**
   - Click "Create a project"
   - Choose "Connect to Git"
   - Select GitHub and authorize if needed
   - Choose repository: `FGOCanItFarm/FGOCanItFarmReactApp`

3. **Configure Build Settings**
   ```
   Project name: fgo-can-it-farm
   Production branch: main
   Build command: npm run build
   Build output directory: build
   Root directory: / (leave empty)
   ```

### 2. Custom Domain Configuration

1. **Add Custom Domain**
   - In your Cloudflare Pages project dashboard
   - Go to "Custom domains" tab
   - Click "Set up a custom domain"
   - Enter: `fgocif.jjbly.uk`
   - Cloudflare will automatically configure DNS

2. **Verify Domain Setup**
   - DNS record should be created automatically:
   ```
   Type: CNAME
   Name: fgocif
   Target: fgo-can-it-farm.pages.dev
   ```

### 3. GitHub Secrets Configuration

Add these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

1. **CLOUDFLARE_API_TOKEN**
   - Create at: https://dash.cloudflare.com/profile/api-tokens
   - Template: "Cloudflare Pages"
   - Permissions: Zone:Zone:Read, Page:Page:Edit
   - Zone Resources: Include → Specific zone → jjbly.uk

2. **CLOUDFLARE_ACCOUNT_ID**
   - Found in Cloudflare Dashboard right sidebar
   - Copy the Account ID value

### 4. Environment Variables (Optional)

If needed for API endpoints or other configuration:

```bash
# In Cloudflare Pages → Settings → Environment variables
NODE_ENV=production
API_BASE_URL=https://your-api-endpoint.com
```

### 5. Deployment Process

Once configured, deployments happen automatically:
- Push to `main` or `development` branch
- GitHub Actions runs the workflow
- Build artifacts deployed to Cloudflare Pages
- Site available at https://fgocif.jjbly.uk

### 6. Monitoring & Logs

- **Cloudflare Pages logs**: Dashboard → Pages → fgo-can-it-farm → View details
- **GitHub Actions logs**: Repository → Actions tab
- **Build failures**: Check both locations for debugging

### 7. SSL/TLS Configuration

Cloudflare automatically provides SSL:
- Free SSL certificate
- Always Use HTTPS enabled by default
- HTTP redirects to HTTPS

### Rollback Procedure

If issues occur:
1. Revert package.json homepage to GitHub Pages URL
2. Push to trigger GitHub Pages deployment
3. Debug Cloudflare configuration separately

### Performance Benefits

Expected improvements with Cloudflare Pages:
- ⚡ Faster global CDN
- 🔒 Automatic SSL/TLS
- 📈 Better caching strategies
- 🌍 Global edge deployment
- 📊 Built-in analytics