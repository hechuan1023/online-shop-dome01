const fs = require('fs');
const zlib = require('zlib');

const width = 400;
const height = 400;
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(width, 0);
ihdrData.writeUInt32BE(height, 4);
ihdrData[8] = 8;
ihdrData[9] = 2;
ihdrData[10] = 0;
ihdrData[11] = 0;
ihdrData[12] = 0;
const ihdr = createChunk('IHDR', ihdrData);

const rawData = Buffer.alloc(height * (1 + width * 3));
for (let y = 0; y < height; y++) {
  rawData[y * (1 + width * 3)] = 0;
  for (let x = 0; x < width; x++) {
    const offset = y * (1 + width * 3) + 1 + x * 3;
    rawData[offset] = 220;
    rawData[offset + 1] = 220;
    rawData[offset + 2] = 220;
  }
}
const compressed = zlib.deflateSync(rawData);
const idat = createChunk('IDAT', compressed);
const iend = createChunk('IEND', Buffer.alloc(0));

const png = Buffer.concat([signature, ihdr, idat, iend]);
fs.mkdirSync('public/images', { recursive: true });
fs.writeFileSync('public/images/default-product.png', png);
console.log('Created 400x400 PNG placeholder (' + png.length + ' bytes)');

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xEDB88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return crc ^ 0xFFFFFFFF;
}
