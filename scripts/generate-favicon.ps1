param(
  [string]$SourcePath = (Join-Path $PSScriptRoot '..\public\source-icon.png'),
  [string]$OutputDir = (Join-Path $PSScriptRoot '..\public')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class NativeMethods {
  [DllImport("user32.dll", SetLastError = true)]
  public static extern bool DestroyIcon(IntPtr hIcon);
}
"@

if (-not (Test-Path $SourcePath)) {
  throw "Source image not found: $SourcePath"
}

$image = [System.Drawing.Image]::FromFile($SourcePath)
try {
  foreach ($size in 16, 32, 180, 192) {
    $bitmap = New-Object System.Drawing.Bitmap $size, $size
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.DrawImage($image, 0, 0, $size, $size)
      }
      finally {
        $graphics.Dispose()
      }

      $pngPath = Join-Path $OutputDir ("favicon-$size.png")
      $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

      if ($size -eq 180) {
        $touchIconPath = Join-Path $OutputDir 'apple-touch-icon.png'
        $bitmap.Save($touchIconPath, [System.Drawing.Imaging.ImageFormat]::Png)
      }
    }
    finally {
      $bitmap.Dispose()
    }
  }

  $faviconBitmap = New-Object System.Drawing.Bitmap 32, 32
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($faviconBitmap)
    try {
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.DrawImage($image, 0, 0, 32, 32)
    }
    finally {
      $graphics.Dispose()
    }

    $iconHandle = $faviconBitmap.GetHicon()
    try {
      $icon = [System.Drawing.Icon]::FromHandle($iconHandle)
      try {
        $iconPath = Join-Path $OutputDir 'favicon.ico'
        $stream = [System.IO.File]::Open($iconPath, [System.IO.FileMode]::Create)
        try {
          $icon.Save($stream)
        }
        finally {
          $stream.Dispose()
        }
      }
      finally {
        $icon.Dispose()
      }
    }
    finally {
      if ($iconHandle -ne [System.IntPtr]::Zero) {
        [NativeMethods]::DestroyIcon($iconHandle) | Out-Null
      }
    }
  }
  finally {
    $faviconBitmap.Dispose()
  }
}
finally {
  $image.Dispose()
}

Write-Host "Generated favicon assets in $OutputDir"