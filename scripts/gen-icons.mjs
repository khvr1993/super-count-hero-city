import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const OUT = new URL('../public/icons/', import.meta.url);
mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------------ png */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* --------------------------------------------------------------- drawing */
const lerp = (a, b, t) => a + (b - a) * t;

function blend(buf, i, r, g, b, a) {
  const alpha = a / 255;
  buf[i] = lerp(buf[i], r, alpha);
  buf[i + 1] = lerp(buf[i + 1], g, alpha);
  buf[i + 2] = lerp(buf[i + 2], b, alpha);
  buf[i + 3] = Math.max(buf[i + 3], a);
}

function fillRect(buf, w, h, x, y, rw, rh, color, alpha = 255) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(w, Math.ceil(x + rw));
  const y1 = Math.min(h, Math.ceil(y + rh));
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      blend(buf, (py * w + px) * 4, ...color, alpha);
    }
  }
}

function fillCircle(buf, w, h, cx, cy, radius, color, alpha = 255) {
  const x0 = Math.max(0, Math.floor(cx - radius));
  const x1 = Math.min(w, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const y1 = Math.min(h, Math.ceil(cy + radius));
  const r2 = radius * radius;
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      const dx = px + 0.5 - cx;
      const dy = py + 0.5 - cy;
      if (dx * dx + dy * dy <= r2) blend(buf, (py * w + px) * 4, ...color, alpha);
    }
  }
}

function starPoints(cx, cy, outer, inner, points = 5) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    pts.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return pts;
}

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function fillPolygon(buf, w, h, poly, color, alpha = 255) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of poly) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  for (let py = Math.max(0, Math.floor(minY)); py < Math.min(h, Math.ceil(maxY)); py++) {
    for (let px = Math.max(0, Math.floor(minX)); px < Math.min(w, Math.ceil(maxX)); px++) {
      if (pointInPolygon(px + 0.5, py + 0.5, poly)) {
        blend(buf, (py * w + px) * 4, ...color, alpha);
      }
    }
  }
}

/* ------------------------------------------------------------------ icon */
const NAVY = [20, 33, 61];
const YELLOW = [255, 217, 61];
const WHITE = [255, 255, 255];

function drawIcon(size, { maskable = false } = {}) {
  const ss = 2;
  const w = size * ss;
  const h = size * ss;
  const buf = new Float32Array(w * h * 4);

  // sky gradient
  for (let y = 0; y < h; y++) {
    const t = y / h;
    const r = lerp(143, 47, t);
    const g = lerp(227, 111, t);
    const b = lerp(255, 237, t);
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
      buf[i + 3] = 255;
    }
  }

  // sun glow
  const glow = maskable ? 0.5 : 0.62;
  const gx = w * (maskable ? 0.5 : 0.68);
  const gy = h * (maskable ? 0.38 : 0.2);
  const gr = w * glow;
  for (let y = Math.max(0, Math.floor(gy - gr)); y < Math.min(h, gy + gr); y++) {
    for (let x = Math.max(0, Math.floor(gx - gr)); x < Math.min(w, gx + gr); x++) {
      const dx = x - gx;
      const dy = y - gy;
      const d = Math.sqrt(dx * dx + dy * dy) / gr;
      if (d < 1) {
        const a = (1 - d) * (1 - d) * 190;
        blend(buf, (y * w + x) * 4, 255, 244, 168, a);
      }
    }
  }

  // stars
  for (const [sx, sy, r] of [
    [0.18, 0.2, 0.035],
    [0.83, 0.34, 0.026],
    [0.9, 0.14, 0.02],
  ]) {
    const pts = starPoints(w * sx, h * sy, w * r, w * r * 0.42);
    fillPolygon(buf, w, h, pts, WHITE, 220);
  }

  // city silhouette
  const baseY = maskable ? h * 0.79 : h * 0.74;
  fillRect(buf, w, h, 0, baseY, w, h - baseY, NAVY);
  const buildings = [
    [0.02, 0.07, 0.12],
    [0.15, 0.1, 0.09],
    [0.27, 0.05, 0.14],
    [0.43, 0.12, 0.08],
    [0.55, 0.08, 0.13],
    [0.7, 0.11, 0.09],
    [0.81, 0.06, 0.15],
  ];
  for (const [x, wd, ht] of buildings) {
    const bh = h * ht;
    fillRect(buf, w, h, w * x, baseY - bh, w * wd, bh, NAVY);
  }

  // windows
  for (const [x, y] of [
    [0.06, 0.74],
    [0.1, 0.74],
    [0.06, 0.79],
    [0.3, 0.83],
    [0.34, 0.83],
    [0.58, 0.77],
    [0.62, 0.77],
    [0.85, 0.72],
    [0.89, 0.72],
  ]) {
    fillRect(buf, w, h, w * x, h * y, w * 0.018, h * 0.022, YELLOW, 210);
  }

  // star badge
  const cx = w * 0.5;
  const cy = h * (maskable ? 0.42 : 0.42);
  const outer = w * (maskable ? 0.2 : 0.25);
  const inner = outer * 0.44;
  fillPolygon(buf, w, h, starPoints(cx, cy, outer + w * 0.016, inner + w * 0.01), NAVY);
  fillPolygon(buf, w, h, starPoints(cx, cy, outer, inner), YELLOW);
  fillPolygon(buf, w, h, starPoints(cx, cy, outer * 0.5, inner * 0.5), [255, 246, 200], 180);

  // downsample
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let dy = 0; dy < ss; dy++) {
        for (let dx = 0; dx < ss; dx++) {
          const i = ((y * ss + dy) * w + (x * ss + dx)) * 4;
          r += buf[i];
          g += buf[i + 1];
          b += buf[i + 2];
          a += buf[i + 3];
        }
      }
      const n = ss * ss;
      const o = (y * size + x) * 4;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
      out[o + 3] = Math.round(a / n);
    }
  }
  return encodePNG(size, size, out);
}

const files = [
  ['icon-180.png', 180, {}],
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-maskable-512.png', 512, { maskable: true }],
];

for (const [name, size, opts] of files) {
  writeFileSync(new URL(name, OUT), drawIcon(size, opts));
  console.log(`wrote ${name} (${size}x${size})`);
}
