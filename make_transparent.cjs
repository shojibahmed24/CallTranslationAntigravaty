const Jimp = require('jimp');

async function processImage(inputPath, outputPath) {
    const image = await Jimp.read(inputPath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    const threshold = 30; 

    function getIdx(x, y) {
      return (y * width + x) * 4;
    }

    const cx = width / 2;
    const cy = height / 2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = getIdx(x, y);
        const r = image.bitmap.data[idx];
        const g = image.bitmap.data[idx + 1];
        const b = image.bitmap.data[idx + 2];

        const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
        
        // If it's dark and far enough from the center
        if (r < threshold && g < threshold && b < threshold && dist > width * 0.35) {
          image.bitmap.data[idx + 3] = 0; // Transparent
        }
      }
    }

    await image.writeAsync(outputPath);
    console.log(`Processed ${outputPath}`);
}

async function run() {
  await processImage(
    'C:/Users/rajsh/.gemini/antigravity/brain/9c0af05e-1218-43a3-8c24-27517d324fff/.user_uploaded/media_1788265307952.jpg',
    'native-app/assets/images/logo-icon-transparent.png'
  );
  await processImage(
    'C:/Users/rajsh/.gemini/antigravity/brain/9c0af05e-1218-43a3-8c24-27517d324fff/.user_uploaded/media_1788265307968.jpg',
    'native-app/assets/images/logo-full-transparent.png'
  );
}

run();
