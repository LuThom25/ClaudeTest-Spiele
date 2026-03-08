export class Entities {
  constructor() {
    this.coins = [];
    this.fuelCanisters = [];
    this._nextCoinX = 200;
    this._nextFuelX = 400;
  }

  spawnUpTo(maxX, terrain) {
    // Coins every 100-250px
    while (this._nextCoinX < maxX) {
      const x = this._nextCoinX;
      const y = terrain.getHeight(x) - (50 + Math.random() * 30);
      this.coins.push({ x, y, collected: false });
      this._nextCoinX += 100 + Math.random() * 150;
    }

    // Fuel canisters every 400-700px
    while (this._nextFuelX < maxX) {
      const x = this._nextFuelX;
      const y = terrain.getHeight(x) - 30;
      this.fuelCanisters.push({ x, y, collected: false });
      this._nextFuelX += 400 + Math.random() * 300;
    }
  }

  update(vehicle) {
    const bx = vehicle.body.x;
    const by = vehicle.body.y;

    let coinCollected = false;
    let fuelCollected = false;

    for (const coin of this.coins) {
      if (coin.collected) continue;
      const dx = bx - coin.x;
      const dy = by - coin.y;
      if (dx * dx + dy * dy < 45 * 45) {
        coin.collected = true;
        coinCollected = true;
      }
    }

    for (const fuel of this.fuelCanisters) {
      if (fuel.collected) continue;
      const dx = bx - fuel.x;
      const dy = by - fuel.y;
      if (dx * dx + dy * dy < 50 * 50) {
        fuel.collected = true;
        fuelCollected = true;
      }
    }

    return { coinCollected, fuelCollected };
  }

  getVisibleCoins(x0, x1) {
    return this.coins.filter(c => !c.collected && c.x >= x0 && c.x <= x1);
  }

  getVisibleFuel(x0, x1) {
    return this.fuelCanisters.filter(f => !f.collected && f.x >= x0 && f.x <= x1);
  }
}
