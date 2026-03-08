import { CANVAS_W, CANVAS_H } from './camera.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  draw(state, vehicle, terrain, entities, camera, gameData) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    this._drawSky(ctx, camera);
    this._drawParallax(ctx, camera);
    this._drawTerrain(ctx, terrain, camera);

    // Entities
    this._drawCoins(ctx, entities, camera);
    this._drawFuel(ctx, entities, camera);

    // Vehicle
    this._drawVehicle(ctx, vehicle, camera);
  }

  drawMenu(bestScore) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(1, '#e0f0ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Simple hills decoration
    this._drawMenuHills(ctx);

    // Title
    ctx.save();
    ctx.textAlign = 'center';

    ctx.font = 'bold 72px Courier New';
    ctx.fillStyle = '#2c6e2c';
    ctx.shadowColor = '#1a4a1a';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText('HILL DRIVE', CANVAS_W / 2, 180);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = 'bold 22px Courier New';
    ctx.fillStyle = '#4a8a4a';
    ctx.fillText('Demo v1.0', CANVAS_W / 2, 220);

    // Button
    const bx = CANVAS_W / 2 - 100;
    const by = 280;
    const bw = 200;
    const bh = 52;

    ctx.fillStyle = '#2c6e2c';
    ctx.beginPath();
    this._roundRect(ctx, bx, by, bw, bh, 8);
    ctx.fill();

    ctx.strokeStyle = '#5aaa5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this._roundRect(ctx, bx, by, bw, bh, 8);
    ctx.stroke();

    ctx.font = 'bold 26px Courier New';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SPIELEN', CANVAS_W / 2, by + 35);

    if (bestScore > 0) {
      ctx.font = 'bold 16px Courier New';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`BESTLEISTUNG: ${bestScore}`, CANVAS_W / 2, 380);
    }

    // Controls hint
    ctx.font = '13px Courier New';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('D / → Gas   |   A / ← Bremse', CANVAS_W / 2, 440);

    ctx.restore();
  }

  drawGameOver(reason, distance, coinCount, score, bestScore) {
    const ctx = this.ctx;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.save();
    ctx.textAlign = 'center';

    // Game Over title
    ctx.font = 'bold 64px Courier New';
    ctx.fillStyle = '#ff3333';
    ctx.shadowColor = '#aa0000';
    ctx.shadowBlur = 12;
    ctx.fillText('GAME OVER', CANVAS_W / 2, 160);

    ctx.shadowBlur = 0;

    // Reason
    ctx.font = 'bold 22px Courier New';
    ctx.fillStyle = '#ffaa44';
    ctx.fillText(reason, CANVAS_W / 2, 205);

    // Stats
    ctx.font = 'bold 18px Courier New';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`DISTANZ: ${distance.toFixed(1)}m`, CANVAS_W / 2, 255);
    ctx.fillText(`COINS: ${coinCount}`, CANVAS_W / 2, 285);
    ctx.fillText(`SCORE: ${score}`, CANVAS_W / 2, 315);

    if (bestScore > 0) {
      ctx.font = '15px Courier New';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`BESTLEISTUNG: ${bestScore}`, CANVAS_W / 2, 345);
    }

    // Restart button
    const bx = CANVAS_W / 2 - 110;
    const by = 375;
    const bw = 220;
    const bh = 52;

    ctx.fillStyle = '#991111';
    ctx.beginPath();
    this._roundRect(ctx, bx, by, bw, bh, 8);
    ctx.fill();

    ctx.strokeStyle = '#ff5555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this._roundRect(ctx, bx, by, bw, bh, 8);
    ctx.stroke();

    ctx.font = 'bold 22px Courier New';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('NEU STARTEN', CANVAS_W / 2, by + 34);

    ctx.restore();
  }

  _drawSky(ctx, camera) {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(1, '#e0f0ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  _drawParallax(ctx, camera) {
    // Layer 1: distant dark mountains (speed 0.15)
    const off1 = -(camera.x * 0.15) % CANVAS_W;
    ctx.fillStyle = '#2d5a3d';
    ctx.beginPath();
    const mts = [
      [0, 420], [80, 270], [200, 310], [320, 240], [440, 290], [560, 250], [680, 280], [800, 420]
    ];
    this._drawLayerOnce(ctx, mts, off1);
    this._drawLayerOnce(ctx, mts, off1 + CANVAS_W);
    this._drawLayerOnce(ctx, mts, off1 - CANVAS_W);

    // Layer 2: closer lighter hills (speed 0.4)
    const off2 = -(camera.x * 0.4) % CANVAS_W;
    ctx.fillStyle = '#4a8a5a';
    const hills = [
      [0, 480], [100, 370], [250, 390], [400, 360], [550, 385], [700, 365], [800, 480]
    ];
    this._drawLayerOnce(ctx, hills, off2);
    this._drawLayerOnce(ctx, hills, off2 + CANVAS_W);
    this._drawLayerOnce(ctx, hills, off2 - CANVAS_W);
  }

  _drawLayerOnce(ctx, pts, offsetX) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + offsetX, pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0] + offsetX, pts[i][1]);
    }
    ctx.lineTo(pts[pts.length - 1][0] + offsetX, CANVAS_H);
    ctx.lineTo(pts[0][0] + offsetX, CANVAS_H);
    ctx.closePath();
    ctx.fill();
  }

  _drawTerrain(ctx, terrain, camera) {
    const x0 = camera.x;
    const x1 = camera.x + CANVAS_W;
    const pts = terrain.getPoints(x0, x1);
    if (pts.length < 2) return;

    ctx.beginPath();
    const first = camera.toScreen(pts[0].x, pts[0].y);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < pts.length; i++) {
      const s = camera.toScreen(pts[i].x, pts[i].y);
      ctx.lineTo(s.x, s.y);
    }

    // Close down to bottom
    ctx.lineTo(camera.toScreen(pts[pts.length - 1].x, CANVAS_H + 100).x, CANVAS_H + 100);
    ctx.lineTo(camera.toScreen(pts[0].x, CANVAS_H + 100).x, CANVAS_H + 100);
    ctx.closePath();

    // Grass fill
    ctx.fillStyle = '#5a8a3a';
    ctx.fill();

    // Grass edge
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < pts.length; i++) {
      const s = camera.toScreen(pts[i].x, pts[i].y);
      ctx.lineTo(s.x, s.y);
    }
    ctx.strokeStyle = '#3d6b2a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dirt layer (darker stripe below surface)
    ctx.beginPath();
    ctx.moveTo(first.x, first.y + 8);
    for (let i = 1; i < pts.length; i++) {
      const s = camera.toScreen(pts[i].x, pts[i].y + 8);
      ctx.lineTo(s.x, s.y);
    }
    ctx.strokeStyle = '#4a6a28';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  _drawCoins(ctx, entities, camera) {
    const x0 = camera.x;
    const x1 = camera.x + CANVAS_W;
    const coins = entities.getVisibleCoins(x0 - 60, x1 + 60);

    for (const coin of coins) {
      const s = camera.toScreen(coin.x, coin.y);

      ctx.save();
      ctx.translate(s.x, s.y);

      // Glow
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#cc9900';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.font = 'bold 10px Courier New';
      ctx.fillStyle = '#cc6600';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('C', 0, 0);

      ctx.restore();
    }
  }

  _drawFuel(ctx, entities, camera) {
    const x0 = camera.x;
    const x1 = camera.x + CANVAS_W;
    const canisters = entities.getVisibleFuel(x0 - 60, x1 + 60);

    for (const f of canisters) {
      const s = camera.toScreen(f.x, f.y);

      ctx.save();
      ctx.translate(s.x, s.y);

      // Canister body
      ctx.fillStyle = '#e06010';
      ctx.fillRect(-10, -17, 20, 34);

      ctx.strokeStyle = '#aa4400';
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -17, 20, 34);

      // Cap
      ctx.fillStyle = '#cc4400';
      ctx.fillRect(-4, -21, 8, 6);

      // Label
      ctx.font = 'bold 11px Courier New';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('F', 0, 2);

      ctx.restore();
    }
  }

  _drawVehicle(ctx, vehicle, camera) {
    const body = vehicle.body;
    const s = camera.toScreen(body.x, body.y);

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(body.angle);

    // Main body
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    this._roundRect(ctx, -55, -20, 110, 38, 6);
    ctx.fill();

    // Cabin
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    this._roundRect(ctx, -25, -38, 60, 22, 5);
    ctx.fill();

    // Windshield
    ctx.fillStyle = 'rgba(150, 220, 255, 0.6)';
    ctx.beginPath();
    this._roundRect(ctx, -20, -36, 25, 18, 3);
    ctx.fill();

    // Headlight
    ctx.fillStyle = '#ffff88';
    ctx.shadowColor = '#ffff44';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(52, -8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Exhaust pipe
    ctx.fillStyle = '#333';
    ctx.fillRect(-56, -5, 8, 5);

    ctx.restore();

    // Wheels (drawn separately in world-rotated context)
    for (const wheel of vehicle.wheels) {
      const ww = vehicle.getWheelWorld(wheel);
      const ws = camera.toScreen(ww.wx, ww.wy);

      ctx.save();
      ctx.translate(ws.x, ws.y);
      ctx.rotate(body.angle + wheel.spin);

      // Tire
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#222';
      ctx.fill();
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Hub
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#aaa';
      ctx.fill();

      // Spokes
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  _drawMenuHills(ctx) {
    ctx.fillStyle = '#4a8a5a';
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H);
    ctx.bezierCurveTo(100, 380, 200, 360, 300, 390);
    ctx.bezierCurveTo(400, 420, 500, 340, 600, 380);
    ctx.bezierCurveTo(700, 420, 750, 400, 800, 380);
    ctx.lineTo(800, CANVAS_H);
    ctx.closePath();
    ctx.fill();
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
}
