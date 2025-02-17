# filepath: /f:/FGO-opensource/FGOCanItFarmReactApp/deploy.ps1
# deploy.ps1

# Ensure you are on the development branch
Write-Output "Checking out the development branch..."
git checkout development

# Pull the latest changes
git pull org-origin development

# Build the React app
Write-Output "Building the React app..."
npm run build

# Deploy to GitHub Pages
Write-Output "Deploying to GitHub Pages..."
npm run deploy

# Push the changes to the gh-pages branch
git push org-origin gh-pages

Write-Output "Deployment complete."