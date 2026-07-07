from PIL import Image
import sys

def smart_color_crop(in_file, out_file):
    im = Image.open(in_file).convert("RGB")
    w, h = im.size
    
    min_x, min_y = w, h
    max_x, max_y = 0, 0
    
    pixels = im.load()
    
    for x in range(w):
        for y in range(h):
            r, g, b = pixels[x, y]
            # Detect actual logo content by looking for significant darkness or blueness.
            # The background is bright cream/white paper texture (r,g,b all > 200).
            # The logo is dark blue or blue.
            # We will consider anything that is significantly non-white as part of the logo.
            # E.g., if r < 200 or g < 200 or b < 200, it's the logo.
            # To be safe from dark noise, let's say r < 190 or b < 190
            
            if r < 190 or g < 190 or b < 190:
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y
                
    if min_x < max_x and min_y < max_y:
        # Add 30 pixels of padding, respecting image boundaries
        pad = 40
        left = max(0, min_x - pad)
        top = max(0, min_y - pad)
        right = min(w, max_x + pad)
        bottom = min(h, max_y + pad)
        
        tight_crop = im.crop((left, top, right, bottom))
        tight_crop.save(out_file, "PNG", compress_level=0)
        print(f"Color-cropped {in_file} from {w}x{h} to {tight_crop.size}")
    else:
        print(f"Could not find non-background colors in {in_file}")
        im.save(out_file, "PNG", compress_level=0)

smart_color_crop(sys.argv[1], sys.argv[2])
