$ErrorActionPreference = "Stop"

Write-Host "=== Building for PRODUCTION ===" -ForegroundColor Cyan
Write-Host "API URL will point to: https://api-mq.zamzami.or.id" -ForegroundColor Green

# ---- FRONTEND ----
Write-Host "`n[1/4] Building Next.js frontend with production env..."
Set-Location web
npm run build
Set-Location ..

# ---- BACKEND ----
Write-Host "`n[2/4] Packaging backend..."
if (Test-Path "backend_temp") { Remove-Item -Recurse -Force "backend_temp" }
New-Item -ItemType Directory -Force "backend_temp" | Out-Null
Get-ChildItem -Path "backend" -Exclude "node_modules" | Copy-Item -Destination "backend_temp" -Recurse -Force
if (Test-Path "backend\backend.zip") { Remove-Item -Force "backend\backend.zip" }
Compress-Archive -Path "backend_temp\*" -DestinationPath "backend\backend.zip" -Force
Remove-Item -Recurse -Force "backend_temp"

# ---- DEPLOY ----
Write-Host "`n[3/4] Deploying backend to VPS..."
node deploy_ssh.js

Write-Host "`n[4/4] Deploying frontend to VPS (direct SFTP)..."
node deploy_web_ssh.js

Write-Host "`n=== Deployment Successful! ===" -ForegroundColor Green
Write-Host "Frontend: https://mq.zamzami.or.id" -ForegroundColor Cyan
Write-Host "Backend:  https://api-mq.zamzami.or.id" -ForegroundColor Cyan

