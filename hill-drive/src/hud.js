import { CANVAS_W } from './camera.js';

export class HUD {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this._blinkTimer = 0;
    this._blinkOn = true;
  }

  update(dt) {
    this._blinkTimer += dt;
    if (this._blinkTimer > 0.4) {
      this._blinkTimer = 0;
      this._blinkOn = !this._blinkOn;
    }
  }

  draw(distance, coinCount, score, fuel) {
    const ctx = this.ctx;

    const textShadow = (text, x, y) => {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillText(text, x + 1, y + 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, x, y);
    };

    ctx.save();
    ctx.font = 'bold 14px Courier New';
    ctx.textBaseline = 'top';

    // Top-left: Distance and Coins
    ctx.textAlign = 'left';
    textShadow(`DIST: ${distance.toFixed(1)}m`, 10, 10);
    textShadow(`COINS: ${coinCount}`, 10, 30);

    // Top-center: Score
    ctx.textAlign = 'center';
    textShadow(`SCORE: ${String(score).padStart(5, '0')}`, CANVAS_W / 2, 10);

    // Top-right: Fuel bar
    const barW = 150;
    const barH = 14;
    const barX = CANVAS_W - barW - 10;
    const barY = 10;
    const fillW = Math.max(0, (fuel / 100) * barW);

    // Bar background
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    // Bar fill color
    let barColor;
    if (fuel > 60) {
      barColor = '#44ff44';
    } else if (fuel > 30) {
      barColor = '#ffaa00';
    } else {
      barColor = (fuel < 30 && !this._blinkOn) ? '#880000' : '#ff3333';
    }

    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, fillW, barH);

    // Bar border
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Fuel label
    ctx.textAlign = 'right';
    textShadow('FUEL', CANVAS_W - barW - 15, 10);

    ctx.restore();
  }
}
