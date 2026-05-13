# start.ps1

Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --reload"

Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Both services are starting. Check the opened windows." -ForegroundColor Yellow
