
$sourcePath = "C:/Users/pascu/.gemini/antigravity/brain/d93a2b54-5e4a-47b4-9e77-b0f54998c4c0/beige_loafer_side_pure_white_shadows_1769742773397.png"
$destPath = "C:/Users/pascu/.gemini/antigravity/brain/d93a2b54-5e4a-47b4-9e77-b0f54998c4c0/beige_loafer_side_corrected_flipped.png"

Add-Type -AssemblyName System.Drawing

if (Test-Path $sourcePath) {
    try {
        $image = [System.Drawing.Image]::FromFile($sourcePath)
        $image.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX)
        $image.Save($destPath)
        $image.Dispose()
        Write-Host "Image flipped successfully."
    }
    catch {
        Write-Error "Error processing image: $_"
        exit 1
    }
} else {
    Write-Error "Source image not found."
    exit 1
}
