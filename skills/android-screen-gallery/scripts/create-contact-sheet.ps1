param([Parameter(Mandatory = $true)][string]$GalleryDirectory)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = (Resolve-Path -LiteralPath $GalleryDirectory).Path
$records = @(Get-Content -LiteralPath (Join-Path $root 'screenshots\manifest.json') -Raw -Encoding utf8 | ConvertFrom-Json)
if ($records.Count -eq 0) { throw 'No screenshots in manifest' }
$cols = [Math]::Min(8, $records.Count); $cellWidth = 180; $cellHeight = 420
$bitmap = [Drawing.Bitmap]::new([int]($cols * $cellWidth), [int]([Math]::Ceiling($records.Count / $cols) * $cellHeight))
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$font = [Drawing.Font]::new('Segoe UI', 9)
try {
    $graphics.Clear([Drawing.Color]::White)
    $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    for ($i = 0; $i -lt $records.Count; $i++) {
        $name = [string]$records[$i].file
        if ($name -match '[/\\]' -or [IO.Path]::GetFileName($name) -ne $name) { throw "Invalid filename: $name" }
        $img = [Drawing.Image]::FromFile((Join-Path $root "screenshots\$name"))
        try {
            $x = ($i % $cols) * $cellWidth; $y = [int][Math]::Floor($i / $cols) * $cellHeight
            $scale = [Math]::Min(160.0 / $img.Width, 350.0 / $img.Height)
            $width = [int]($img.Width * $scale); $height = [int]($img.Height * $scale)
            $graphics.DrawImage($img, [int]($x + ($cellWidth - $width) / 2), $y + 5, $width, $height)
            $graphics.DrawString("$($i+1). $($records[$i].title)", $font, [Drawing.Brushes]::Black, [Drawing.RectangleF]::new($x+6, $y+362, 168, 52))
        } finally { $img.Dispose() }
    }
    $bitmap.Save((Join-Path $root 'contact-sheet.jpg'), [Drawing.Imaging.ImageFormat]::Jpeg)
} finally { $font.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
Write-Output "Created contact sheet: $(Join-Path $root 'contact-sheet.jpg')"
