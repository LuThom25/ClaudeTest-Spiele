const SPRING_K    = 18000;
const SPRING_DAMP = 900;
const GRAVITY     = 1400;
const MAX_ANGVEL  = 5.0;
const AIR_DRAG    = 0.985;
const ENGINE_FORCE = 2800;
const MAX_SPEED   = 550;

export class Vehicle {
  constructor(x, y) {
    this.body = {
      x, y,
      vx: 0, vy: 0,
      angle: 0,
      angVel: 0,
      mass: 1.0,
      inertia: 0.4,
    };

    // Front wheel: +55, Rear wheel: -55
    this.wheels = [
      { offsetX: 55,  offsetY: 22, onGround: false, compression: 0, spin: 0 },
      { offsetX: -55, offsetY: 22, onGround: false, compression: 0, spin: 0 },
    ];

    this.flipTimer = 0;
    this.flipTimer2 = 0; // heavy tilt while grounded
    this.crashed = false;
    this.crashReason = '';
  }

  getWheelWorld(wheel) {
    const { x, y, angle } = this.body;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      wx: x + cos * wheel.offsetX - sin * wheel.offsetY,
      wy: y + sin * wheel.offsetX + cos * wheel.offsetY,
    };
  }

  update(dt, terrain, input) {
    const body = this.body;

    // Gravity
    body.vy += GRAVITY * dt;

    // Engine / Brake
    const rearWheel = this.wheels[1];
    const rearPos = this.getWheelWorld(rearWheel);
    const rearOnGround = rearWheel.onGround;

    if (input.right) {
      const fx = Math.cos(body.angle) * ENGINE_FORCE * dt;
      const fy = Math.sin(body.angle) * ENGINE_FORCE * dt;
      body.vx += fx / body.mass;
      body.vy += fy / body.mass;

      // Torque from rear wheel drive (pushes back of car into ground)
      if (rearOnGround) {
        const rx = rearPos.wx - body.x;
        const ry = rearPos.wy - body.y;
        const torque = -(rx * fy - ry * fx) * 0.15;
        body.angVel += (torque / body.inertia) * dt;
      }
    }

    if (input.left) {
      const fx = Math.cos(body.angle) * ENGINE_FORCE * 0.5 * dt;
      const fy = Math.sin(body.angle) * ENGINE_FORCE * 0.5 * dt;
      body.vx -= fx / body.mass;
      body.vy -= fy / body.mass;
    }

    // Spring-Damper for each wheel
    let anyOnGround = false;
    for (const wheel of this.wheels) {
      const { wx, wy } = this.getWheelWorld(wheel);
      const terrainY = terrain.getHeight(wx);
      const penetration = wy - terrainY;

      wheel.onGround = penetration > -2;

      if (penetration > 0) {
        anyOnGround = true;
        wheel.compression = penetration;

        const normal = terrain.getNormal(wx);
        const vRel = body.vx * normal.nx + body.vy * normal.ny;

        let F = SPRING_K * penetration - SPRING_DAMP * vRel;
        F = Math.max(0, F);

        body.vx += (F * normal.nx / body.mass) * dt;
        body.vy += (F * normal.ny / body.mass) * dt;

        // Torque
        const rx = wx - body.x;
        const ry = wy - body.y;
        const torque = rx * (F * normal.ny) - ry * (F * normal.nx);
        body.angVel += (torque / body.inertia) * dt;

        // Friction / roll resistance
        body.vx *= Math.pow(0.97, dt * 60);
      } else {
        wheel.compression = 0;
      }
    }

    // Air drag
    body.vx *= Math.pow(AIR_DRAG, dt * 60);

    // Speed clamp
    const speed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
    if (speed > MAX_SPEED) {
      body.vx *= MAX_SPEED / speed;
      body.vy *= MAX_SPEED / speed;
    }

    // Angular velocity limit & damping
    body.angVel = Math.max(-MAX_ANGVEL, Math.min(MAX_ANGVEL, body.angVel));
    body.angVel *= Math.pow(0.92, dt * 60);
    body.angle += body.angVel * dt;

    // Flip detection
    const absAngle = Math.abs(body.angle);
    if (absAngle > 1.2 && !anyOnGround) {
      this.flipTimer += dt;
      if (this.flipTimer > 1.8) {
        this.crashed = true;
        this.crashReason = 'Überschlagen!';
      }
    } else {
      this.flipTimer = Math.max(0, this.flipTimer - dt * 2);
    }

    // Heavy tilt while grounded (upside down on ground)
    if (absAngle > Math.PI * 0.65) {
      this.flipTimer2 += dt;
      if (this.flipTimer2 > 3.0) {
        this.crashed = true;
        this.crashReason = 'Überschlagen!';
      }
    } else {
      this.flipTimer2 = 0;
    }

    // Move body
    body.x += body.vx * dt;
    body.y += body.vy * dt;

    // Wheel spin animation
    for (const wheel of this.wheels) {
      wheel.spin += body.vx * dt * 0.04;
    }
  }
}
