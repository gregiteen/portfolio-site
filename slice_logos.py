from PIL import Image, ImageOps
import sys
import os

def extract_quadrants(in_file, out_prefix):
    im = Image.open(in_file)
    w, h = im.size
    
    # Define the 4 quadrants (roughly). 
    # We will avoid the very edges and the center crosslines by adding some margin.
    margin_x = w // 20
    margin_y = h // 20
    
    # SSSS presentation board has a big header at the top, so let's cut off the top 20%
    # Total Recall has a header too, cut off top 15%
    top_offset = int(h * 0.20)
    
    q_w = w // 2
    q_h = (h - top_offset) // 2
    
    quads = [
        # (left, top, right, bottom)
        (margin_x, top_offset + margin_y, q_w - margin_x, top_offset + q_h - margin_y),
        (q_w + margin_x, top_offset + margin_y, w - margin_x, top_offset + q_h - margin_y),
        (margin_x, top_offset + q_h + margin_y, q_w - margin_x, h - margin_y),
        (q_w + margin_x, top_offset + q_h + margin_y, w - margin_x, h - margin_y)
    ]
    
    labels = ["top_left", "top_right", "bottom_left", "bottom_right"]
    
    for i, box in enumerate(quads):
        quad_im = im.crop(box)
        
        # Now we want to tightly crop the logo inside the quadrant
        # Convert to grayscale and threshold to find bounding box
        gray = quad_im.convert("L")
        
        # Determine background brightness from edges
        qw, qh = gray.size
        edges = [gray.getpixel((x, 0)) for x in range(qw)] + [gray.getpixel((0, y)) for y in range(qh)]
        bg_brightness = sum(edges) / len(edges)
        
        if bg_brightness > 127:
            gray = ImageOps.invert(gray)
            
        mask = gray.point(lambda p: 255 if p > 50 else 0)
        bbox = mask.getbbox()
        
        if bbox:
            # Add tiny padding
            pad = 10
            left = max(0, bbox[0] - pad)
            top = max(0, bbox[1] - pad)
            right = min(qw, bbox[2] + pad)
            bottom = min(qh, bbox[3] + pad)
            final_logo = quad_im.crop((left, top, right, bottom))
        else:
            final_logo = quad_im
            
        out_path = f"{out_prefix}_{labels[i]}.jpg"
        final_logo.save(out_path)
        print(f"Extracted {out_path}")

extract_quadrants(sys.argv[1], sys.argv[2])
