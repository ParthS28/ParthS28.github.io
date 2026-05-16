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

// ─── Canvas art helpers ──────────────────────────────────────────────────────
function star(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function glowCircle(ctx, cx, cy, r, color, alpha = 0.35) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawNeonLine(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawPlayfieldArt(ctx, W, H, launchCharge, targets) {
  const {
    bumpers, wormholeBumper,
    leftFlagTarget, rightFlagTarget,
    leftSavePost, rightSavePost,
    leftLanePost, rightLanePost,
  } = targets;

  ctx.save();
  ctx.globalCompositeOperation = "destination-over";

  // Deep-space background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,    "#00001a");
  bg.addColorStop(0.35, "#0a0030");
  bg.addColorStop(0.7,  "#001540");
  bg.addColorStop(1,    "#000a20");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Starfield
  const stars = [
    [30,40,1.2,"#fff"],[55,90,0.8,"#adf"],[80,30,1,"#ffd"],
    [130,55,0.9,"#fff"],[170,22,1.1,"#cff"],[210,70,0.7,"#fff"],
    [250,38,1,"#ffd"],[290,80,0.8,"#adf"],[320,20,1.2,"#fff"],
    [60,200,0.8,"#fff"],[100,160,0.7,"#cff"],[150,210,1,"#fff"],
    [200,180,0.9,"#ffd"],[240,130,0.8,"#fff"],[280,200,1.1,"#adf"],
    [40,350,0.7,"#fff"],[90,300,1,"#cff"],[190,340,0.8,"#fff"],
    [240,310,0.9,"#ffd"],[290,360,0.7,"#fff"],
    [50,460,1,"#fff"],[100,500,0.8,"#adf"],[150,450,0.7,"#cff"],
    [200,490,1.1,"#fff"],[260,460,0.8,"#ffd"],
  ];
  stars.forEach(([x, y, r, c]) => star(ctx, x, y, r, c));

  // Playfield polygon
  ctx.beginPath();
  [
    [50, 30],[330, 30],[355, 110],[362, 260],
    [345, 510],[298, 578],[102, 578],[55, 510],[38, 260],[50, 110],
  ].forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.closePath();

  const field = ctx.createLinearGradient(0, 30, 0, 578);
  field.addColorStop(0,    "#0a0040");
  field.addColorStop(0.3,  "#001060");
  field.addColorStop(0.6,  "#001850");
  field.addColorStop(1,    "#000c30");
  ctx.fillStyle = field;
  ctx.fill();

  // Outer border glow
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#0050ff";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#0050ff";
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(100,180,255,0.5)";
  ctx.stroke();

  ctx.globalCompositeOperation = "source-over";

  // Planet / wormhole glow
  glowCircle(ctx, wormholeBumper.position.x, wormholeBumper.position.y, 60, "#8800ff", 0.25);
  glowCircle(ctx, wormholeBumper.position.x, wormholeBumper.position.y, 30, "#cc00ff", 0.4);

  // Bumper glows
  const bumperColors = ["#ffcc00","#00ffcc","#ff4488","#00aaff"];
  bumpers.forEach((b, i) => glowCircle(ctx, b.position.x, b.position.y, 34, bumperColors[i % 4], 0.3));

  // Flag target indicators
  [leftFlagTarget, rightFlagTarget].forEach((t, i) => {
    const col = i === 0 ? "#00ffaa" : "#ff6600";
    glowCircle(ctx, t.position.x, t.position.y, 22, col, 0.35);
    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = col;
    ctx.strokeRect(t.position.x - 10, t.position.y - 8, 20, 16);
    ctx.restore();
  });

  // Save post pips
  [leftSavePost, rightSavePost].forEach(p => {
    glowCircle(ctx, p.position.x, p.position.y, 18, "#ff0088", 0.4);
  });

  // Lane post pips
  [leftLanePost, rightLanePost].forEach(p => {
    glowCircle(ctx, p.position.x, p.position.y, 16, "#ffdd00", 0.35);
  });

  // Orbit arc decorations (top)
  ctx.save();
  ctx.strokeStyle = "rgba(0,200,255,0.25)";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(200, 30, 120, 0, Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Grid lines (Space Cadet vibe)
  ctx.save();
  ctx.strokeStyle = "rgba(0, 80, 200, 0.07)";
  ctx.lineWidth = 1;
  for (let y = 60; y < H; y += 40) drawNeonLine(ctx, 40, y, W - 40, y, "rgba(0,80,200,0.06)", 0.5);
  ctx.restore();

  // Neon inlay: vertical center stripe
  ctx.save();
  ctx.strokeStyle = "rgba(0,200,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2, 60); ctx.lineTo(W / 2, H - 80);
  ctx.stroke();
  ctx.restore();

  // Launch charge meter
  const meterH = 120;
  const meterX = W - 22;
  const meterY = H - 170;
  ctx.save();
  ctx.strokeStyle = "rgba(255,180,0,0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(meterX, meterY, 10, meterH);
  const fillH = meterH * launchCharge;
  const grad = ctx.createLinearGradient(0, meterY + meterH - fillH, 0, meterY + meterH);
  grad.addColorStop(0, "#ffdd00");
  grad.addColorStop(1, "#ff6600");
  ctx.fillStyle = grad;
  ctx.fillRect(meterX + 1, meterY + meterH - fillH, 8, fillH);
  ctx.fillStyle = "rgba(200,220,255,0.7)";
  ctx.font = "9px monospace";
  ctx.fillText("PWR", meterX - 4, meterY + meterH + 14);
  ctx.restore();

  // "SPACE CADET" title insert
  ctx.save();
  ctx.fillStyle = "rgba(0,200,255,0.18)";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.fillText("SPACE  CADET", W / 2, H - 18);
  ctx.textAlign = "start";
  ctx.restore();

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
  const launchLaneWidth = 48;
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
    options: { width: W, height: H, wireframes: false, background: "#00001a" },
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
    W - launchLaneWidth - 14, H * 0.66, 10, H * 0.92,
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
  const launchTurn = Bodies.rectangle(W - 100, 178, 80, 12, {
    isStatic: true, angle: -0.44, label: "guide",
    render: { fillStyle: guideColor }
  });

  // ── Orbit guide: top-left diagonal (upper loop lane) ─────────────────────
  const upperLeftOrbit = Bodies.rectangle(W * 0.19, 96, 130, 12, {
    isStatic: true, angle: Math.PI / 4.4, label: "orbit",
    render: { fillStyle: "#1a5099" }
  });

  // ── Upper right orbit (mirror, redirects back from right wall) ────────────
  const upperRightOrbit = Bodies.rectangle(W * 0.68, 98, 110, 12, {
    isStatic: true, angle: -Math.PI / 4.2, label: "orbit",
    render: { fillStyle: "#1a5099" }
  });

  // ── Center top guide (roof of bumper cluster) ─────────────────────────────
  const upperCenterGuide = Bodies.rectangle(W * 0.46, 134, 108, 12, {
    isStatic: true, angle: -0.1, label: "guide",
    render: { fillStyle: guideColor }
  });
  // TODO — this is a bit too low and flat, causing some ball hang-ups in the upper zone. Maybe raise it up to 120 and increase the angle slightly?
  // ── Left-side ramp slope (funnels into bumper zone) ───────────────────────
  const leftMidSlope = Bodies.rectangle(W * 0.18, H * 0.44, 130, 14, {
    isStatic: true, angle: -Math.PI / 6.5, label: "guide",
    render: { fillStyle: guideColor }
  });

  // ── Right-side ramp slope (symmetric) ────────────────────────────────────
  const rightMidSlope = Bodies.rectangle(W * 0.68, H * 0.42, 110, 14, {
    isStatic: true, angle: Math.PI / 5.5, label: "guide",
    render: { fillStyle: guideColor }
  });

  // ── Center fan guide ──────────────────────────────────────────────────────
  const centerFan = Bodies.rectangle(W * 0.47, H * 0.33, 100, 12, {
    isStatic: true, angle: 0.2, label: "guide",
    render: { fillStyle: guideColor }
  });

  // Slingshots raised to H*0.70 and shortened — clear gap below them to flippers
  const leftSling = Bodies.rectangle(W * 0.20, H * 0.70, 72, 13, {
    isStatic: true, angle: -0.55, label: "sling",
    render: { fillStyle: slingColor }
  });
  const rightSling = Bodies.rectangle(W * 0.66, H * 0.70, 72, 13, {
    isStatic: true, angle: 0.55, label: "sling",
    render: { fillStyle: slingColor }
  });

  // ── Lower guides ──────────────────────────────────────────────────────────
  // lowerCenterGuide removed — was blocking the center path to flippers
  const lowerLeftGuide = Bodies.rectangle(W * 0.12, H - 26, 100, 18, {
    isStatic: true, angle: -0.52,
    render: { fillStyle: tableColor }
  });
  const lowerRightGuide = Bodies.rectangle(W * 0.76, H - 26, 100, 18, {
    isStatic: true, angle: 0.52,
    render: { fillStyle: tableColor }
  });

  // Inlane guides raised to H*0.80 with gentler angle — guides ball to flippers
  const leftInlaneGuide = Bodies.rectangle(W * 0.22, H * 0.80, 60, 11, {
    isStatic: true, angle: 0.72, label: "guide",
    render: { fillStyle: guideColor }
  });
  const rightInlaneGuide = Bodies.rectangle(W * 0.63, H * 0.80, 60, 11, {
    isStatic: true, angle: -0.72, label: "guide",
    render: { fillStyle: guideColor }
  });

  // leftLoopReturn removed — was blocking mid-left ball path

  // rightBumperDeflector removed — was cluttering mid-right zone

  // leftFunnelWall / rightFunnelWall removed — were choking flipper approach

  // ── Drain guide ───────────────────────────────────────────────────────────
  const drainGuide = Bodies.rectangle(W * 0.44, H - 6, 136, 10, {
    isStatic: true, render: { fillStyle: "#1a2c50" }
  });

  // Save posts raised slightly — H*0.82 gives a clear lane to the flippers
  const leftSavePost = Bodies.circle(W * 0.20, H * 0.82, 10, {
    isStatic: true, label: "savePost",
    render: { fillStyle: accentColor, strokeStyle: "#ffaacc", lineWidth: 2 }
  });
  const rightSavePost = Bodies.circle(W * 0.69, H * 0.82, 10, {
    isStatic: true, label: "savePost",
    render: { fillStyle: accentColor, strokeStyle: "#ffaacc", lineWidth: 2 }
  });

  // ── Lane posts ────────────────────────────────────────────────────────────
  // Lane posts moved up into the upper-mid zone — clear of flipper path
  const leftLanePost = Bodies.circle(W * 0.17, H * 0.42, 13, {
    isStatic: true, label: "lanePost", restitution: 1.15,
    render: { fillStyle: "#ffcc00", strokeStyle: "#fff8aa", lineWidth: 2 }
  });
  const rightLanePost = Bodies.circle(W * 0.74, H * 0.40, 13, {
    isStatic: true, label: "lanePost", restitution: 1.15,
    render: { fillStyle: "#ffcc00", strokeStyle: "#fff8aa", lineWidth: 2 }
  });

  // midLeftPost / midRightPost removed — were sitting in the drop zone

  // ── Bumpers: tight triangle cluster (upper zone) + one wide bumper ────────
  const bumpers = [
    // Top-left of cluster
    Bodies.circle(W * 0.27, 172, 20, {
      isStatic: true, label: "bumper", restitution: 1.22,
      render: { fillStyle: "#ffcc00", strokeStyle: "#fff5aa", lineWidth: 3 }
    }),
    // Top-right of cluster
    Bodies.circle(W * 0.50, 158, 18, {
      isStatic: true, label: "bumper", restitution: 1.22,
      render: { fillStyle: "#00ffcc", strokeStyle: "#aaffee", lineWidth: 3 }
    }),
    // Bottom of cluster
    Bodies.circle(W * 0.36, 240, 20, {
      isStatic: true, label: "bumper", restitution: 1.22,
      render: { fillStyle: "#ff4488", strokeStyle: "#ffbbdd", lineWidth: 3 }
    }),
    // NEW: fourth bumper, right-of-center (Space Cadet had 4 bumpers)
    Bodies.circle(W * 0.60, 218, 18, {
      isStatic: true, label: "bumper", restitution: 1.22,
      render: { fillStyle: "#44aaff", strokeStyle: "#aaddff", lineWidth: 3 }
    }),
  ];

  // ── NEW: Wormhole bumper (center-field, large, high-value) ───────────────
  const wormholeBumper = Bodies.circle(W * 0.46, H * 0.55, 24, {
    isStatic: true, label: "wormhole", restitution: 1.3,
    render: { fillStyle: "#6600cc", strokeStyle: "#dd88ff", lineWidth: 4 }
  });

  // ── NEW: Flag targets (small rectangular hit boxes, like Space Cadet) ─────
  const leftFlagTarget = Bodies.rectangle(W * 0.15, H * 0.35, 18, 34, {
    isStatic: true, label: "flagTarget",
    render: { fillStyle: "#00cc66", strokeStyle: "#aaffcc", lineWidth: 2 }
  });
  const rightFlagTarget = Bodies.rectangle(W * 0.76, H * 0.32, 18, 34, {
    isStatic: true, label: "flagTarget",
    render: { fillStyle: "#ff6600", strokeStyle: "#ffcc88", lineWidth: 2 }
  });

  // ── Flippers ──────────────────────────────────────────────────────────────
  const flipperLength = 82;
  const flipperWidth  = 14;
  const flipperY      = H - 58;

  const leftFlipper = Bodies.rectangle(W * 0.345, flipperY, flipperLength, flipperWidth, {
    density: 0.002, label: "flipper",
    render: { fillStyle: "#ee0055" }
  });
  const rightFlipper = Bodies.rectangle(W * 0.655, flipperY, flipperLength, flipperWidth, {
    density: 0.002, label: "flipper",
    render: { fillStyle: "#ee0055" }
  });

  const leftPivot = Constraint.create({
    pointA: { x: W * 0.27, y: flipperY },
    bodyB: leftFlipper,
    pointB: { x: -flipperLength / 2, y: 0 },
    stiffness: 1,
  });
  const rightPivot = Constraint.create({
    pointA: { x: W * 0.73, y: flipperY },
    bodyB: rightFlipper,
    pointB: { x: flipperLength / 2, y: 0 },
    stiffness: 1,
  });

  // ── Drain sensor ──────────────────────────────────────────────────────────
  const drainSensor = Bodies.rectangle(W / 2, H + 36, W, 40, {
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
    leftMidSlope, rightMidSlope, // centerFan,

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

  // ── Controls ──────────────────────────────────────────────────────────────
  let leftActive    = false;
  let rightActive   = false;
  let launchCharging = false;
  let launchCharge  = 0;
  let pendingLaunch = false;

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

      // Bumper kick
      if (labels.includes("bumper") && labels.includes("ball")) {
        const bumper = bodyA.label === "bumper" ? bodyA : bodyB;
        const dx = ball.position.x - bumper.position.x;
        const dy = ball.position.y - bumper.position.y;
        const len = Math.max(Math.hypot(dx, dy), 1);
        Body.applyForce(ball, ball.position, { x: (dx / len) * 0.032, y: (dy / len) * 0.032 });
      }

      // Wormhole kick (stronger, random-ish exit angle)
      if (labels.includes("wormhole") && labels.includes("ball")) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        Body.setVelocity(ball, {
          x: Math.cos(angle) * 12,
          y: Math.sin(angle) * 12,
        });
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
      bumpers,
      wormholeBumper,
      leftFlagTarget, rightFlagTarget,
      leftSavePost, rightSavePost,
      leftLanePost, rightLanePost,
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