@echo off
title Zameen Gem Auto-Deployer
cd "%~dp0.."
echo ==============================================
echo          ZAMEEN GEM AUTO-DEPLOYER
echo ==============================================
echo.
echo Staging all changes...
git add .
echo.
set /p commit_msg="Enter description of your changes (default: 'Auto Update'): "
if "%commit_msg%"=="" set commit_msg=Auto Update
echo.
echo Saving changes...
git commit -m "%commit_msg%"
echo.
echo Pushing code to GitHub (triggers live deploy)...
git push
echo.
echo ==============================================
echo  Success! Code pushed to GitHub.
echo  The bridge is now deploying it live to Hostinger.
echo ==============================================
echo.
pause
