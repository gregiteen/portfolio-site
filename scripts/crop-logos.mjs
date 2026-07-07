import Jimp from 'jimp';

async function crop(input, output) {
  try {
    console.log('Cropping ' + input);
    const image = await Jimp.read(input);
    image.autocrop();
    await image.writeAsync(output);
    console.log('Cropped ' + output);
  } catch (err) {
    console.error('Failed to crop ' + input, err);
  }
}

async function run() {
  await crop('assets/logos/ssss.jpg', 'assets/logos/ssss.jpg');
  await crop('assets/logos/total-recall.jpg', 'assets/logos/total-recall.jpg');
  await crop('assets/logos/gi_final_1.jpg', 'assets/logos/gi_final_1.jpg');
  // Crop any others if needed
}

run();
