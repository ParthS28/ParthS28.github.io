import Matter from "matter-js";

// ─── Score table ────────────────────────────────────────────────────────────
export const PIECE_SCORES = {
  bumper:     150,
  sling:       60,
  orbit:       50,
  guide:       20,
  lanePost:   100,
  savePost:    40,
  flagTarget: 200,
  wormhole:   300,
};

// ─── Pixel sprite renderer ───────────────────────────────────────────────────
const spriteCache = new Map();
const ASSET = "/assets/game/";
function loadSprite(path) {
  if (!spriteCache.has(path)) {
    const image = new Image();
    image.src = `${ASSET}${path}`;
    spriteCache.set(path, image);
  }
  return spriteCache.get(path);
}

function drawSprite(ctx, image, x, y, width, height) {
  if (!image?.complete || !image.naturalWidth) return false;
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  ctx.drawImage(image, x - w / 2, y - h / 2, w, h);
  return true;
}

function drawRotatedSprite(ctx, image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  drawSprite(ctx, image, 0, 0, width, height);
  ctx.restore();
}

function drawSpriteSheet(ctx, image, frameWidth, frameHeight, frame, x, y, width, height) {
  if (!image?.complete || !image.naturalWidth) return false;
  const frames = Math.max(1, Math.floor(image.naturalWidth / frameWidth));
  const index = ((frame % frames) + frames) % frames;
  const scale = Math.min(width / frameWidth, height / frameHeight);
  const w = frameWidth * scale;
  const h = frameHeight * scale;
  ctx.drawImage(image, index * frameWidth, 0, frameWidth, frameHeight, x - w / 2, y - h / 2, w, h);
  return true;
}

function drawPost(ctx, body, radius, brass = false) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.fillStyle = "#33251d";
  ctx.beginPath(); ctx.arc(1, 2, radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = brass ? "#e8bd56" : "#c9d6d5";
  ctx.beginPath(); ctx.arc(0, 0, radius - 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff0b2";
  ctx.beginPath(); ctx.arc(-2, -2, Math.max(1, radius / 3), 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawFlipper(ctx, body) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.fillStyle = "#33251d";
  ctx.fillRect(-40, -5, 82, 12);
  ctx.fillStyle = "#cf3640";
  ctx.fillRect(-39, -7, 78, 10);
  ctx.fillStyle = "#f2b84b";
  ctx.fillRect(-34, -5, 66, 2);
  ctx.fillStyle = "#f7e7bd";
  ctx.fillRect(29, -5, 7, 2);
  ctx.fillStyle = "#b9c6c5";
  ctx.fillRect(-43, -7, 12, 12);
  ctx.restore();
}

function drawTarget(ctx, body, color, active) {
  const { x, y } = body.position;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle);
  ctx.fillStyle = "#39251b"; ctx.fillRect(-11, -18, 22, 36);
  ctx.fillStyle = color; ctx.fillRect(-9, -17, 18, 31);
  ctx.fillStyle = active ? "#fff1b1" : "#f4d986"; ctx.fillRect(-6, -13, 12, 22);
  ctx.fillStyle = color; ctx.fillRect(-4, -11, 8, 18);
  ctx.restore();
}

function drawPlayfieldArt(ctx, W, H, launchCharge, scene) {
  const { ball, bumpers, wormholeBumper, leftFlagTarget, rightFlagTarget,
    leftSavePost, rightSavePost, leftLanePost, rightLanePost,
    leftSling, rightSling, leftFlipper, rightFlipper, plunger, launcherStop,
    guides, effects } = scene;
  const now = performance.now();
  const field = loadSprite("playfields/playfield_cosmos_160x256.png");
  const ballImage = loadSprite("parts/ball_8x8.png");
  const bumperA = loadSprite("parts/cosmos/bumper_24x24_strip2.png");
  const bumperB = loadSprite("parts/jungle/bumper_24x24_strip2.png");
  const plungerImage = loadSprite("parts/plunger_5_10x40.png");
  const railImage = loadSprite("rails/rail_arc.png");
  const drainImage = loadSprite("fx/drain_ring_16x16_strip4.png");

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#171529";
  ctx.fillRect(0, 0, W, H);
  // Keep the illustration's 5:8 pixel-art aspect ratio on the 2:3 game canvas.
  drawSprite(ctx, field, W / 2, H / 2, 375, H);

  // Rails and guides use warm painted metal, with the sample rail tile at the top bends.
  ctx.strokeStyle = "#392b27"; ctx.lineWidth = 5; ctx.lineCap = "square";
  guides.forEach((body) => {
    ctx.save(); ctx.translate(body.position.x, body.position.y); ctx.rotate(body.angle);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const c = Math.cos(body.angle), s = Math.sin(body.angle);
    body.vertices.forEach((vertex) => {
      const dx = vertex.x - body.position.x, dy = vertex.y - body.position.y;
      const x = dx * c + dy * s, y = -dx * s + dy * c;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    });
    const width = maxX - minX, height = maxY - minY;
    ctx.fillStyle = "#392b27"; ctx.fillRect(-width / 2, -height / 2 - 2, width, height + 5);
    ctx.fillStyle = "#b5a38a"; ctx.fillRect(-width / 2, -height / 2 - 2, width, 2);
    ctx.restore();
  });
  drawRotatedSprite(ctx, railImage, 48, 42, 48, 48, 0);
  drawRotatedSprite(ctx, railImage, 352, 42, 48, 48, Math.PI / 2);

  // Bumpers: sample strips provide the actual illustrated bumper faces.
  bumpers.forEach((body, index) => {
    const image = index % 2 ? bumperB : bumperA;
    if (!drawSpriteSheet(ctx, image, 24, 24, Math.floor(now / 180) % 2, body.position.x, body.position.y, body.circleRadius * 2.5, body.circleRadius * 2.5)) {
      ctx.fillStyle = index % 2 ? "#57954d" : "#574b95";
      ctx.beginPath(); ctx.arc(body.position.x, body.position.y, body.circleRadius, 0, Math.PI * 2); ctx.fill();
    }
  });
  if (!drawSpriteSheet(ctx, bumperA, 24, 24, Math.floor(now / 180) % 2, wormholeBumper.position.x, wormholeBumper.position.y, 62, 62)) {
    ctx.fillStyle = "#574b95"; ctx.beginPath(); ctx.arc(wormholeBumper.position.x, wormholeBumper.position.y, 24, 0, Math.PI * 2); ctx.fill();
  }

  drawTarget(ctx, leftFlagTarget, "#d64b42", effects.targetUntil > now);
  drawTarget(ctx, rightFlagTarget, "#d3a541", effects.targetUntil > now);
  drawPost(ctx, leftLanePost, 8, true); drawPost(ctx, rightLanePost, 8, true);
  drawPost(ctx, leftSavePost, 7); drawPost(ctx, rightSavePost, 7);

  // Slings have brass rails and striped rubber faces.
  [leftSling, rightSling].forEach((body) => {
    ctx.save(); ctx.translate(body.position.x, body.position.y); ctx.rotate(body.angle);
    ctx.fillStyle = "#3b2b22"; ctx.fillRect(-38, -7, 76, 14);
    ctx.fillStyle = "#d7ad50"; ctx.fillRect(-36, -6, 72, 3);
    ctx.fillStyle = "#b83d42"; ctx.fillRect(-33, -2, 66, 6);
    ctx.fillStyle = "#f2d785";
    for (let x = -28; x <= 24; x += 13) ctx.fillRect(x, -2, 5, 6);
    ctx.restore();
  });

  drawFlipper(ctx, leftFlipper, true); drawFlipper(ctx, rightFlipper, false);
  ctx.fillStyle = "#b58c43"; ctx.fillRect(launcherStop.position.x - 16, launcherStop.position.y - 6, 32, 12);
  if (!drawSprite(ctx, plungerImage, plunger.position.x, plunger.position.y, 30, 120)) {
    ctx.fillStyle = "#929ca0"; ctx.fillRect(plunger.position.x - 4, plunger.position.y - 20, 8, 42);
  }
  if (launchCharge > 0) {
    ctx.fillStyle = "#f1c85a";
    ctx.fillRect(plunger.position.x - 2, plunger.position.y - 26, 4, 25 * launchCharge);
  }

  // Small launch burst and bumper particles are purely visual.
  effects.particles.forEach((p) => {
    const life = Math.max(0, 1 - (now - p.born) / 360);
    if (life <= 0) return;
    ctx.globalAlpha = life; ctx.fillStyle = p.color;
    ctx.fillRect(p.x + p.vx * (now - p.born) / 16, p.y + p.vy * (now - p.born) / 16, 2, 2);
  });
  if (effects.launchUntil > now) {
    drawSpriteSheet(ctx, drainImage, 16, 16, Math.floor((now - effects.launchAt) / 45) % 4, ball.position.x, ball.position.y, 48, 48);
  }
  if (!drawSprite(ctx, ballImage, ball.position.x, ball.position.y, 20, 20)) {
    ctx.fillStyle = "#e8e2d3"; ctx.beginPath(); ctx.arc(ball.position.x, ball.position.y, 10, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ─── Engine ──────────────────────────────────────────────────────────────────
export function createEngine(container, options = {}) {
  const { Engine, Render, Bodies, Body, World, Events } = Matter;
  const { onScoreChange = () => {}, scoreConfig = PIECE_SCORES, debug = false } = options;
  const W = 400, H = 600, ballRadius = 9;
  // Coordinates are centralized in logical 400×600 pixels.
  const FIELD = {
    left: 18, right: 382, divider: 350, launch: { x: 370, y: 520 },
    bumpers: [{ x: 142, y: 142, r: 18 }, { x: 208, y: 128, r: 18 }, { x: 175, y: 196, r: 19 }],
    sling: [{ x: 94, y: 370, angle: 0.55 }, { x: 276, y: 370, angle: -0.55 }],
    flippers: { y: 520, left: { x: 110, rest: 0.26, active: -0.52 }, right: { x: 290, rest: Math.PI - 0.26, active: Math.PI + 0.52 }, length: 84, width: 14 },
  };
  const PHYSICS = { gravity: 0.42, maxSpeed: 11, launchMaxSpeed: 32, launchBoostSteps: 45, restitution: 0.42, bumperRestitution: 0.72 };
  const engine = Engine.create({ enableSleeping: false });
  engine.gravity.x = 0; engine.gravity.y = PHYSICS.gravity; engine.gravity.scale = 0.001;
  engine.positionIterations = 8; engine.velocityIterations = 6;
  const render = Render.create({ element: container, engine, options: { width: W, height: H, wireframes: false, showConstraints: false, background: "#171529", pixelRatio: 1 } });
  let debugEnabled = Boolean(debug);
  let score = 0;
  const emitScore = () => onScoreChange(score);
  const addScore = (key) => { score += scoreConfig[key] ?? 0; emitScore(); };
  const ball = Bodies.circle(FIELD.launch.x, FIELD.launch.y, ballRadius, { density: 0.004, restitution: PHYSICS.restitution, friction: 0.02, frictionStatic: 0.04, frictionAir: 0.0025, label: "ball", render: { visible: false } });
  const wall = (x, y, width, height, angle = 0, label = "wall") => Bodies.rectangle(x, y, width, height, { isStatic: true, angle, label, restitution: 0.28, friction: 0.02, render: { visible: false } });
  const post = (x, y, r, label) => Bodies.circle(x, y, r, { isStatic: true, label, restitution: 0.45, render: { visible: false } });

  // Perimeter and shooter lane. The upper edge is formed from adjoining straight
  // rails for a continuous, predictable curve; the lower side rails leave the drain open.
  const walls = [
    wall(9, 300, 18, 600), 
    wall(391, 300, 18, 600), 
    wall(200, 5, 370, 14),
    wall(45, 27, 100, 12, -0.18), 
    wall(150, 18, 115, 12, -0.04), 
    wall(267, 21, 115, 12, 0.15), 
    wall(FIELD.divider, 310, 10, 470, 0, "guide"), 
    wall(63, 570, 98, 12, -0.22, "guide"), 
    wall(337, 570, 98, 12, 0.22, "guide"),
  ];
  const launchTurn = wall(310, 118, 58, 10, -0.62, "guide");
  const launcherStop = wall(FIELD.launch.x, 557, 34, 10);
  const plunger = Bodies.rectangle(FIELD.launch.x, 575, 10, 40, { isStatic: true, isSensor: true, label: "plunger", render: { visible: false } });
  const launchLaneWall = walls.find((body) => body.position.x === FIELD.divider);
  const bumpers = FIELD.bumpers.map(({ x, y, r }) => Bodies.circle(x, y, r, { isStatic: true, label: "bumper", restitution: PHYSICS.bumperRestitution, render: { visible: false } }));
  const wormholeBumper = Bodies.circle(208, 277, 18, { isStatic: true, label: "wormhole", restitution: 0.7, render: { visible: false } });
  const [leftSling, rightSling] = FIELD.sling.map(({ x, y, angle }) => Bodies.rectangle(x, y, 74, 12, { isStatic: true, angle, label: "sling", restitution: 0.42, render: { visible: false } }));
  const leftLanePost = post(78, 324, 9, "lanePost"), rightLanePost = post(292, 324, 9, "lanePost");
  const leftSavePost = post(90, 535, 8, "savePost"), rightSavePost = post(310, 535, 8, "savePost");
  const leftFlagTarget = wall(82, 245, 14, 32, 0, "flagTarget"), rightFlagTarget = wall(294, 245, 14, 32, 0, "flagTarget");
  const lowerLeftGuide = wall(52, 468, 66, 10, 0.65, "guide");
  const lowerRightGuide = wall(310, 468, 66, 10, -0.65, "guide");
  const leftInlaneGuide = wall(97, 510, 45, 9, -0.5, "guide"), rightInlaneGuide = wall(303, 510, 45, 9, 0.5, "guide");
  const drainSensor = Bodies.rectangle(200, 615, 130, 32, { isStatic: true, isSensor: true, label: "drain", render: { visible: false } });

  // Kinematic bodies are stepped about fixed pivots. Their artwork uses the same
  // body angle and center, so visual and collision geometry cannot diverge.
  const makeFlipper = (side) => {
    const spec = FIELD.flippers[side];
    const body = Bodies.rectangle(0, 0, FIELD.flippers.length, FIELD.flippers.width, { density: 0.006, friction: 0.02, frictionAir: 0.03, restitution: 0.12, chamfer: { radius: 6 }, label: "flipper", render: { visible: false } });
    body.plugin.flipper = { pivot: { x: spec.x, y: FIELD.flippers.y }, side, rest: spec.rest, active: spec.active, min: Math.min(spec.rest, spec.active), max: Math.max(spec.rest, spec.active) };
    return body;
  };
  const leftFlipper = makeFlipper("left"), rightFlipper = makeFlipper("right");
  const placeFlipper = (body, angle, updateVelocity = false) => {
    const f = body.plugin.flipper;
    Body.setAngle(body, angle, updateVelocity);
    Body.setPosition(body, {
      x: f.pivot.x + Math.cos(angle) * FIELD.flippers.length / 2,
      y: f.pivot.y + Math.sin(angle) * FIELD.flippers.length / 2,
    }, updateVelocity);
  };
  placeFlipper(leftFlipper, leftFlipper.plugin.flipper.rest); placeFlipper(rightFlipper, rightFlipper.plugin.flipper.rest);
  World.add(engine.world, [ball, ...walls, launchTurn, launcherStop, plunger, ...bumpers, wormholeBumper, leftSling, rightSling, leftLanePost, rightLanePost, leftSavePost, rightSavePost, leftFlagTarget, rightFlagTarget, lowerLeftGuide, lowerRightGuide, leftInlaneGuide, rightInlaneGuide, drainSensor, leftFlipper, rightFlipper]);

  const effects = { particles: [], launchUntil: 0, launchAt: 0, targetUntil: 0 };
  const guides = [launchTurn, launchLaneWall, lowerLeftGuide, lowerRightGuide, leftInlaneGuide, rightInlaneGuide];
  const scoreCooldowns = new Map();
  let leftActive = false, rightActive = false, launchCharging = false, launchCharge = 0, pendingLaunch = false, launched = false, launchBoostSteps = 0, launchTransferred = false;
  let destroyed = false, raf = 0, accumulator = 0, lastTime = 0;
  const ballIsInLaunchLane = () => !launched && ball.position.x > 355 && ball.position.y > 470;
  const resetBall = ({ resetScore = false } = {}) => {
    if (resetScore) { score = 0; emitScore(); }
    launchCharge = 0; launchCharging = false; pendingLaunch = false; leftActive = false; rightActive = false; launched = false; launchBoostSteps = 0; launchTransferred = false;
    Body.setPosition(ball, FIELD.launch); Body.setVelocity(ball, { x: 0, y: 0 }); Body.setAngularVelocity(ball, 0);
    ball.force.x = 0; ball.force.y = 0; ball.torque = 0;
    accumulator = 0; lastTime = 0; effects.particles.length = 0;
    placeFlipper(leftFlipper, leftFlipper.plugin.flipper.rest); placeFlipper(rightFlipper, rightFlipper.plugin.flipper.rest); scoreCooldowns.clear();
  };
  const clearInput = () => { leftActive = false; rightActive = false; launchCharging = false; };
  const handleKeyDown = (e) => {
    if (e.code === "ArrowLeft") { e.preventDefault(); leftActive = true; }
    if (e.code === "ArrowRight") { e.preventDefault(); rightActive = true; }
    if (e.code === "Space") { e.preventDefault(); if (ballIsInLaunchLane()) launchCharging = true; }
    if (e.code === "KeyR") { e.preventDefault(); resetBall({ resetScore: true }); }
  };
  const handleKeyUp = (e) => {
    if (e.code === "ArrowLeft") { e.preventDefault(); leftActive = false; }
    if (e.code === "ArrowRight") { e.preventDefault(); rightActive = false; }
    if (e.code === "Space") { e.preventDefault(); if (launchCharging && ballIsInLaunchLane()) pendingLaunch = true; launchCharging = false; }
  };
  window.addEventListener("keydown", handleKeyDown); window.addEventListener("keyup", handleKeyUp); window.addEventListener("blur", clearInput);
  const scoreable = new Set(Object.keys(scoreConfig));
  Events.on(engine, "collisionStart", ({ pairs }) => pairs.forEach(({ bodyA, bodyB }) => {
    const other = bodyA === ball ? bodyB : bodyB === ball ? bodyA : null;
    if (!other) return;
    if (other.label === "drain") { resetBall(); return; }
    const now = performance.now(), until = scoreCooldowns.get(other.id) || 0;
    if (scoreable.has(other.label) && now >= until) { addScore(other.label); scoreCooldowns.set(other.id, now + 240); }
    if (other.label === "flagTarget") effects.targetUntil = now + 180;
    if (other.label === "bumper" || other.label === "wormhole") {
      const dx = ball.position.x - other.position.x, dy = ball.position.y - other.position.y, len = Math.max(1, Math.hypot(dx, dy));
      const v = ball.velocity, toward = (v.x * dx + v.y * dy) / len;
      if (toward < 2.8) Body.setVelocity(ball, { x: v.x + dx / len * (2.8 - toward), y: v.y + dy / len * (2.8 - toward) });
      if (other.label === "bumper") {
        const colors = ["#f3d27c", "#b8d8d2", "#d88c75"];
        for (let i = 0; i < 6; i++) { const angle = Math.PI * 2 * i / 6; effects.particles.push({ x: other.position.x, y: other.position.y, vx: Math.cos(angle), vy: Math.sin(angle), color: colors[i % colors.length], born: now }); }
      }
    }
    if (other.label === "sling") Body.setVelocity(ball, { x: ball.velocity.x + (other === leftSling ? 1 : -1) * 1.2, y: Math.min(ball.velocity.y, -2.8) });
  }));
  emitScore();

  // Fixed 120 Hz physics, capped catch-up, and an independent render loop.
  const stepMs = 1000 / 120;
  Events.on(render, "afterRender", () => {
    drawPlayfieldArt(render.context, W, H, launchCharge, { ball, bumpers, wormholeBumper, leftFlagTarget, rightFlagTarget, leftSavePost, rightSavePost, leftLanePost, rightLanePost, leftSling, rightSling, leftFlipper, rightFlipper, plunger, launcherStop, launchLaneWall, guides, effects });
    if (debugEnabled) drawPhysicsDebug(render.context, engine, ball, FIELD, [leftFlipper, rightFlipper]);
  });
  const tick = (time) => {
    if (destroyed) return;
    if (!lastTime) lastTime = time;
    accumulator += Math.min(50, time - lastTime); lastTime = time;
    while (accumulator >= stepMs) {
      if (launchCharging && ballIsInLaunchLane()) launchCharge = Math.min(1, launchCharge + 0.0085);
      if (pendingLaunch && ballIsInLaunchLane()) {
        Body.setVelocity(ball, { x: 0, y: -(24 + launchCharge * 6) });
        launched = true; pendingLaunch = false; launchBoostSteps = PHYSICS.launchBoostSteps;
        launchCharge = 0; effects.launchAt = performance.now(); effects.launchUntil = effects.launchAt + 220;
      }
      const moveFlipper = (body, pressed) => {
        const f = body.plugin.flipper, target = pressed ? f.active : f.rest, delta = target - body.angle, step = pressed ? 0.06 : 0.075;
        const next = Math.abs(delta) <= step ? target : body.angle + Math.sign(delta) * step;
        placeFlipper(body, Math.max(f.min, Math.min(f.max, next)), true);
      };
      moveFlipper(leftFlipper, leftActive); moveFlipper(rightFlipper, rightActive);
      Body.setPosition(plunger, { x: FIELD.launch.x, y: 575 + launchCharge * 22 });
      Engine.update(engine, stepMs);
      if (launched && !launchTransferred && ball.position.y < 60) {
        Body.setVelocity(ball, { x: -8, y: ball.velocity.y });
        launchTransferred = true;
      }
      const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
      const maxSpeed = launchBoostSteps > 0 ? PHYSICS.launchMaxSpeed : PHYSICS.maxSpeed;
      if (speed > maxSpeed) Body.setVelocity(ball, { x: ball.velocity.x * maxSpeed / speed, y: ball.velocity.y * maxSpeed / speed });
      if (launchBoostSteps > 0) launchBoostSteps--;
      accumulator -= stepMs;
    }
    for (let i = effects.particles.length - 1; i >= 0; i--) if (performance.now() - effects.particles[i].born > 360) effects.particles.splice(i, 1);
    raf = requestAnimationFrame(tick);
  };
  Render.run(render); raf = requestAnimationFrame(tick);
  return {
    engine, render, runner: null,
    getScore() { return score; },
    restart() { resetBall({ resetScore: true }); },
    setDebug(value) { debugEnabled = Boolean(value); },
    destroy() {
      destroyed = true; cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); window.removeEventListener("blur", clearInput);
      Events.off(engine); Render.stop(render); World.clear(engine.world, false); Engine.clear(engine);
    },
  };
}

function drawPhysicsDebug(ctx, engine, ball, field, flippers) {
  ctx.save(); ctx.strokeStyle = "rgba(80,255,210,.75)"; ctx.fillStyle = "#fff"; ctx.lineWidth = 1;
  Matter.Composite.allBodies(engine.world).forEach((body) => {
    ctx.strokeStyle = body.isSensor ? "rgba(255,120,190,.9)" : "rgba(80,255,210,.75)";
    ctx.beginPath(); body.vertices.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(body.position.x, body.position.y, 2, 0, Math.PI * 2); ctx.fill();
    if (body.label !== "wall") ctx.fillText(body.label, body.position.x + 4, body.position.y - 4);
  });
  flippers.forEach((body) => {
    const f = body.plugin.flipper; ctx.beginPath(); ctx.arc(f.pivot.x, f.pivot.y, 4, 0, Math.PI * 2); ctx.stroke();
    [f.min, f.max].forEach((angle) => { ctx.beginPath(); ctx.moveTo(f.pivot.x, f.pivot.y); ctx.lineTo(f.pivot.x + Math.cos(angle) * field.flippers.length, f.pivot.y + Math.sin(angle) * field.flippers.length); ctx.stroke(); });
  });
  ctx.beginPath(); ctx.moveTo(ball.position.x, ball.position.y); ctx.lineTo(ball.position.x + ball.velocity.x * 5, ball.position.y + ball.velocity.y * 5); ctx.stroke();
  ctx.fillText(`v (${ball.velocity.x.toFixed(1)}, ${ball.velocity.y.toFixed(1)})`, ball.position.x + 10, ball.position.y - 12);
  ctx.strokeRect(field.divider - 5, 75, 10, 470);
  ctx.restore();
}
