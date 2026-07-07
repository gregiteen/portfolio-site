from PIL import Image
import sys

def debug_image(in_file):
    im = Image.open(in_file).convert("RGBA")
    data = im.getdata()
    
    # Let's count how many pixels are NOT transparent in the cropped PNG
    w, h = im.size
    print(f"Size: {w}x{h}")
    
    # Check top, bottom, left, right rows/columns to see what's preventing a tighter crop
    top_pixels = [im.getpixel((x, 0)) for x in range(w) if im.getpixel((x, 0))[3] > 0]
    print(f"Non-transparent pixels in top row: {len(top_pixels)}")
    if top_pixels: print(f"Sample: {top_pixels[:3]}")
    
    bottom_pixels = [im.getpixel((x, h-1)) for x in range(w) if im.getpixel((x, h-1))[3] > 0]
    print(f"Non-transparent pixels in bottom row: {len(bottom_pixels)}")
    if bottom_pixels: print(f"Sample: {bottom_pixels[:3]}")

debug_image(sys.argv[1])
