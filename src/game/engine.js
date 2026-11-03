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

function drawFlipper(ctx, body, left) {
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
  ctx.fillRect(left ? 30 : -36, -5, 7, 2);
  ctx.fillStyle = "#b9c6c5";
  ctx.fillRect(left ? -43 : 35, -7, 12, 12);
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
    guides, launchLaneWall, effects } = scene;
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
  const { Engine, Render, Runner, Bodies, Body, Constraint, World, Events } = Matter;
  const { onScoreChange = () => {}, scoreConfig = PIECE_SCORES } = options;

  const engine = Engine.create();
  engine.gravity.y = 0.85;

  const W = 400, H = 600;
  const ballRadius = 10;
  const launchLaneWidth = 18;
  const playfieldShift = -14; // offset to center playfield accounting for launcher
  const launchX = W - launchLaneWidth / 2 - 8;
  const launchRestY = H - 80;

  const tableColor  = "#0a0a2e";
  const wallColor   = "#0d1b4b";
  const guideColor  = "#1a3a7a";
  const slingColor  = "#cc0055";
  const accentColor = "#ff4488";

  const render = Render.create({
    element: container,
    engine,
    options: { width: W, height: H, wireframes: false, showConstraints: false, background: "#171529" },
  });

  let score = 0;
  const emitScore = () => onScoreChange(score);
  const addScore  = (key) => { score += scoreConfig[key] ?? 0; emitScore(); };

  const ballStart = { x: launchX, y: launchRestY };
  const spawnBall = (ball) => {
    Body.setPosition(ball, ballStart);
    Body.setVelocity(ball, { x: 0, y: 0 });
    Body.setAngularVelocity(ball, 0);
    Body.setAngle(ball, 0);
  };

  // ── Ball ──────────────────────────────────────────────────────────────────
  const ball = Bodies.circle(ballStart.x, ballStart.y, ballRadius, {
    restitution: 0.9,
    friction: 0.001,
    frictionAir: 0.0012,
    label: "ball",
    render: { fillStyle: "#c0ffee" },
  });

  // ── Walls ─────────────────────────────────────────────────────────────────
  const leftWall  = Bodies.rectangle(-8, H / 2, 20, H,      { isStatic: true, render: { fillStyle: wallColor } });
  const rightWall = Bodies.rectangle(W + 8, H * 0.66, 20, H, { isStatic: true, render: { fillStyle: wallColor } });
  const ceiling   = Bodies.rectangle(W / 2, -8, W, 20,      { isStatic: true, render: { fillStyle: wallColor } });

  // ── Top-right curve (circles) ─────────────────────────────────────────────
  const topCurve = [
    [W - 8,  90, 14],[W - 11, 78, 14],[W - 16, 66, 15],[W - 24, 55, 15],
    [W - 34, 46, 16],[W - 46, 38, 17],[W - 60, 31, 18],[W - 76, 26, 19],
    [W - 94, 22, 20],[W - 113,19, 21],[W - 133,17, 22],
  ].map(([x, y, r]) => Bodies.circle(x, y, r, { isStatic: true, render: { fillStyle: tableColor } }));

  // ── Launch lane wall ──────────────────────────────────────────────────────
  const launchLaneWall = Bodies.rectangle(
    W - launchLaneWidth - 14 + playfieldShift, H * 0.66, 10, H * 0.92,
    { isStatic: true, render: { fillStyle: guideColor } }
  );

  // ── Plunger + stop ────────────────────────────────────────────────────────
  const launcherStop = Bodies.rectangle(launchX, H - 42, 34, 12, {
    isStatic: true, render: { fillStyle: "#ffaa00" }
  });
  const plunger = Bodies.rectangle(launchX, H - 16, 26, 52, {
    isStatic: true, isSensor: true, label: "plunger",
    render: { fillStyle: "#ff8800", opacity: 0.9 }
  });

  // ── Launch turn: redirects ball from chute into playfield ─────────────────
  const launchTurn = Bodies.rectangle(W - 100 + playfieldShift, 178, 80, 12, {
    isStatic: true, angle: -0.44, label: "guide",
    render: { fillStyle: guideColor }
  });

  // ── Orbit guide: top-left diagonal (upper loop lane) ─────────────────────
  const upperLeftOrbit = Bodies.rectangle(W * 0.19 + playfieldShift, 96, 130, 12, {
    isStatic: true, angle: Math.PI / 4.4, label: "orbit",
    render: { fillStyle: "#1a5099" }
  });

  // ── Upper right orbit (mirror, redirects back from right wall) ────────────
  const upperRightOrbit = Bodies.rectangle(W * 0.68 + playfieldShift, 98, 110, 12, {
    isStatic: true, angle: -Math.PI / 4.2, label: "orbit",
    render: { fillStyle: "#1a5099" }
  });

  // ── Center top guide (roof of bumper cluster) ─────────────────────────────
  const upperCenterGuide = Bodies.rectangle(W * 0.46 + playfieldShift, 134, 108, 12, {
    isStatic: true, angle: -0.1, label: "guide",
    render: { fillStyle: guideColor }
  });
  // TODO — this is a bit too low and flat, causing some ball hang-ups in the upper zone. Maybe raise it up to 120 and increase the angle slightly?
  // ── Left-side ramp slope (funnels into bumper zone) ───────────────────────
  const leftMidSlope = Bodies.rectangle(W * 0.18 + playfieldShift, H * 0.44, 130, 14, {
    isStatic: true, angle: -Math.PI / 6.5, label: "guide",
    render: { fillStyle: guideColor }
  });

  // ── Right-side ramp slope (symmetric) ────────────────────────────────────
  const rightMidSlope = Bodies.rectangle(W * 0.68 + playfieldShift, H * 0.42, 110, 14, {
    isStatic: true, angle: Math.PI / 5.5, label: "guide",
    render: { fillStyle: guideColor }
  });

  // ── Center fan guide ──────────────────────────────────────────────────────
  const centerFan = Bodies.rectangle(W * 0.47 + playfieldShift, H * 0.33, 100, 12, {
    isStatic: true, angle: 0.2, label: "guide",
    render: { fillStyle: guideColor }
  });

  // Slingshots raised to H*0.70 and shortened — clear gap below them to flippers
  const leftSling = Bodies.rectangle(W * 0.20 + playfieldShift, H * 0.70, 72, 13, {
    isStatic: true, angle: -0.55, label: "sling",
    render: { fillStyle: slingColor }
  });
  const rightSling = Bodies.rectangle(W * 0.66 + playfieldShift, H * 0.70, 72, 13, {
    isStatic: true, angle: 0.55, label: "sling",
    render: { fillStyle: slingColor }
  });

  // ── Lower guides ──────────────────────────────────────────────────────────
  // Positioned near drain to avoid flipper interference
  const lowerLeftGuide = Bodies.rectangle(W * 0.12 + playfieldShift, H - 10, 100, 18, {
    isStatic: true, angle: -0.52,
    render: { fillStyle: tableColor }
  });
  const lowerRightGuide = Bodies.rectangle(W * 0.76 + playfieldShift, H - 10, 100, 18, {
    isStatic: true, angle: 0.52,
    render: { fillStyle: tableColor }
  });

  // Inlane guides raised to H*0.80 with gentler angle — guides ball to flippers
  const leftInlaneGuide = Bodies.rectangle(W * 0.22 + playfieldShift, H * 0.80, 60, 11, {
    isStatic: true, angle: 0.72, label: "guide",
    render: { fillStyle: guideColor }
  });
  const rightInlaneGuide = Bodies.rectangle(W * 0.63 + playfieldShift, H * 0.80, 60, 11, {
    isStatic: true, angle: -0.72, label: "guide",
    render: { fillStyle: guideColor }
  });

  // leftLoopReturn removed — was blocking mid-left ball path

  // rightBumperDeflector removed — was cluttering mid-right zone

  // leftFunnelWall / rightFunnelWall removed — were choking flipper approach

  // ── Drain guide ───────────────────────────────────────────────────────────
  const drainGuide = Bodies.rectangle(W * 0.44 + playfieldShift, H - 6, 136, 10, {
    isStatic: true, render: { fillStyle: "#1a2c50" }
  });

  // Save posts raised slightly — H*0.82 gives a clear lane to the flippers
  const leftSavePost = Bodies.circle(W * 0.20 + playfieldShift, H * 0.82, 10, {
    isStatic: true, label: "savePost",
    render: { fillStyle: accentColor, strokeStyle: "#ffaacc", lineWidth: 2 }
  });
  const rightSavePost = Bodies.circle(W * 0.69 + playfieldShift, H * 0.82, 10, {
    isStatic: true, label: "savePost",
    render: { fillStyle: accentColor, strokeStyle: "#ffaacc", lineWidth: 2 }
  });

  // ── Lane posts ────────────────────────────────────────────────────────────
  // Lane posts moved up into the upper-mid zone — clear of flipper path
  const leftLanePost = Bodies.circle(W * 0.17 + playfieldShift, H * 0.42, 13, {
    isStatic: true, label: "lanePost", restitution: 1.15,
    render: { fillStyle: "#ffcc00", strokeStyle: "#fff8aa", lineWidth: 2 }
  });
  const rightLanePost = Bodies.circle(W * 0.74 + playfieldShift, H * 0.40, 13, {
    isStatic: true, label: "lanePost", restitution: 1.15,
    render: { fillStyle: "#ffcc00", strokeStyle: "#fff8aa", lineWidth: 2 }
  });

  // midLeftPost / midRightPost removed — were sitting in the drop zone

  // ── Bumpers: tight triangle cluster (upper zone) + one wide bumper ────────
  const bumpers = [
    // Top-left of cluster
    Bodies.circle(W * 0.27 + playfieldShift, 172, 20, {
      isStatic: true, label: "bumper", restitution: 1.22,
      render: { fillStyle: "#ffcc00", strokeStyle: "#fff5aa", lineWidth: 3 }
    }),
    // Top-right of cluster
    Bodies.circle(W * 0.50 + playfieldShift, 158, 18, {
      isStatic: true, label: "bumper", restitution: 1.22,
      render: { fillStyle: "#00ffcc", strokeStyle: "#aaffee", lineWidth: 3 }
    }),
    // Bottom of cluster
    Bodies.circle(W * 0.36 + playfieldShift, 240, 20, {
      isStatic: true, label: "bumper", restitution: 1.22,
      render: { fillStyle: "#ff4488", strokeStyle: "#ffbbdd", lineWidth: 3 }
    }),
    // NEW: fourth bumper, right-of-center
    Bodies.circle(W * 0.60, 218, 18, {
      isStatic: true, label: "bumper", restitution: 1.22,
      render: { fillStyle: "#44aaff", strokeStyle: "#aaddff", lineWidth: 3 }
    }),
  ];

  // ── NEW: Wormhole bumper (center-field, large, high-value) ───────────────
  const wormholeBumper = Bodies.circle(W * 0.46 + playfieldShift, H * 0.55, 24, {
    isStatic: true, label: "wormhole", restitution: 1.3,
    render: { fillStyle: "#6600cc", strokeStyle: "#dd88ff", lineWidth: 4 }
  });

  // ── NEW: Flag targets (small rectangular hit boxes, like Space Cadet) ─────
  const leftFlagTarget = Bodies.rectangle(W * 0.15 + playfieldShift, H * 0.35, 18, 34, {
    isStatic: true, label: "flagTarget",
    render: { fillStyle: "#00cc66", strokeStyle: "#aaffcc", lineWidth: 2 }
  });
  const rightFlagTarget = Bodies.rectangle(W * 0.76 + playfieldShift, H * 0.32, 18, 34, {
    isStatic: true, label: "flagTarget",
    render: { fillStyle: "#ff6600", strokeStyle: "#ffcc88", lineWidth: 2 }
  });

  // ── Flippers ──────────────────────────────────────────────────────────────
  const flipperLength = 82;
  const flipperWidth  = 14;
  const flipperY      = H - 58;
  const leftFlipper = Bodies.rectangle(W * 0.345 + playfieldShift, flipperY, flipperLength, flipperWidth, {
    density: 0.002, label: "flipper",
    chamfer: { radius: 6 },
    render: { fillStyle: "#ee0055" }
  });
  const rightFlipper = Bodies.rectangle(W * 0.655 + playfieldShift, flipperY, flipperLength, flipperWidth, {
    density: 0.002, label: "flipper",
    chamfer: { radius: 6 },
    render: { fillStyle: "#ee0055" }
  });

  const leftPivot = Constraint.create({
    pointA: { x: W * 0.27 + playfieldShift, y: flipperY },
    bodyB: leftFlipper,
    pointB: { x: -flipperLength / 2, y: 0 },
    stiffness: 1,
  });
  const rightPivot = Constraint.create({
    pointA: { x: W * 0.73 + playfieldShift, y: flipperY },
    bodyB: rightFlipper,
    pointB: { x: flipperLength / 2, y: 0 },
    stiffness: 1,
  });

  // ── Drain sensor ──────────────────────────────────────────────────────────
  const drainSensor = Bodies.rectangle(W / 2 + playfieldShift, H + 36, W, 40, {
    isStatic: true, isSensor: true, label: "drain",
    render: { visible: false }
  });

  // ── World assembly ────────────────────────────────────────────────────────
  World.add(engine.world, [
    ball,
    leftWall, rightWall, ceiling,
    ...topCurve,
    launchLaneWall, launcherStop, plunger,
    // launchTurn,
    upperLeftOrbit, upperRightOrbit, // upperCenterGuide,
    // leftMidSlope, rightMidSlope, // centerFan,

    leftSling, rightSling,
    leftLanePost, rightLanePost,
    leftSavePost, rightSavePost,
    lowerLeftGuide, lowerRightGuide,
    // leftInlaneGuide, rightInlaneGuide, // above flippers
    wormholeBumper,
    leftFlagTarget, rightFlagTarget,
    drainGuide,
    leftFlipper, rightFlipper,
    leftPivot, rightPivot,
    drainSensor,
    ...bumpers,
  ]);
  // Keep Matter's collision geometry while drawing the art on the custom layer.
  Matter.Composite.allBodies(engine.world).forEach((body) => { body.render.visible = false; });

  // ── Controls ──────────────────────────────────────────────────────────────
  let leftActive    = false;
  let rightActive   = false;
  let launchCharging = false;
  let launchCharge  = 0;
  let pendingLaunch = false;
  const effects = { particles: [], launchUntil: 0, launchAt: 0, targetUntil: 0 };

  const scoreableLabels = new Set(Object.keys(scoreConfig));

  const ballIsInLaunchLane = () =>
    ball.position.x > W - launchLaneWidth - 22 && ball.position.y > H * 0.55;

  const resetBall = ({ resetScore = false } = {}) => {
    if (resetScore) { score = 0; emitScore(); }
    launchCharge = 0;
    launchCharging = false;
    pendingLaunch = false;
    leftActive = false;
    rightActive = false;
    Body.setAngularVelocity(leftFlipper, 0);
    Body.setAngularVelocity(rightFlipper, 0);
    Body.setAngle(leftFlipper, -0.3);
    Body.setAngle(rightFlipper, 0.3);
    spawnBall(ball);
  };

  const handleKeyDown = (e) => {
    if (e.code === "ArrowLeft")  { e.preventDefault(); leftActive = true; }
    if (e.code === "ArrowRight") { e.preventDefault(); rightActive = true; }
    if (e.code === "Space") {
      e.preventDefault();
      if (ballIsInLaunchLane()) launchCharging = true;
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === "ArrowLeft")  { e.preventDefault(); leftActive = false; }
    if (e.code === "ArrowRight") { e.preventDefault(); rightActive = false; }
    if (e.code === "Space") {
      e.preventDefault();
      if (launchCharging && ballIsInLaunchLane()) pendingLaunch = true;
      launchCharging = false;
    }
    if (e.code === "KeyR") { e.preventDefault(); resetBall({ resetScore: true }); }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  Body.setAngle(leftFlipper,  -0.3);
  Body.setAngle(rightFlipper,  0.3);

  // ── Collision events ──────────────────────────────────────────────────────
  Events.on(engine, "collisionStart", ({ pairs }) => {
    pairs.forEach(({ bodyA, bodyB }) => {
      const labels = [bodyA.label, bodyB.label];

      if (labels.includes("drain") && labels.includes("ball")) {
        resetBall();
        return;
      }

      const scoringBody = bodyA.label === "ball" ? bodyB
                        : bodyB.label === "ball" ? bodyA : null;
      if (scoringBody && scoreableLabels.has(scoringBody.label)) {
        addScore(scoringBody.label);
      }

      if (scoringBody?.label === "flagTarget") effects.targetUntil = performance.now() + 180;

      // Bumper kick
      if (labels.includes("bumper") && labels.includes("ball")) {
        const bumper = bodyA.label === "bumper" ? bodyA : bodyB;
        const dx = ball.position.x - bumper.position.x;
        const dy = ball.position.y - bumper.position.y;
        const len = Math.max(Math.hypot(dx, dy), 1);
        Body.applyForce(ball, ball.position, { x: (dx / len) * 0.032, y: (dy / len) * 0.032 });
        const colors = ["#f3d27c", "#b8d8d2", "#d88c75"];
        for (let i = 0; i < 7; i++) {
          const angle = (Math.PI * 2 * i) / 7;
          effects.particles.push({ x: bumper.position.x, y: bumper.position.y,
            vx: Math.cos(angle) * 1.6, vy: Math.sin(angle) * 1.6,
            color: colors[i % colors.length], born: performance.now() });
        }
      }

      // Wormhole kick (stronger, random-ish exit angle)
      if (labels.includes("wormhole") && labels.includes("ball")) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        Body.setVelocity(ball, {
          x: Math.cos(angle) * 12,
          y: Math.sin(angle) * 12,
        });
        effects.launchAt = performance.now(); effects.launchUntil = effects.launchAt + 200;
      }

      // Sling kick
      if (labels.includes("sling") && labels.includes("ball")) {
        const sling = bodyA.label === "sling" ? bodyA : bodyB;
        const dx = ball.position.x - sling.position.x;
        const dy = ball.position.y - sling.position.y;
        const len = Math.max(Math.hypot(dx, dy), 1);
        Body.applyForce(ball, ball.position, { x: (dx / len) * 0.025, y: (dy / len) * 0.025 });
      }
    });
  });

  emitScore();

  // ── Per-frame update ──────────────────────────────────────────────────────
  Events.on(engine, "beforeUpdate", () => {
    for (let i = effects.particles.length - 1; i >= 0; i--) {
      if (performance.now() - effects.particles[i].born > 360) effects.particles.splice(i, 1);
    }
    // Charge / decay
    if (launchCharging && ballIsInLaunchLane()) {
      launchCharge = Math.min(1, launchCharge + 0.018);
    } else if (!launchCharging) {
      launchCharge = Math.max(0, launchCharge - 0.04);
    }

    Body.setPosition(plunger, { x: launchX, y: H - 16 + launchCharge * 28 });

    if (pendingLaunch && ballIsInLaunchLane()) {
      Body.setVelocity(ball, {
        x: -3.0 - launchCharge * 3.2,
        y: -10  - launchCharge * 14,
      });
      pendingLaunch = false;
      launchCharge  = 0;
      effects.launchAt = performance.now(); effects.launchUntil = effects.launchAt + 220;
    }

    // Left flipper
    if (leftActive) {
      if (leftFlipper.angle > -0.82) Body.setAngularVelocity(leftFlipper, -0.42);
      else Body.setAngularVelocity(leftFlipper, 0);
    } else {
      if (leftFlipper.angle < -0.2) Body.setAngularVelocity(leftFlipper, 0.22);
      else { Body.setAngularVelocity(leftFlipper, 0); Body.setAngle(leftFlipper, -0.2); }
    }

    // Right flipper
    if (rightActive) {
      if (rightFlipper.angle < 0.82) Body.setAngularVelocity(rightFlipper, 0.42);
      else Body.setAngularVelocity(rightFlipper, 0);
    } else {
      if (rightFlipper.angle > 0.2) Body.setAngularVelocity(rightFlipper, -0.22);
      else { Body.setAngularVelocity(rightFlipper, 0); Body.setAngle(rightFlipper, 0.2); }
    }
  });

  // ── Render hook: canvas art ───────────────────────────────────────────────
  Events.on(render, "afterRender", () => {
    drawPlayfieldArt(render.context, W, H, launchCharge, {
      ball, bumpers, wormholeBumper, leftFlagTarget, rightFlagTarget,
      leftSavePost, rightSavePost, leftLanePost, rightLanePost,
      leftSling, rightSling, leftFlipper, rightFlipper, plunger, launcherStop,
      launchLaneWall,
      guides: [upperLeftOrbit, upperRightOrbit, lowerLeftGuide, lowerRightGuide, drainGuide, launchLaneWall],
      effects,
    });
  });

  Render.run(render);
  const runner = Runner.create();
  Runner.run(runner, engine);

  return {
    engine, render, runner,
    getScore() { return score; },
    restart()  { resetBall({ resetScore: true }); },
    destroy()  {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup",   handleKeyUp);
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    },
  };
}
