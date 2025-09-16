# Migration Checklist

## Phase 1: Cloudflare Pages Migration ✅

### Prerequisites
- [ ] Cloudflare account with jjbly.uk domain access
- [ ] GitHub repository admin access
- [ ] DNS management access

### Cloudflare Setup
- [ ] Create Cloudflare Pages project: `fgo-can-it-farm`
- [ ] Configure build settings (npm run build, build output directory: build)
- [ ] Add custom domain: `fgocif.jjbly.uk`
- [ ] Verify DNS CNAME record creation

### GitHub Configuration
- [ ] Add CLOUDFLARE_API_TOKEN to GitHub secrets
- [ ] Add CLOUDFLARE_ACCOUNT_ID to GitHub secrets
- [ ] Test GitHub Actions workflow

### Code Changes ✅
- [x] Update package.json homepage URL to https://fgocif.jjbly.uk/
- [x] Create GitHub Actions workflow (.github/workflows/cloudflare-pages.yml)
- [x] Fix ESLint build errors
- [x] Remove gh-pages dependency and scripts
- [x] Add .gitignore file

### Documentation ✅
- [x] Create MIGRATION_GUIDE.md
- [x] Create DEPLOYMENT_SETUP.md
- [x] Update README.md with migration information
- [x] Create framework migration templates

### Testing
- [ ] Push changes and verify GitHub Actions runs
- [ ] Verify site builds and deploys to Cloudflare Pages
- [ ] Test site functionality at new domain
- [ ] Verify SSL certificate is active

## Phase 2: Framework Migration (Optional)

### Vue.js Migration
- [x] Create Vue.js project template
- [x] Create package.json with Vue dependencies
- [x] Create basic App.vue component
- [ ] Migrate individual React components to Vue
- [ ] Test Vue application
- [ ] Deploy Vue version to staging

### Astro Migration  
- [x] Create Astro project template
- [x] Create package.json with Astro dependencies
- [x] Create astro.config.mjs
- [ ] Migrate React components to Astro
- [ ] Create React islands for interactive components
- [ ] Test Astro application
- [ ] Deploy Astro version to staging

## Phase 3: Cleanup

### Remove Old Infrastructure
- [ ] Update all documentation to point to new domain
- [ ] Archive or remove deploy.ps1 PowerShell script
- [ ] Remove any GitHub Pages specific configuration
- [ ] Update any external links to the application

### Performance Verification
- [ ] Run Lighthouse audit on new domain
- [ ] Compare performance metrics with old setup
- [ ] Monitor Cloudflare analytics
- [ ] Verify global CDN performance

## Rollback Plan

If issues occur during migration:
1. Revert package.json homepage to GitHub Pages URL
2. Restore gh-pages dependency and scripts
3. Run `npm run deploy` to deploy to GitHub Pages
4. Debug Cloudflare configuration separately

## Success Criteria

✅ **Migration Complete When:**
- Site accessible at https://fgocif.jjbly.uk
- SSL certificate active and valid
- All functionality working correctly
- GitHub Actions deploying successfully
- Old domain redirecting or showing migration notice

## Notes

- Framework migration is optional and can be done later
- Cloudflare Pages provides better performance and global CDN
- Migration templates are ready for Vue.js and Astro when needed
- All changes are minimal and focused on the migration goal