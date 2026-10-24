import { writeArrayBuffer } from "geotiff";
import { deflateSync } from "node:zlib";

// Real Deflate-compressed, single-strip TIFF: exercise the decoder path that an
// uncompressed writer fixture cannot cover. No external provider requests.
export function compressedRoofTiff(): ArrayBuffer {
  const pixels = [1, 1, 0, 0, 1, 0];
  const original = writeArrayBuffer(pixels, { width: 3, height: 2, BitsPerSample: [8], SamplesPerPixel: 1, ModelPixelScale: [0.25, 0.25, 0], ModelTiepoint: [0, 0, 0, 700000, 3100000, 0], GTModelTypeGeoKey: 1, GTRasterTypeGeoKey: 1, ProjectedCSTypeGeoKey: 32643 });
  const compressed = deflateSync(new Uint8Array(pixels));
  const bytes = new Uint8Array(original.byteLength + compressed.byteLength); bytes.set(new Uint8Array(original)); bytes.set(compressed, original.byteLength);
  const view = new DataView(bytes.buffer), little = view.getUint16(0) === 0x4949, ifd = view.getUint32(4, little), count = view.getUint16(ifd, little);
  for (let i = 0; i < count; i++) {
    const offset = ifd + 2 + i * 12, tag = view.getUint16(offset, little);
    const value = tag === 259 ? 8 : tag === 273 ? original.byteLength : tag === 279 ? compressed.byteLength : null;
    if (value !== null) {
      const type = view.getUint16(offset + 2, little);
      if (type === 3) view.setUint16(offset + 8, value, little); else view.setUint32(offset + 8, value, little);
    }
  }
  return bytes.buffer;
}
