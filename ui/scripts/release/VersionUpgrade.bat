@echo off
title VersionUpgrade

rem Shortcut only -- the banner and every feature live in VersionUpgrade.ps1.

rem Keep this file ASCII-only: cmd reads .bat with the console code page (GBK on
rem zh-CN), so UTF-8 text here comes out mangled and can be parsed as a command.

set "SCRIPT_DIR=%~dp0"

cd /d "%SCRIPT_DIR%"

if not exist "VersionUpgrade.ps1" (
    echo [ERROR] VersionUpgrade.ps1 not found: %SCRIPT_DIR%
    goto :END
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Set-Location '%CD%'; & '%SCRIPT_DIR%VersionUpgrade.ps1'"

:END
echo.
pause
