/**
 * Generates original multi-layer pixel-art Barad-dûr SVG (96×140).
 * Run: bun run pixel-tower
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const W = 96;
const H = 150;
const PAD_TOP = 10;

const C: Record<string, string> = {
  ".": "",
  K: "#0a0806",
  k: "#14100e",
  S: "#2e2620",
  s: "#3d342c",
  G: "#4a4038",
  L: "#8b0000",
  l: "#c41e0a",
  F: "#ff2200",
  f: "#ff4500",
  O: "#ff6600",
  o: "#ff8800",
  Y: "#ffcc00",
  y: "#ffaa00",
  W: "#ffe8a0",
  X: "#080000",
  A: "#1a0806",
  a: "#2a1008",
};

type Grid = string[][];

function emptyGrid(): Grid {
  return Array.from({ length: H }, () => Array(W).fill("."));
}

function blit(target: Grid, rows: string[], ox: number, oy: number): void {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y]!;
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]!;
      if (ch === ".") continue;
      const ty = oy + y;
      const tx = ox + x;
      if (ty >= 0 && ty < H && tx >= 0 && tx < W) {
        target[ty]![tx] = ch;
      }
    }
  }
}

function centerRow(row: string): string {
  const trimmed = row.trim();
  const left = Math.floor((W - trimmed.length) / 2);
  const right = W - trimmed.length - left;
  return ".".repeat(Math.max(0, left)) + trimmed + ".".repeat(Math.max(0, right));
}

function centerRows(rows: string[]): string[] {
  return rows.map(centerRow);
}

function gridToRects(grid: Grid, ox = 0, oy = 0): string {
  const rects: string[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < W; x++) {
      const fill = C[grid[y]![x]!];
      if (fill) {
        rects.push(`<rect x="${ox + x}" y="${oy + y}" width="1" height="1" fill="${fill}"/>`);
      }
    }
  }
  return rects.join("\n      ");
}

function layerToRectsAt(rows: string[], baseY: number): string {
  const centered = centerRows(rows);
  const rects: string[] = [];
  for (let y = 0; y < centered.length; y++) {
    const line = centered[y]!;
    for (let x = 0; x < W; x++) {
      const fill = C[line[x]!];
      if (fill) {
        rects.push(`<rect x="${x}" y="${baseY + y}" width="1" height="1" fill="${fill}"/>`);
      }
    }
  }
  return rects.join("\n      ");
}

function inEllipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean {
  if (rx <= 0 || ry <= 0) return false;
  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  return nx * nx + ny * ny <= 1;
}

function inDiamond(x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean {
  if (rx <= 0 || ry <= 0) return false;
  return Math.abs(x - cx) / rx + Math.abs(y - cy) / ry <= 1;
}

function buildEyeLayers(): {
  socket: string[];
  glow: string[];
  iris: string[];
  pupil: string[];
} {
  const eyeH = 30;
  const eyeW = 50;
  const cx = (eyeW - 1) / 2;
  const cy = (eyeH - 1) / 2;
  const socketRx = 23;
  const socketRy = 13;
  const glowRx = 21;
  const glowRy = 11;
  const irisRx = 17;
  const irisRy = 9;
  const pupilRx = 5;
  const pupilRy = 12;

  const socket: string[] = [];
  const glow: string[] = [];
  const iris: string[] = [];
  const pupil: string[] = [];

  for (let y = 0; y < eyeH; y++) {
    let sRow = "";
    let gRow = "";
    let iRow = "";
    let pRow = "";

    for (let x = 0; x < eyeW; x++) {
      const inSocket = inEllipse(x, y, cx, cy, socketRx, socketRy);
      const inGlowRing = inEllipse(x, y, cx, cy, glowRx, glowRy);
      const inIris = inEllipse(x, y, cx, cy, irisRx, irisRy);
      const inPupil = inDiamond(x, y, cx, cy, pupilRx, pupilRy);
      const edgeT = Math.hypot((x - cx) / socketRx, (y - cy) / socketRy);

      sRow += inSocket ? (edgeT > 0.9 ? "A" : "a") : ".";

      if (inPupil) {
        gRow += ".";
        iRow += ".";
        pRow += "X";
        continue;
      }

      pRow += ".";

      if (inIris) {
        const t = Math.hypot((x - cx) / irisRx, (y - cy) / irisRy);
        iRow += t < 0.45 ? "Y" : t < 0.72 ? "O" : "f";
        gRow += ".";
      } else if (inGlowRing) {
        const t = Math.hypot((x - cx) / glowRx, (y - cy) / glowRy);
        gRow += t < 0.55 ? "Y" : t < 0.82 ? "O" : "o";
        iRow += ".";
      } else {
        gRow += ".";
        iRow += ".";
      }
    }

    socket.push(centerRow(sRow));
    glow.push(centerRow(gRow));
    iris.push(centerRow(iRow));
    pupil.push(centerRow(pRow));
  }

  return { socket, glow, iris, pupil };
}

// ── Layer art (original) ──

const GROUND = centerRows([
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  "GkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkG",
  "GGkkkkSSSkkkkkkkkkkkSSSkkkkkkkkkkkSSSkkkkkkkkkkkSSSkkkkkkkkkkkSSSkkkkkkkkkkkSSSkkkkkkkGG",
  "kGkkkSSSSSkkkkkkkkSSSSSkkkkkkkkkSSSSSkkkkkkkkkSSSSSkkkkkkkkkSSSSSkkkkkkkkSSSSSkkkkkkGk",
  "kkGkkSSSSSSkkkkkkSSSSSSkkkkkkkkSSSSSSkkkkkkkkSSSSSSkkkkkkkkSSSSSSkkkkkkSSSSSSkkkkkGkk",
  "kkkGkSSSSSSSkkkkSSSSSSSkkkkkkkSSSSSSSkkkkkkkSSSSSSSkkkkkkkSSSSSSSkkkkSSSSSSSkkkkGkkk",
  "kkkkGSSSSSSSSkkSSSSSSSSkkkkkkSSSSSSSSkkkkkkSSSSSSSSkkkkkkSSSSSSSSkkSSSSSSSSkkGkkkk",
  "kkkkkGSSSSSSSSSSSSSSSSSSkkkkSSSSSSSSSSkkkkSSSSSSSSSSkkkkSSSSSSSSSSSSSSSSSSGkkkkk",
  "kkkkkkGkSSSSSSSSSSSSSSSSSkkkSSSSSSSSSkkkSSSSSSSSSSSkkkSSSSSSSSSSSSSSSSSkGkkkkkk",
  "kkkkkkkGGkSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSkGGkkkkkkk",
  "kkkkkkkkkGGkkSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSkkGGkkkkkkkkk",
  "kkkkkkkkkkkGGGkkkSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSkkkGGGkkkkkkkkkkk",
  "kkkkkkkkkkkkkGGGkkkkkkSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSkkkkkkGGGkkkkkkkkkkkkk",
  "kkkkkkkkkkkkkkkGGGGkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkGGGGkkkkkkkkkkkkkkk",
]);

function buildTowerBody(): string[] {
  const rows: string[] = [];
  const bodyTop = PAD_TOP + 44;
  const bodyBottom = PAD_TOP + 126;

  for (let y = bodyTop; y <= bodyBottom; y++) {
    const t = (y - bodyTop) / (bodyBottom - bodyTop);
    const halfW = Math.floor(28 - t * 14);
    const cx = 48;
    let row = "";
    for (let x = 0; x < W; x++) {
      if (x < cx - halfW || x > cx + halfW) {
        row += ".";
        continue;
      }
      const edge = x === cx - halfW || x === cx + halfW;
      const tier = Math.floor((y - bodyTop) / 12) % 4;
      const band = (y - bodyTop) % 12;

      if (band === 0 && x > cx - halfW + 1 && x < cx + halfW - 1) {
        row += "G";
      } else if (edge) {
        row += "K";
      } else if (x % 5 === 0 && tier === 1 && band > 4 && band < 9) {
        row += "s";
      } else if (x % 7 === 3 && tier === 2 && band > 5 && band < 8) {
        row += "l";
      } else {
        row += x % 3 === 0 ? "S" : "k";
      }
    }
    rows.push(row);
  }
  return rows;
}

function carveGate(rows: string[], gateTop: number, gateBottom: number, gateHalfW: number): void {
  const cx = 48;
  for (let y = gateTop; y <= gateBottom; y++) {
    const row = rows[y]?.split("") ?? [];
    const archT = (y - gateTop) / (gateBottom - gateTop);
    const archW = Math.floor(gateHalfW * (0.6 + 0.4 * Math.sin((archT * Math.PI) / 2)));
    for (let x = cx - archW; x <= cx + archW; x++) {
      if (x >= 0 && x < W) row[x] = ".";
    }
    rows[y] = row.join("");
  }
}

function buildTowerWithGate(): string[] {
  const bodyTop = PAD_TOP + 44;
  const body = buildTowerBody();
  carveGate(body, 118 - bodyTop, 128 - bodyTop, 6);
  return body;
}

// Eye on crown — large horizontal almond (~46×30 px) + vertical diamond pupil
const EYE_Y = PAD_TOP + 2;
const { socket: EYE_SOCKET, glow: EYE_GLOW, iris: EYE_IRIS, pupil: EYE_PUPIL } = buildEyeLayers();

const CROWN = centerRows([
  "..............kk..............kk..............",
  ".............kSSk............kSSk.............",
  "............kSSSkk..........kkSSSk............",
  "...........kSSSSSk........kSSSSSk...........",
  "..........kSSSSSSSk......kSSSSSSSk..........",
  ".........kSSSSSSSSSk....kSSSSSSSSSk.........",
  "........kSSSSSSSSSSSk..kSSSSSSSSSSSk........",
  "......kSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSk......",
  ".....kSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSk.....",
  "....kSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSk....",
  "....kSSSSSSSk..............kSSSSSSSk....",
  "...kSSSSSk....................kSSSSSk...",
  "..kSSSSk........................kSSSSk..",
  ".kSSSk............................kSSSk.",
  "kSSk................................kSSk",
  "kk..................................kk",
]);

const FIRE_FRAMES = [
  centerRows([
    "....ff....",
    "...fFFf...",
    "..fOOOf..",
    ".fOOYOOf.",
    "fOOYYOOf",
    ".fOYYOOf.",
    "..fOOf..",
    "...ff...",
  ]),
  centerRows([
    "...ff....",
    "..fFFf...",
    ".fOOOOf..",
    "fOOYYOOf.",
    "fOYYYOOf",
    ".fOOYOOf.",
    "..fOOf...",
    "...ff....",
  ]),
  centerRows([
    "....ff...",
    "...fFFf..",
    "..fOYOOf.",
    ".fOYYOOf.",
    "fOOYYYOOf",
    "fOOYOOf.",
    ".fOOf...",
    "..ff....",
  ]),
  centerRows([
    "...ff....",
    "..fFFf...",
    ".fOOOOf..",
    "fOOYOOOf.",
    "fOYYYOOf",
    ".fOOOOf..",
    "..fFFf...",
    "...ff....",
  ]),
];

const LAVA_FRAMES = [
  centerRows([
    "llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
    "oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo",
  ]),
  centerRows([
    "llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll",
    "OOOOOOOOOOOOOOOooooooooooooooooOOOOOOOOOOOOOOOooooooooooooooooOOOOOOOOOOOOOOOooooooooooooooo",
    "ooooooooooooooOOOoooooooooooooooOOOOooooooooooOOOoooooooooooooooOOOOooooooooooOOOooooooooooo",
  ]),
  centerRows([
    "llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll",
    "ooooooooooooooooOOOOOOOOOOOOOOOOooooooooooooooooOOOOOOOOOOOOOOOOooooooooooooooooOOOOOOOOOOOO",
    "OOOOoooooooooooooooOOOOoooooooooooooooOOOOoooooooooooooooOOOOoooooooooooooooOOOOoooooooooo",
  ]),
  centerRows([
    "llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
    "oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo",
  ]),
];

function fireFrameSvg(
  frames: string[][],
  frameIndex: number,
  className: string,
  baseY: number,
): string {
  const animValues = Array.from({ length: 5 }, (_, i) => (i % 4 === frameIndex ? "1" : "0")).join(";");
  return `<g class="${className}" data-frame="${frameIndex}" opacity="${frameIndex === 0 ? 1 : 0}">
      ${layerToRectsAt(frames[frameIndex]!, baseY)}
      <animate attributeName="opacity" values="${animValues}" keyTimes="0;0.25;0.5;0.75;1" dur="1s" repeatCount="indefinite" calcMode="discrete"/>
    </g>`;
}

function buildStaticTowerGrid(): Grid {
  const canvas = emptyGrid();
  const bodyTop = PAD_TOP + 44;
  blit(canvas, GROUND, 0, H - GROUND.length);
  blit(canvas, buildTowerWithGate(), 0, bodyTop);
  blit(canvas, CROWN, 0, PAD_TOP);
  return canvas;
}

const staticGrid = buildStaticTowerGrid();
const staticRects = gridToRects(staticGrid);

const gateFireFrames = FIRE_FRAMES.map((_, i) =>
  fireFrameSvg(FIRE_FRAMES, i, "fire-gate", PAD_TOP + 112),
);
const lavaFireFrames = LAVA_FRAMES.map((_, i) =>
  fireFrameSvg(LAVA_FRAMES, i, "fire-lava", H - LAVA_FRAMES[0]!.length),
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="barad-dur" aria-hidden="true" shape-rendering="crispEdges" overflow="visible">
  <g class="tower-static">
    ${staticRects}
    <g class="eye-socket">
      ${layerToRectsAt(EYE_SOCKET, EYE_Y)}
    </g>
  </g>
  <g class="fire-anim">
    ${gateFireFrames.join("\n    ")}
    ${lavaFireFrames.join("\n    ")}
  </g>
  <g id="tower-eye" class="tower-eye">
    <g class="eye-track">
      <g class="eye-iris">
        <g class="eye-glow">
        ${layerToRectsAt(EYE_GLOW, EYE_Y)}
        </g>
        <g class="eye-core">
        ${layerToRectsAt(EYE_IRIS, EYE_Y)}
        </g>
      </g>
      <g class="eye-slit">
        ${layerToRectsAt(EYE_PUPIL, EYE_Y)}
      </g>
    </g>
  </g>
</svg>
`;

const out = join(import.meta.dir, "..", "static", "blocked", "barad-dur.svg");
writeFileSync(out, svg);
console.log(`Wrote ${out} (${W}x${H})`);
