$ErrorActionPreference = "Stop"

Write-Host "=== My MQ Deploy ===" -ForegroundColor Cyan

# Cek ada perubahan yang belum di-commit
$status = git status --porcelain
if ($status) {
    Write-Host "`nAda perubahan yang belum di-commit:" -ForegroundColor Yellow
    git status --short
    $confirm = Read-Host "`nOtomatis commit semua? (y/n)"
    if ($confirm -eq 'y') {
        $msg = Read-Host "Pesan commit"
        git add .
        git commit -m $msg
    } else {
        Write-Host "Deploy dibatalkan. Silakan commit manual dulu." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n[1/2] Pushing ke GitHub..." -ForegroundColor Green
git push origin main

Write-Host "`n[2/2] Menjalankan deploy di VPS..." -ForegroundColor Green
node deploy_vps.js

Write-Host "`n=== Deploy Selesai! ===" -ForegroundColor Green
Write-Host "Frontend: https://mq.zamzami.or.id" -ForegroundColor Cyan
Write-Host "Backend:  https://api-mq.zamzami.or.id" -ForegroundColor Cyan
