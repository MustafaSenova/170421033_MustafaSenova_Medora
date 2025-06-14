# Samsung Health SDK Installation Script
# This script helps install the Samsung Health SDK AAR file

Write-Host "Samsung Health SDK Installation Script" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Check if the AAR file exists in the current directory
$aarFile = "samsung-health-sensor-api-v1.3.0.aar"
$libsDir = "modules\react-native-samsung-health\android\libs"

if (Test-Path $aarFile) {
    Write-Host "Found Samsung Health SDK AAR file: $aarFile" -ForegroundColor Yellow
    
    # Create libs directory if it doesn't exist
    if (!(Test-Path $libsDir)) {
        New-Item -ItemType Directory -Path $libsDir -Force
        Write-Host "Created libs directory: $libsDir" -ForegroundColor Green
    }
    
    # Copy the AAR file
    Copy-Item $aarFile $libsDir -Force
    Write-Host "Copied $aarFile to $libsDir" -ForegroundColor Green
    
    # Verify the copy
    if (Test-Path "$libsDir\$aarFile") {
        Write-Host "✅ Samsung Health SDK AAR file successfully installed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to copy the AAR file" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Samsung Health SDK AAR file not found in current directory" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download the Samsung Health Sensor SDK v1.3.0 from:" -ForegroundColor Yellow
    Write-Host "https://developer.samsung.com/health/sensor-sdk/download" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then place the 'samsung-health-sensor-api-v1.3.0.aar' file in this directory and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Clean and rebuild the project: npx expo run:android --clear" -ForegroundColor White
Write-Host "2. Make sure Samsung Health app is installed on your device" -ForegroundColor White
Write-Host "3. Enable Developer mode on your Samsung Galaxy Watch" -ForegroundColor White
Write-Host "4. Pair your watch with the Samsung Health app" -ForegroundColor White
Write-Host ""
Write-Host "Installation completed successfully! 🎉" -ForegroundColor Green 