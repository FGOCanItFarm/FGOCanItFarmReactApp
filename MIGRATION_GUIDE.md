# FGO Can It Farm - Domain Migration & Framework Transition Guide

## Domain Migration to fgocif.jjbly.uk

This guide covers migrating the FGO Can It Farm React application from GitHub Pages to Cloudflare Pages with a custom subdomain.

### Prerequisites

1. Cloudflare account with access to the `jjbly.uk` domain
2. GitHub repository with appropriate secrets configured
3. Custom domain DNS configuration

### Step 1: Cloudflare Pages Setup

1. **Create a Cloudflare Pages Project:**
   - Log into Cloudflare Dashboard
   - Go to "Pages" section
   - Click "Create a project"
   - Connect your GitHub repository: `FGOCanItFarm/FGOCanItFarmReactApp`
   - Set project name: `fgo-can-it-farm`

2. **Build Configuration:**
   ```
   Build command: npm run build
   Build output directory: build
   Root directory: /
   Environment variables: (none required for basic setup)
   ```

3. **Custom Domain Setup:**
   - In your Cloudflare Pages project, go to "Custom domains"
   - Add custom domain: `fgocif.jjbly.uk`
   - Cloudflare will automatically create the necessary DNS records

### Step 2: GitHub Secrets Configuration

Add the following secrets to your GitHub repository settings:

1. **CLOUDFLARE_API_TOKEN:**
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create token with "Cloudflare Pages:Edit" permissions
   - Add this token to GitHub secrets

2. **CLOUDFLARE_ACCOUNT_ID:**
   - Found in Cloudflare Dashboard → Right sidebar → Account ID
   - Add this to GitHub secrets

### Step 3: DNS Configuration

In your Cloudflare DNS settings for `jjbly.uk`:

```
Type: CNAME
Name: fgocif
Target: fgo-can-it-farm.pages.dev
Proxy: Enabled (orange cloud)
```

### Step 4: Repository Updates

1. **Package.json homepage update:** ✅ Done
   ```json
   "homepage": "https://fgocif.jjbly.uk/"
   ```

2. **GitHub Actions workflow:** ✅ Created
   - `.github/workflows/cloudflare-pages.yml`

3. **Remove GitHub Pages deployment:**
   - Remove or comment out `gh-pages` related scripts in package.json
   - Remove `deploy.ps1` (PowerShell deployment script)

### Step 5: Testing

1. Push changes to the repository
2. GitHub Actions will automatically build and deploy to Cloudflare Pages
3. Verify the site is accessible at `https://fgocif.jjbly.uk`

### Rollback Plan

If issues occur, you can quickly revert:
1. Change package.json homepage back to GitHub Pages URL
2. Disable Cloudflare Pages deployment
3. Use the existing `npm run deploy` command to deploy to GitHub Pages

---

## Framework Migration Options

### Option 1: Vue.js Migration

Vue.js is a progressive framework that's easier to migrate to from React.

#### Migration Strategy:
1. **Component Mapping:**
   - React functional components → Vue 3 Composition API
   - React hooks → Vue composables
   - Props remain largely the same concept

2. **Key Changes:**
   - JSX → Vue templates or JSX (Vue supports both)
   - useState → ref/reactive
   - useEffect → watchEffect/watch
   - Material-UI → Vuetify or PrimeVue

3. **Migration Steps:**
   - Create new Vue project with Vite
   - Migrate components one by one
   - Replace React Router with Vue Router
   - Replace Material-UI with Vue component library

#### Example Component Migration:

**React (before):**
```jsx
import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';

const ServantComponent = ({ servant }) => {
  const [isSelected, setIsSelected] = useState(false);
  
  useEffect(() => {
    console.log('Servant changed', servant);
  }, [servant]);
  
  return (
    <div>
      <Typography variant="h6">{servant.name}</Typography>
      <Button onClick={() => setIsSelected(!isSelected)}>
        {isSelected ? 'Selected' : 'Select'}
      </Button>
    </div>
  );
};
```

**Vue (after):**
```vue
<template>
  <div>
    <v-typography variant="h6">{{ servant.name }}</v-typography>
    <v-btn @click="toggleSelection">
      {{ isSelected ? 'Selected' : 'Select' }}
    </v-btn>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['servant']);
const isSelected = ref(false);

const toggleSelection = () => {
  isSelected.value = !isSelected.value;
};

watch(() => props.servant, (newServant) => {
  console.log('Servant changed', newServant);
});
</script>
```

### Option 2: Astro Migration

Astro is excellent for content-heavy sites with server-side rendering and minimal JavaScript.

#### Migration Strategy:
1. **Static First Approach:**
   - Use Astro for static pages
   - Add React/Vue islands for interactive components
   - Server-side rendering for better performance

2. **Key Benefits:**
   - Zero JavaScript by default
   - Component islands for interactivity
   - Better SEO and performance
   - Can use React components within Astro

3. **Migration Steps:**
   - Create new Astro project
   - Convert React components to Astro components
   - Use React islands for complex interactive features
   - Implement file-based routing

#### Example Component Migration:

**React (before):**
```jsx
import React from 'react';
import { Typography } from '@mui/material';

const QuestCard = ({ quest }) => {
  return (
    <div className="quest-card">
      <Typography variant="h5">{quest.name}</Typography>
      <Typography variant="body1">{quest.description}</Typography>
    </div>
  );
};
```

**Astro (after):**
```astro
---
// QuestCard.astro
export interface Props {
  quest: {
    name: string;
    description: string;
  };
}

const { quest } = Astro.props;
---

<div class="quest-card">
  <h5>{quest.name}</h5>
  <p>{quest.description}</p>
</div>

<style>
  .quest-card {
    /* Your styles here */
  }
</style>
```

### Recommendation

For the FGO Can It Farm application:

1. **Vue.js** is recommended if you want to keep a similar development experience to React
2. **Astro** is recommended if you want maximum performance and have mostly static content with some interactive components

Both options will provide:
- Better performance than the current React setup
- Modern development experience
- Better SEO
- Smaller bundle sizes

### Next Steps

1. Complete the Cloudflare Pages migration first
2. Choose your preferred framework (Vue or Astro)
3. Create a new branch for framework migration
4. Gradually migrate components while keeping the React version as fallback
5. Test thoroughly before switching domains to the new framework
