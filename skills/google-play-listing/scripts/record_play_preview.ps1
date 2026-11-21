#Requires -Version 5.1
<#
.SYNOPSIS
  Record an MP4 screen preview from a connected Android device via adb.

.DESCRIPTION
  Starts adb shell screenrecord, then pulls the file locally.
  Requires adb on PATH and a device in "device" state.
  Agent should switch the app UI to English and demo as many features as practical.

.PARAMETER OutFile
  Full path of the MP4 to write (directories are created if missing).

.PARAMETER Seconds
  Clip length, 1–180 (adb screenrecord max 180). Default 180. Run again for more clips.

.PARAMETER Serial
  Optional adb device serial (-s).

.EXAMPLE
  .\record_play_preview.ps1 -OutFile D:\materials\play_preview\main_flow.mp4 -Seconds 180
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$OutFile,

    [int]$Seconds = 180,

    [string]$Serial
)

$ErrorActionPreference = "Stop"

if ($Seconds -lt 1 -or $Seconds -gt 180) {
    Write-Error "Seconds must be between 1 and 180 (adb screenrecord max is 180)."
    exit 1
}

function Invoke-Adb {
    param([string[]]$AdbArgs)
    if ($Serial) {
        & adb -s $Serial @AdbArgs
    } else {
        & adb @AdbArgs
    }
    if ($LASTEXITCODE -ne 0) {
        throw "adb failed: adb $($AdbArgs -join ' ') (exit $LASTEXITCODE)"
    }
}

$adbCmd = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbCmd) {
    Write-Error "adb not found on PATH. Install platform-tools or ask the user."
    exit 2
}

$devicesOutput = & adb devices
$ready = @()
foreach ($line in $devicesOutput) {
    if ($line -match "^\s*$" -or $line -match "List of devices") { continue }
    if ($line -match "^(\S+)\s+device\s*$") { $ready += $Matches[1] }
    if ($line -match "^(\S+)\s+unauthorized") {
        Write-Error "Device $($Matches[1]) is unauthorized. Ask the user to accept the RSA prompt."
        exit 3
    }
}

if ($ready.Count -eq 0) {
    Write-Error "No adb device in 'device' state. Connect a phone and ask the user if needed."
    exit 4
}

if (-not $Serial -and $ready.Count -gt 1) {
    Write-Host "Multiple devices: $($ready -join ', '). Pass -Serial explicitly."
    exit 5
}

$dir = Split-Path -Parent $OutFile
if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

$remote = "/sdcard/Download/play_preview_{0}.mp4" -f ([guid]::NewGuid().ToString("N").Substring(0, 8))
Write-Host "Recording ${Seconds}s to $remote — drive the English main flow on device now."
try {
    Invoke-Adb -AdbArgs @("shell", "screenrecord", "--time-limit", "$Seconds", $remote)
    Invoke-Adb -AdbArgs @("pull", $remote, $OutFile)
} finally {
    try { Invoke-Adb -AdbArgs @("shell", "rm", "-f", $remote) } catch { }
}

if (-not (Test-Path $OutFile)) {
    Write-Error "Video was not written to $OutFile"
    exit 6
}

Write-Host "Saved $OutFile"
exit 0
