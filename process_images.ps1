Add-Type -AssemblyName System.Drawing

function MakeTransparent($inPath, $outPath) {
    $bmp = new-object System.Drawing.Bitmap $inPath
    
    # We will do a basic flood fill or just threshold
    # Since doing Flood Fill in pure powershell is slow, we will just loop and make dark pixels transparent
    
    $width = $bmp.Width
    $height = $bmp.Height
    
    for ($y = 0; $y -lt $height; $y++) {
        for ($x = 0; $x -lt $width; $x++) {
            $pixel = $bmp.GetPixel($x, $y)
            # Threshold 30
            if ($pixel.R -lt 30 -and $pixel.G -lt 30 -and $pixel.B -lt 30) {
                # Some pixels inside the globe might be dark, but we just want to remove the pure black background.
                # Actually, distance to center check can protect the globe!
                # The globe is in the center. 
                $cx = $width / 2
                $cy = $height / 2
                $dist = [Math]::Sqrt([Math]::Pow($x - $cx, 2) + [Math]::Pow($y - $cy, 2))
                
                # If distance > 40% of width, it's definitely background
                if ($dist -gt ($width * 0.35)) {
                    $bmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
                }
            }
        }
    }
    
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Processed $outPath"
}

MakeTransparent "C:/Users/rajsh/.gemini/antigravity/brain/9c0af05e-1218-43a3-8c24-27517d324fff/.user_uploaded/media_1788265307952.jpg" "native-app/assets/images/logo-icon-transparent.png"
MakeTransparent "C:/Users/rajsh/.gemini/antigravity/brain/9c0af05e-1218-43a3-8c24-27517d324fff/.user_uploaded/media_1788265307968.jpg" "native-app/assets/images/logo-full-transparent.png"
