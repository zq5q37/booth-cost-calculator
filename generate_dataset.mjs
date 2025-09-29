import fs from 'fs';
import path from 'path';

// Base folder where your images are stored
const baseDir = './keychains_webp';

// Map folder names to sizes (you can adjust if needed)
const sizeMapping = {
  'A3': ['A3'],
  'A4': ['A4'],
  'A5': ['A5'],
  'A7': ['A7'],
  'Mini': ['A7'], // example mapping
  'Keychain': ['KeyC'], 
  'Sticker': ['Sticker']
};

// Helper to get sizes from filename or folder
function getSizes(filename) {
  // Example: look for size keywords in filename
  const sizes = Object.keys(sizeMapping).filter(size => filename.toUpperCase().includes(size.toUpperCase()));
  return sizes.length ? sizes : ['KeyC']; // default if no size found
}

const dataset = [];

// Iterate over fandom folders
fs.readdirSync(baseDir).forEach(fandom => {
  const folderPath = path.join(baseDir, fandom);
  if (fs.statSync(folderPath).isDirectory()) {
    fs.readdirSync(folderPath).forEach(file => {
      if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) {
        dataset.push({
          image: `${baseDir}/${fandom}/${file}`,
          sizes: getSizes(file)
        });
      }
    });
  }
});

fs.writeFileSync('kc_dataset.json', JSON.stringify(dataset, null, 2));
console.log('Dataset generated!');
