from PIL import Image, ImageOps
import sys

def smart_crop(in_file, out_file, padding=20):
    im = Image.open(in_file)
    
    # Convert to grayscale and invert so text is white, background is black
    gray = im.convert("L")
    
    # If the background is light (e.g. cream/white), the text is dark
    # So we invert it: dark text becomes bright, light bg becomes dark
    # To determine if we need to invert, check the edges
    w, h = gray.size
    edges = [gray.getpixel((x, 0)) for x in range(w)] + [gray.getpixel((0, y)) for y in range(h)]
    bg_brightness = sum(edges) / len(edges)
    
    if bg_brightness > 127:
        gray = ImageOps.invert(gray)
        
    # Threshold to eliminate noise/vignette
    # Text will be bright (> 200 perhaps if we inverted a black text)
    # We use a strict threshold
    threshold = 100
    mask = gray.point(lambda p: 255 if p > threshold else 0)
    
    # Find bounding box of the text
    bbox = mask.getbbox()
    
    if bbox:
        # Add padding
        left = max(0, bbox[0] - padding)
        top = max(0, bbox[1] - padding)
        right = min(w, bbox[2] + padding)
        bottom = min(h, bbox[3] + padding)
        
        cropped = im.crop((left, top, right, bottom))
        cropped.save(out_file)
        print(f"Cropped {in_file} from {im.size} to {cropped.size}")
    else:
        print(f"Could not find bounding box for {in_file}")
        im.save(out_file)

smart_crop(sys.argv[1], sys.argv[2])
