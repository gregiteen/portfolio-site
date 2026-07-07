from PIL import Image
import sys

def perfect_extract(in_file, quadrant_index, out_file, is_ssss=False, upscale_factor=2):
    im = Image.open(in_file)
    w, h = im.size
    
    top_offset = int(h * 0.20) if is_ssss else int(h * 0.15)
    
    margin_x = w // 20
    margin_y = h // 20
    
    q_w = w // 2
    q_h = (h - top_offset) // 2
    
    quads = [
        (margin_x, top_offset + margin_y, q_w - margin_x, top_offset + q_h - margin_y),
        (q_w + margin_x, top_offset + margin_y, w - margin_x, top_offset + q_h - margin_y),
    ]
    
    box = quads[quadrant_index]
    quad_im = im.crop(box)
    
    # CRITICAL FIX: The SSSS presentation board has "Variation A" text and a line at the bottom.
    # We must explicitly crop off the bottom 25% to remove this garbage.
    qw, qh = quad_im.size
    if is_ssss:
        quad_im = quad_im.crop((0, 0, qw, int(qh * 0.75)))
        qw, qh = quad_im.size
        
    # Now gently crop the surrounding white space to make it a tight logo.
    # We just find the true bounding box.
    bg_color = quad_im.getpixel((0,0))
    min_x, min_y = qw, qh
    max_x, max_y = 0, 0
    tolerance = 25
    pixels = quad_im.load()
    
    for x in range(qw):
        for y in range(qh):
            p = pixels[x,y]
            # Simple Euclidean distance for difference
            diff = sum([abs(p[i] - bg_color[i]) for i in range(3)])
            if diff > tolerance:
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y
                
    if min_x < max_x and min_y < max_y:
        pad = 30
        left = max(0, min_x - pad)
        top = max(0, min_y - pad)
        right = min(qw, max_x + pad)
        bottom = min(qh, max_y + pad)
        quad_im = quad_im.crop((left, top, right, bottom))
        
    # Upscale losslessly
    new_size = (quad_im.width * upscale_factor, quad_im.height * upscale_factor)
    try:
        quad_im = quad_im.resize(new_size, resample=Image.Resampling.LANCZOS)
    except AttributeError:
        quad_im = quad_im.resize(new_size, resample=Image.LANCZOS)
        
    quad_im.save(out_file, "PNG", compress_level=0)
    print(f"Perfectly extracted {out_file}")

perfect_extract("/Users/greg/.gemini/antigravity/brain/2b88df18-8de0-4690-8f2f-cc2ed92c4238/ssss_fixed_2.jpg", 0, "/Users/greg/Downloads/ssss_final_logo.png", is_ssss=True)
perfect_extract("/Users/greg/.gemini/antigravity/brain/2b88df18-8de0-4690-8f2f-cc2ed92c4238/tr_fixed_3.jpg", 1, "/Users/greg/Downloads/tr_final_logo.png", is_ssss=False)
