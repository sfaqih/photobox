// Lut.js

// Parse file CUBE
export const parseCubeFile = (text) => {
    const lines = text.split('\n');
    let size = 0;
    let data = [];
  
    let domainMin = [0.0, 0.0, 0.0];
    let domainMax = [1.0, 1.0, 1.0];
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
  
      // Skip komentar dan baris kosong
      if (line.startsWith('#') || line === '') continue;
  
      // Baca ukuran LUT
      if (line.startsWith('LUT_3D_SIZE')) {
        const parts = line.split(/\s+/);
        size = parseInt(parts[1]);
        if (isNaN(size) || size <= 0) throw new Error('Invalid LUT_3D_SIZE value.');
        continue;
      }
  
      // Optional: DOMAIN_MIN / DOMAIN_MAX
      if (line.startsWith('DOMAIN_MIN')) {
        domainMin = line.split(/\s+/).slice(1).map(parseFloat);
        continue;
      }
  
      if (line.startsWith('DOMAIN_MAX')) {
        domainMax = line.split(/\s+/).slice(1).map(parseFloat);
        continue;
      }
  
      // Data RGB
      if (/^[\d.\-+eE]+\s+[\d.\-+eE]+\s+[\d.\-+eE]+$/.test(line)) {
        const [r, g, b] = line.split(/\s+/).map(parseFloat);
        if ([r, g, b].some(isNaN)) throw new Error(`Invalid RGB value on line ${i + 1}`);
        data.push(r, g, b);
      }
    }
  
    // Validasi akhir
    if (data.length !== size * size * size * 3) {
      console.warn(`Expected ${size ** 3} RGB entries, got ${data.length / 3}`);
    }
  
    return { size, data, domainMin, domainMax };
  };
  
  
  // Terapkan LUT ke gambar
export const applyLutToImage = (image, lutDataFile, outputType = 'image') => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
    
      // DRAW image to canvas first!
      ctx.drawImage(image, 0, 0);
    
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
    
      const { size, lut } = lutDataFile; // pastikan `lut` benar
      const lutData = lut;
    
      const getLUTIndex = (r, g, b) => {
        const ir = Math.min(Math.floor(r * (size - 1)), size - 1);
        const ig = Math.min(Math.floor(g * (size - 1)), size - 1);
        const ib = Math.min(Math.floor(b * (size - 1)), size - 1);
        return ir + ig * size + ib * size * size;
      };
    
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] / 255;
        let g = data[i + 1] / 255;
        let b = data[i + 2] / 255;
    
        // Clamp values
        r = Math.max(0, Math.min(1, r));
        g = Math.max(0, Math.min(1, g));
        b = Math.max(0, Math.min(1, b));
    
        const index = getLUTIndex(r, g, b);
        const [nr, ng, nb] = lutData[index] || [r, g, b];
    
        data[i] = Math.min(255, Math.max(0, nr * 255));
        data[i + 1] = Math.min(255, Math.max(0, ng * 255));
        data[i + 2] = Math.min(255, Math.max(0, nb * 255));
      }
    
      ctx.putImageData(imgData, 0, 0);
    
      if (outputType === 'url') {
        resolve(canvas.toDataURL('image/png'));
      } else {
        const newImg = new window.Image();
        newImg.onload = () => resolve(newImg);
        newImg.onerror = (err) => reject(err);
        newImg.src = canvas.toDataURL('image/png');
      }
    } catch (error) {
      reject(error);
    }    
  });
};