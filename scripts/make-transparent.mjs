import Jimp from 'jimp';

async function processImage(inputPath, outputPath) {
  console.log(`Processing ${inputPath}...`);
  const image = await Jimp.read(inputPath);
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // Calculate alpha based on the maximum brightness of the pixel
    const a = Math.max(r, g, b);
    
    if (a > 0) {
      // Un-premultiply the RGB channels so edges blend perfectly on any background
      this.bitmap.data[idx + 0] = Math.min(255, (r * 255) / a);
      this.bitmap.data[idx + 1] = Math.min(255, (g * 255) / a);
      this.bitmap.data[idx + 2] = Math.min(255, (b * 255) / a);
    }
    
    // Set the calculated alpha
    this.bitmap.data[idx + 3] = a;
  });
  
  await image.writeAsync(outputPath);
  console.log(`Saved transparent image to ${outputPath}`);
}

async function run() {
  await processImage('static/gi-logo-dark.jpg', 'static/gi-logo.png');
  await processImage('assets/favicon-dark_temp.jpg', 'assets/favicon.png');
  console.log('Done!');
}

run().catch(console.error);
