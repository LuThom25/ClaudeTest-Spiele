export const TERRAIN_STEP = 20;

export class Terrain {
  constructor() {
    this.points = [];
    this.maxGeneratedX = 0;
    this._generate(0, 4000);
  }

  _rng(min, max) {
    return min + Math.random() * (max - min);
  }

  _generate(fromX, toX) {
    const startIdx = this.points.length === 0 ? 0 : this.points.length;
    let startX = this.points.length === 0 ? 0 : this.points[this.points.length - 1].x + TERRAIN_STEP;
    let lastY = this.points.length === 0 ? 350 : this.points[this.points.length - 1].y;
    let slope = 0;

    for (let x = startX; x <= toX; x += TERRAIN_STEP) {
      // Flat start for first ~800px
      const progress = x / 800;
      const maxSlope = Math.min(0.6, progress * 0.6);

      slope += this._rng(-0.04, 0.04);
      slope = Math.max(-maxSlope, Math.min(maxSlope, slope));

      let y = lastY + slope * TERRAIN_STEP + Math.sin(x / 300) * 30 + Math.sin(x / 80) * 10;
      y = Math.max(150, Math.min(480, y));
      lastY = y;

      this.points.push({ x, y });
    }

    this.maxGeneratedX = toX;
  }

  extend(untilX) {
    if (untilX > this.maxGeneratedX - 1000) {
      this._generate(this.maxGeneratedX, this.maxGeneratedX + 2000);
    }
  }

  getHeight(worldX) {
    const idx = Math.floor(worldX / TERRAIN_STEP);
    const i0 = Math.max(0, Math.min(this.points.length - 2, idx));
    const i1 = i0 + 1;

    const p0 = this.points[i0];
    const p1 = this.points[i1];
    if (!p0 || !p1) return 400;

    const t = (worldX - p0.x) / (p1.x - p0.x);
    return p0.y + (p1.y - p0.y) * t;
  }

  getNormal(worldX) {
    const dx = TERRAIN_STEP;
    const y0 = this.getHeight(worldX - dx * 0.5);
    const y1 = this.getHeight(worldX + dx * 0.5);

    const tx = dx;
    const ty = y1 - y0;
    const len = Math.sqrt(tx * tx + ty * ty);

    // Normal is perpendicular to tangent, pointing upward
    return { nx: -ty / len, ny: tx / len };
  }

  getPoints(x0, x1) {
    return this.points.filter(p => p.x >= x0 - TERRAIN_STEP && p.x <= x1 + TERRAIN_STEP);
  }
}
