import fs from 'fs';
import path from 'path';

const logoPath = path.join('public', 'logo.png');
const svgPath = path.join('public', 'favicon.svg');

try {
    const imgBuffer = fs.readFileSync(logoPath);
    const b64 = imgBuffer.toString('base64');

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <image href="data:image/png;base64,${b64}" x="20" y="20" width="60" height="60" />
</svg>`;

    fs.writeFileSync(svgPath, svgContent);
    console.log('Successfully created favicon.svg with embedded image.');
} catch (error) {
    console.error('Error creating favicon:', error);
    process.exit(1);
}
