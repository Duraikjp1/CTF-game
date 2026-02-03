# PPG CTF Assets

This folder contains all the challenge files for the PPG Arts and Science College CTF event.

## Files Required:

1. **logo.png** - College logo (300x300px recommended)
   - Place your college logo here
   - If not provided, emoji placeholder will be shown

2. **round1.pdf** - PDF Forensics Challenge
   - Create a PDF with Author metadata: "PPG{PDF_FORENSICS}"
   - Use any PDF editor to set the Author field in document properties

3. **round2.jpg** - Image EXIF Challenge  
   - Use any JPG image
   - Set Comment/Description EXIF field: "PPG{IMAGE_EXIF_MASTER}"

4. **round4.png** - QR Code Analysis Challenge
   - Create QR code with content: "WKVY@C@HOVRXGHVXOWRIWKHLVFRUUHFWZD\WRUHDOWKLVLVDWWDFNFKDOOHQJH"
   - This is Caesar cipher shift 3 of the message
   - Use any online QR code generator

## Quick Setup Instructions:

### PDF Setup (round1.pdf):
1. Open any PDF editor
2. Go to File → Properties → Description
3. Set Author field to: PPG{PDF_FORENSICS}
4. Save as round1.pdf

### Image Setup (round2.jpg):
1. Use any JPG file
2. Right-click → Properties → Details
3. Add Comment: PPG{IMAGE_EXIF_MASTER}
4. Save as round2.jpg

### QR Code Setup (round4.png):
1. Go to any QR code generator website
2. Enter text: WKVY@C@HOVRXGHVXOWRIWKHLVFRUUHFWZD\WRUHDOWKLVLVDWWDFNFKDOOHQJH
3. Generate and download as round4.png

All files should be placed directly in this assets folder.