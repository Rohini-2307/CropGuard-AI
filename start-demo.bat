@echo off
REM Start a simple static server and open the crop in the default browser
pushd "%~dp0\.."
start "" python -m http.server 8000
timeout /t 1 >nul
start "" "http://localhost:8000/crop/index.html"
popd
