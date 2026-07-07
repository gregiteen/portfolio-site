from PIL import Image
import sys

def center_logo(in_file, out_file):
    im = Image.open(in_file).convert("RGB")
    w, h = im.size
    
    # Background color from the top left corner (after our previous cropping, the corners are definitely background)
    bg_c = im.getpixel((0,0))
    
    min_x, min_y = w, h
    max_x, max_y = 0, 0
    
    pixels = im.load()
    tolerance = 15
    
    for x in range(w):
        for y in range(h):
            p = pixels[x, y]
            # Euclidean distance or simple absolute difference
            diff = abs(p[0]-bg_c[0]) + abs(p[1]-bg_c[1]) + abs(p[2]-bg_c[2])
            if diff > tolerance:
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y
                
    if min_x < max_x and min_y < max_y:
        # Tightly crop the actual logo
        tight_crop = im.crop((min_x, min_y, max_x, max_y))
        cw, ch = tight_crop.size
        
        # Add perfectly even padding
        pad = 60
        new_w = cw + (pad * 2)
        new_h = ch + (pad * 2)
        
        # Create new perfectly centered canvas
        centered_im = Image.new("RGB", (new_w, new_h), bg_c)
        centered_im.paste(tight_crop, (pad, pad))
        
        centered_im.save(out_file, "PNG", compress_level=0)
        print(f"Perfectly centered {in_file}")
    else:
        print(f"Could not find logo in {in_file}")
        im.save(out_file, "PNG", compress_level=0)

center_logo(sys.argv[1], sys.argv[2])
