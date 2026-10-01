@REM Maven Wrapper for Windows - auto-downloads Maven 3.9.6
@echo off
setlocal

set BASE_DIR=%~dp0
set MAVEN_VERSION=3.9.6
set MAVEN_DIST_DIR=%BASE_DIR%.mvn\wrapper\dists\apache-maven-%MAVEN_VERSION%
set MVN_CMD=%MAVEN_DIST_DIR%\bin\mvn.cmd
set DOWNLOAD_ZIP=%TEMP%\apache-maven-%MAVEN_VERSION%-bin.zip
set PS_SCRIPT=%TEMP%\mvnw-download.ps1

if exist "%MVN_CMD%" goto :run_maven

echo [mvnw] Maven %MAVEN_VERSION% not cached. Downloading (1-2 min)...

if not exist "%BASE_DIR%.mvn\wrapper\dists" mkdir "%BASE_DIR%.mvn\wrapper\dists"

echo [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 > "%PS_SCRIPT%"
echo $url = 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip' >> "%PS_SCRIPT%"
echo $dest = '%DOWNLOAD_ZIP:\=\\%' >> "%PS_SCRIPT%"
echo $extract = '%BASE_DIR:.mvn\wrapper\dists=.mvn\wrapper\dists%' >> "%PS_SCRIPT%"
echo Write-Host '[mvnw] Fetching' $url >> "%PS_SCRIPT%"
echo (New-Object System.Net.WebClient).DownloadFile($url, $dest) >> "%PS_SCRIPT%"
echo Write-Host '[mvnw] Extracting...' >> "%PS_SCRIPT%"
echo Expand-Archive -Path $dest -DestinationPath '%BASE_DIR:\=\\%.mvn\wrapper\dists' -Force >> "%PS_SCRIPT%"
echo Write-Host '[mvnw] Maven ready.' >> "%PS_SCRIPT%"

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"

if errorlevel 1 (
    echo [mvnw] ERROR: Download failed. Check internet connection.
    del "%PS_SCRIPT%" 2>nul
    exit /b 1
)

del "%PS_SCRIPT%" 2>nul

if not exist "%MVN_CMD%" (
    echo [mvnw] ERROR: Maven binary not found after extraction.
    echo [mvnw] Expected: %MVN_CMD%
    exit /b 1
)

:run_maven
"%MVN_CMD%" %*
