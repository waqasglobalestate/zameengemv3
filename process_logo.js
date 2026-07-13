const Jimp = require('jimp');

async function removeGrey() {
  const image = await Jimp.read('./public/images/zameen_gem_logo.png');
  
  // To avoid jagged edges, we'll implement a simple threshold transparency
  // where greys/whites become transparent.
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    // Grey/White usually has a low difference between RGB channels.
    // If it's grey/white, make it transparent. 
    // Assuming the logo is Gold/Royal Blue. Gold has high diff (R=212, G=175, B=55).
    // Royal Blue has high diff.
    if (diff < 25 && max > 120) {
      this.bitmap.data[idx + 3] = 0; // make transparent
    }
  });

  await image.writeAsync('./public/images/zameen_gem_logo.png');
  console.log("Processed logo successfully");
}

removeGrey().catch(err => {
  console.error("Error processing logo:", err);
  process.exit(1);
});
