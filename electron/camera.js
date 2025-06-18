// camera/photobooth.js
import { spawn } from 'child_process';
import path from 'path';

/**
 * Take a photo using gphoto2 with a custom folder and filename prefix
 * @param {string} saveFolder - Absolute path to folder (e.g., "D:\\Photobooth\\photos")
 * @param {string} prefix - Prefix for filename, default = "PXY"
 * @returns {Promise<string>} - Resolves with saved file path
 */
export const takePhoto = (saveFolder, prefix = 'PXY') => {
  return new Promise((resolve, reject) => {
    // Sanitize and prepare folder path
    const fixedFolder = saveFolder.replace(/\\/g, '/'); // Windows path to Unix-style
    const timestamp = new Date().toISOString().replace(/[:.]/g, '_').replace('T', '_').split('Z')[0];
    const filename = `${prefix}_${timestamp}.jpg`;
    const fullPath = path.posix.join(fixedFolder, filename);

    // Make sure folder exists
    const hostFolder = path.join('/mnt', fixedFolder[0].toLowerCase(), fixedFolder.slice(2));
    if (!fs.existsSync(hostFolder)) {
      fs.mkdirSync(hostFolder, { recursive: true });
    }

    // Run gphoto2 to take photo
    const args = ['--capture-image-and-download', '--filename', fullPath];
    const gphoto = spawn('wsl gphoto2', args);

    gphoto.stderr.on('data', (data) => {
      console.error(`gphoto2 stderr: ${data}`);
    });

    gphoto.on('close', (code) => {
      if (code === 0) {
        resolve(fullPath);
      } else {
        reject(new Error(`gphoto2 exited with code ${code}`));
      }
    });

    gphoto.on('error', (err) => reject(err));
  });
}

