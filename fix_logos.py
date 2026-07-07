from PIL import Image
import sys
import math

def distance(c1, c2):
    return math.sqrt((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2)

def make_transparent(in_file, out_file, is_ssss=False):
    im = Image.open(in_file).convert("RGBA")
    w, h = im.size
    
    # If SSSS, crop the bottom 25% off to remove the text and line!
    if is_ssss:
        im = im.crop((0, 0, w, int(h * 0.75)))
        w, h = im.size
    
    # Sample background from top-left corner
    bg_c = im.getpixel((0,0))
    
    pixels = im.load()
    
    # We want a smooth alpha transition
    # Distances greater than 'max_dist' are fully opaque (logo)
    # Distances less than 'min_dist' are fully transparent (background)
    min_dist = 15
    max_dist = 60
    
    for x in range(w):
        for y in range(h):
            p = pixels[x, y]
            dist = distance(p, bg_c)
            
            if dist < min_dist:
                pixels[x, y] = (p[0], p[1], p[2], 0)
            elif dist > max_dist:
                pixels[x, y] = (p[0], p[1], p[2], 255)
            else:
                # Smooth interpolation
                alpha = int(((dist - min_dist) / (max_dist - min_dist)) * 255)
                # To avoid the halo, we push the color of the semi-transparent pixels towards the logo color
                # Since we don't know the exact logo color, making it just semi-transparent is better than a hard edge
                pixels[x, y] = (p[0], p[1], p[2], alpha)
                
    # Now find the bounding box of the non-transparent pixels to crop it tightly
    bbox = im.getbbox()
    if bbox:
        pad = 20
        left = max(0, bbox[0]-pad)
        top = max(0, bbox[1]-pad)
        right = min(w, bbox[2]+pad)
        bottom = min(h, bbox[3]+pad)
        im = im.crop((left, top, right, bottom))
        
    im.save(out_file, "PNG")
    print(f"Processed {in_file}")

make_transparent(sys.argv[1], sys.argv[2], sys.argv[3] == "True")
