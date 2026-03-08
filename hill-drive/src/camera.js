export const CANVAS_W = 800;
export const CANVAS_H = 500;

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  update(vehicle, terrain) {
    const body = vehicle.body;

    const targetX = body.x - CANVAS_W * 0.35;
    const targetY = body.y - CANVAS_H * 0.55;

    this.x += (targetX - this.x) * 0.08;
    this.y += (targetY - this.y) * 0.06;

    // Don't scroll too far up (no empty sky)
    // Find terrain min-y in visible range
    const pts = terrain.getPoints(this.x, this.x + CANVAS_W);
    if (pts.length > 0) {
      const minTerrainY = Math.min(...pts.map(p => p.y));
      this.y = Math.min(this.y, minTerrainY - 80);
    }
  }

  toScreen(wx, wy) {
    return { x: wx - this.x, y: wy - this.y };
  }

  reset(vehicle) {
    const body = vehicle.body;
    this.x = body.x - CANVAS_W * 0.35;
    this.y = body.y - CANVAS_H * 0.55;
  }
}
