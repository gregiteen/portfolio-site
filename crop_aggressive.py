from PIL import Image, ImageChops

def crop_shave_trim(in_file, out_file):
    im = Image.open(in_file)
    # Shave off 20 pixels from all sides to destroy any outer borders
    w, h = im.size
    im = im.crop((20, 20, w-20, h-20))
    
    # Now get the new background color (top-left pixel)
    bg_color = im.getpixel((0,0))
    bg = Image.new(im.mode, im.size, bg_color)
    
    # Difference
    diff = ImageChops.difference(im, bg)
    if diff.mode == "RGB":
        diff = ImageChops.add(diff, diff, 2.0, -100)
    
    bbox = diff.getbbox()
    if bbox:
        # Add a tiny 10px padding
        left = max(0, bbox[0]-10)
        top = max(0, bbox[1]-10)
        right = min(im.size[0], bbox[2]+10)
        bottom = min(im.size[1], bbox[3]+10)
        
        im = im.crop((left, top, right, bottom))
    
    im.save(out_file)
    print(f"Aggressively cropped {in_file} down to {im.size}")

import sys
crop_shave_trim(sys.argv[1], sys.argv[2])
