@echo off
title VersionUpgrade

rem 改的是工作区里的 package.json 与 CHANGELOG，不需要管理员权限，因此不提权。

set "SCRIPT_DIR=%~dp0"

cd /d "%SCRIPT_DIR%"

if not exist "VersionUpgrade.ps1" (
    echo [ERROR] VersionUpgrade.ps1 not found: %SCRIPT_DIR%
    goto :END
)

echo ========================================
echo  VersionUpgrade - XiHan.UI
echo ========================================

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Set-Location '%CD%'; & '%SCRIPT_DIR%VersionUpgrade.ps1'"

:END
echo.
pause
