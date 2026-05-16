import Matter from "matter-js";

export const PIECE_SCORES = {
  bumper: 125,
  sling: 60,
  orbit: 40,
  guide: 25,
  lanePost: 90,
  savePost: 35,
};

function drawRoundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawPlayfieldArt(context, width, height, launchCharge, targets) {
  const {
    bumpers,
    centerPost,
    leftLanePost,
    rightLanePost,
    leftSavePost,
    rightSavePost,
  } = targets;

  const playfield = [
    [72, 42],
    [308, 42],
    [338, 122],
    [352, 258],
    [338, 520],
    [290, 582],
    [110, 582],
    [62, 520],
    [48, 258],
    [62, 122],
  ];

  context.save();

  context.globalCompositeOperation = "destination-over";

  const bgGradient = context.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, "#000000");
  bgGradient.addColorStop(0.45, "#FFD700");
  bgGradient.addColorStop(1, "#007FFF");
  context.fillStyle = bgGradient;
  context.fillRect(0, 0, width, height);

  const cabinetGlow = context.createRadialGradient(
    width / 2,
    height * 0.78,
    20,
    width / 2,
    height * 0.78,
    250,
  );
  cabinetGlow.addColorStop(0, "rgba(255, 215, 0, 0.22)");
  cabinetGlow.addColorStop(0.4, "rgba(0, 127, 255, 0.12)");
  cabinetGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = cabinetGlow;
  context.fillRect(0, 0, width, height);

  context.beginPath();
  playfield.forEach(([x, y], index) => {
    if (index === 0) {
      context.moveTo(x, y);
      return;
    }
    context.lineTo(x, y);
  });
  context.closePath();

  const fieldGradient = context.createLinearGradient(0, 42, 0, 582);
  fieldGradient.addColorStop(0, "#FF0000");
  fieldGradient.addColorStop(0.4, "#FFD700");
  fieldGradient.addColorStop(0.72, "#007FFF");
  fieldGradient.addColorStop(1, "#C0C0C0");
  context.fillStyle = fieldGradient;
  context.fill();

  context.lineWidth = 10;
  context.strokeStyle = "#FF4500";
  context.stroke();

  context.lineWidth = 2;
  context.strokeStyle = "rgba(0, 0, 0, 0.28)";
  context.stroke();

  const starColors = ["#FFD700", "#007FFF", "#FF0000"];
  const stars = [
    [112, 88],
    [145, 128],
    [276, 112],
    [302, 156],
    [118, 212],
    [285, 226],
  ];
  stars.forEach(([x, y], index) => {
    context.fillStyle = starColors[index % starColors.length];
    context.beginPath();
    context.arc(x, y, 2.2, 0, Math.PI * 2);
    context.fill();
  });

  context.globalCompositeOperation = "source-over";

  const orbitStroke = (color, points, widthValue = 5) => {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = widthValue;
    context.shadowBlur = 16;
    context.shadowColor = color;
    context.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) {
        context.moveTo(x, y);
        return;
      }
      context.lineTo(x, y);
    });
    context.stroke();
    context.restore();
  };
  // TODO come back 
  // orbitStroke("rgba(116, 242, 255, 0.95)", [
  //   [94, 120],
  //   [118, 90],
  //   [170, 80],
  //   [216, 116],
  // ]);
  // orbitStroke("rgba(255, 144, 71, 0.88)", [
  //   [276, 86],
  //   [316, 118],
  //   [322, 182],
  //   [298, 242],
  // ]);
  // orbitStroke("rgba(248, 72, 184, 0.82)", [
  //   [100, 330],
  //   [128, 274],
  //   [176, 248],
  //   [230, 276],
  // ]);
  // orbitStroke("rgba(128, 255, 160, 0.82)", [
  //   [132, 438],
  //   [166, 390],
  //   [220, 368],
  //   [278, 410],
  // ]);

  const insert = (x, y, r, color) => {
    context.save();
    context.fillStyle = color;
    context.shadowBlur = 14;
    context.shadowColor = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };

  [
    [138, 158, 4, "#f7d154"],
    [176, 182, 4, "#74f2ff"],
    [232, 154, 4, "#ff78d6"],
    [284, 196, 4, "#f7d154"],
    [150, 304, 5, "#74f2ff"],
    [252, 324, 5, "#ff8e54"],
    [126, 468, 4, "#ff78d6"],
    [278, 474, 4, "#74f2ff"],
  ].forEach(([x, y, r, color]) => insert(x, y, r, color));

  const glowBumper = (body, color) => {
    context.save();
    context.fillStyle = color;
    context.globalAlpha = 0.22;
    context.shadowBlur = 28;
    context.shadowColor = color;
    context.beginPath();
    context.arc(body.position.x, body.position.y, 30, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };

  glowBumper(bumpers[0], "#ffd166");
  glowBumper(bumpers[1], "#6ef6ff");
  glowBumper(bumpers[2], "#ff66d8");
  glowBumper(centerPost, "#ff9f5a");
  glowBumper(leftLanePost, "#7cffc9");
  glowBumper(rightLanePost, "#7cffc9");

  const coreGlow = context.createRadialGradient(
    width / 2,
    height - 95,
    18,
    width / 2,
    height - 95,
    86,
  );
  // coreGlow.addColorStop(0, "rgba(88, 226, 255, 0.95)");
  // coreGlow.addColorStop(0.22, "rgba(88, 226, 255, 0.72)");
  // coreGlow.addColorStop(0.5, "rgba(135, 79, 255, 0.35)");
  // coreGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = coreGlow;
  context.beginPath();
  context.arc(width / 2, height - 95, 86, 0, Math.PI * 2);
  context.fill();

  context.save();
  context.strokeStyle = "rgba(112, 245, 255, 0.65)";
  context.lineWidth = 3;
  context.shadowBlur = 18;
  context.shadowColor = "#70f5ff";
  context.beginPath();
  context.moveTo(160, 548);
  context.lineTo(184, 500);
  context.lineTo(200, 540);
  context.lineTo(216, 492);
  context.lineTo(240, 548);
  context.stroke();
  context.restore();

  [leftSavePost, rightSavePost].forEach((post) => {
    context.save();
    context.fillStyle = "#ff4fd8";
    context.shadowBlur = 12;
    context.shadowColor = "#ff4fd8";
    context.beginPath();
    context.arc(post.position.x, post.position.y, 9, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });

  const chargeHeight = 132;
  const chargeTop = height - 184;
  const chargeLeft = width - 24;
  drawRoundedRect(context, chargeLeft, chargeTop, 10, chargeHeight, 5);
  context.fillStyle = "rgba(255, 255, 255, 0.12)";
  context.fill();
  // drawRoundedRect(
  //   context,
  //   chargeLeft,
  //   chargeTop + chargeHeight * (1 - launchCharge),
  //   10,
  //   Math.max(10, chargeHeight * launchCharge),
  //   5,
  // );
  context.fillStyle = "#ffb347";
  context.shadowBlur = 12;
  context.shadowColor = "#ffb347";
  context.fill();

  context.fillStyle = "rgba(222, 241, 255, 0.9)";
  context.font = "11px monospace";
  context.fillText("SPACE", width - 56, height - 28);

  context.restore();
}

export function createEngine(container, options = {}) {
  const { Engine, Render, Runner, Bodies, World, Body, Constraint, Events } =
    Matter;
  const { onScoreChange = () => {}, scoreConfig = PIECE_SCORES } = options;

  const engine = Engine.create();
  engine.gravity.y = 0.88;

  const gameWidth = 400;
  const gameHeight = 600;

  const render = Render.create({
    element: container,
    engine,
    options: {
      width: gameWidth,
      height: gameHeight,
      wireframes: false,
      background: "#070814",
    },
  });

  const width = gameWidth;
  const height = gameHeight;
  const ballRadius = 10;
  const launchLaneWidth = 52;
  const launchX = width - launchLaneWidth / 2 - 10;
  const launchRestY = height - 84;
  const maxLaunchCharge = 1;
  const tableColor = "#14213d";
  const guideColor = "#1f4068";
  const accentColor = "#ef476f";

  const ballStart = { x: launchX, y: launchRestY };
  let score = 0;
  const emitScore = () => onScoreChange(score);
  const addScore = (pieceKey) => {
    score += scoreConfig[pieceKey] ?? 0;
    emitScore();
  };

  const spawnBall = (ball) => {
    Body.setPosition(ball, ballStart);
    Body.setVelocity(ball, { x: 0, y: 0 });
    Body.setAngularVelocity(ball, 0);
    Body.setAngle(ball, 0);
  };

  // Ball
  const ball = Bodies.circle(ballStart.x, ballStart.y, ballRadius, {
    restitution: 0.92,
    friction: 0.001,
    frictionAir: 0.001,
    label: "ball",
    render: { fillStyle: "#00ffcc" },
  });

  // Flippers
  const flipperLength = 80;
  const flipperWidth = 15;
  const flipperY = height - 60;

  const leftFlipper = Bodies.rectangle(
    width * 0.35,
    flipperY,
    flipperLength,
    flipperWidth,
    {
      density: 0.002,
      render: { fillStyle: "#ff006e" },
    },
  );

  const rightFlipper = Bodies.rectangle(
    width * 0.65,
    flipperY,
    flipperLength,
    flipperWidth,
    {
      density: 0.002,
      render: { fillStyle: "#ff006e" },
    },
  );

  const leftPivot = Constraint.create({
    pointA: { x: width * 0.28, y: flipperY },
    bodyB: leftFlipper,
    pointB: { x: -flipperLength / 2, y: 0 },
    stiffness: 1,
  });

  const rightPivot = Constraint.create({
    pointA: { x: width * 0.72, y: flipperY },
    bodyB: rightFlipper,
    pointB: { x: flipperLength / 2, y: 0 },
    stiffness: 1,
  });

  const leftWall = Bodies.rectangle(0, height / 2, 20, height, {
    isStatic: true,
    render: { fillStyle: tableColor },
  });

  const rightWall = Bodies.rectangle(width, height * 0.68, 20, height, {
    isStatic: true,
    render: { fillStyle: tableColor },
  });

  const rightCurveWall = [
    [width - 9, 88, 15],
    [width - 12, 78, 15],
    [width - 17, 68, 16],
    [width - 24, 59, 16],
    [width - 33, 50, 17],
    [width - 44, 42, 17],
    [width - 57, 35, 18],
    [width - 72, 29, 19],
    [width - 89, 24, 20],
    [width - 107, 20, 21],
    [width - 126, 18, 22],
  ].map(([x, y, radius]) =>
    Bodies.circle(x, y, radius, {
      isStatic: true,
      render: { fillStyle: tableColor },
    }),
  );

  const ceiling = Bodies.rectangle(width / 2, 0, width, 20, {
    isStatic: true,
    render: { fillStyle: tableColor },
  });

  const launchLaneWall = Bodies.rectangle(
    width - launchLaneWidth - 16,
    height * 0.68,
    12,
    height * 0.9,
    {
      isStatic: true,
      render: { fillStyle: guideColor },
    },
  );

  const launchGate = Bodies.rectangle(width - launchLaneWidth - 3, 108, 20, 12, {
    isStatic: true,
    angle: -0.65,
    label: "orbit",
    render: { fillStyle: guideColor },
  });

  // const launchGuide = Bodies.rectangle(width - 72, 146, 110, 12, {
  //   isStatic: true,
  //   angle: -1.12,
  //   render: { fillStyle: guideColor },
  // });

  const launchTurn = Bodies.rectangle(width - 104, 184, 84, 12, {
    isStatic: true,
    angle: -0.42,
    label: "guide",
    render: { fillStyle: guideColor },
  });

  const launcherStop = Bodies.rectangle(launchX, height - 44, 36, 14, {
    isStatic: true,
    render: { fillStyle: "#fca311" },
  });

  const plunger = Bodies.rectangle(launchX, height - 18, 28, 56, {
    isStatic: true,
    isSensor: true,
    label: "plunger",
    render: { fillStyle: "#f77f00", opacity: 0.85 },
  });

  const upperLeftOrbit = Bodies.rectangle(width * 0.2, 102, 128, 12, {
    isStatic: true,
    angle: Math.PI / 4.6,
    label: "orbit",
    render: { fillStyle: guideColor },
  });

  const upperCenterGuide = Bodies.rectangle(width * 0.49, 118, 112, 12, {
    isStatic: true,
    angle: -0.12,
    label: "guide",
    render: { fillStyle: guideColor },
  });

  const upperRightOrbit = Bodies.rectangle(width * 0.7, 102, 112, 12, {
    isStatic: true,
    angle: -Math.PI / 4.2,
    label: "orbit",
    render: { fillStyle: guideColor },
  });

  const leftMidSlope = Bodies.rectangle(width * 0.24, height * 0.47, 138, 14, {
    isStatic: true,
    angle: -Math.PI / 7,
    label: "guide",
    render: { fillStyle: guideColor },
  });

  const rightMidSlope = Bodies.rectangle(width * 0.6, height * 0.42, 104, 14, {
    isStatic: true,
    angle: Math.PI / 5.2,
    label: "guide",
    render: { fillStyle: guideColor },
  });

  const centerFan = Bodies.rectangle(width * 0.48, height * 0.32, 96, 14, {
    isStatic: true,
    angle: 0.22,
    label: "guide",
    render: { fillStyle: guideColor },
  });

  const leftSling = Bodies.rectangle(width * 0.22, height * 0.77, 86, 14, {
    isStatic: true,
    angle: -0.58,
    label: "sling",
    render: { fillStyle: accentColor },
  });

  const rightSling = Bodies.rectangle(width * 0.66, height * 0.77, 86, 14, {
    isStatic: true,
    angle: 0.58,
    label: "sling",
    render: { fillStyle: accentColor },
  });

  const centerPost = Bodies.circle(width * 0.49, height * 0.53, 17, {
    isStatic: true,
    label: "bumper",
    restitution: 1.18,
    render: { fillStyle: "#f4a261", strokeStyle: "#ffe3c2", lineWidth: 3 },
  });

  const leftLanePost = Bodies.circle(width * 0.18, height * 0.64, 14, {
    isStatic: true,
    label: "lanePost",
    restitution: 1.16,
    render: { fillStyle: "#e9c46a", strokeStyle: "#fff1b2", lineWidth: 3 },
  });

  const rightLanePost = Bodies.circle(width * 0.72, height * 0.6, 14, {
    isStatic: true,
    label: "lanePost",
    restitution: 1.16,
    render: { fillStyle: "#e9c46a", strokeStyle: "#fff1b2", lineWidth: 3 },
  });

  const lowerCenterGuide = Bodies.rectangle(width * 0.48, height * 0.69, 108, 12, {
    isStatic: true,
    angle: -0.06,
    label: "guide",
    render: { fillStyle: guideColor },
  });

  const lowerLeftGuide = Bodies.rectangle(width * 0.13, height - 28, 98, 18, {
    isStatic: true,
    angle: -0.5,
    render: { fillStyle: tableColor },
  });

  const lowerRightGuide = Bodies.rectangle(width * 0.77, height - 28, 98, 18, {
    isStatic: true,
    angle: 0.5,
    render: { fillStyle: tableColor },
  });

  const leftInlaneGuide = Bodies.rectangle(width * 0.26, height * 0.86, 72, 12, {
    isStatic: true,
    angle: 0.9,
    label: "guide",
    render: { fillStyle: guideColor },
  });

  const rightInlaneGuide = Bodies.rectangle(width * 0.61, height * 0.86, 72, 12, {
    isStatic: true,
    angle: -0.9,
    label: "guide",
    render: { fillStyle: guideColor },
  });

  const leftSavePost = Bodies.circle(width * 0.2, height * 0.86, 10, {
    isStatic: true,
    label: "savePost",
    render: { fillStyle: accentColor },
  });

  const rightSavePost = Bodies.circle(width * 0.7, height * 0.86, 10, {
    isStatic: true,
    label: "savePost",
    render: { fillStyle: accentColor },
  });

  const drainGuide = Bodies.rectangle(width * 0.45, height - 8, 132, 12, {
    isStatic: true,
    angle: -0.02,
    render: { fillStyle: "#264653" },
  });

  const bumpers = [
    Bodies.circle(width * 0.28, 175, 22, {
      isStatic: true,
      label: "bumper",
      restitution: 1.2,
      render: { fillStyle: "#ffd166", strokeStyle: "#fff3b0", lineWidth: 3 },
    }),
    Bodies.circle(width * 0.52, 164, 20, {
      isStatic: true,
      label: "bumper",
      restitution: 1.2,
      render: { fillStyle: "#06d6a0", strokeStyle: "#b7ffef", lineWidth: 3 },
    }),
    Bodies.circle(width * 0.37, 258, 22, {
      isStatic: true,
      label: "bumper",
      restitution: 1.2,
      render: { fillStyle: "#118ab2", strokeStyle: "#c7f2ff", lineWidth: 3 },
    }),
  ];

  const drainSensor = Bodies.rectangle(width / 2, height + 34, width, 40, {
    isStatic: true,
    isSensor: true,
    label: "drain",
    render: { visible: false },
  });

  World.add(engine.world, [
    ball,
    leftWall,
    rightWall,
    ...rightCurveWall,
    ceiling,
    launchLaneWall,
    // launchGate,
    // launchGuide,
    launchTurn,
    launcherStop,
    plunger,
    upperLeftOrbit,
    // upperCenterGuide,
    // upperRightOrbit,
    // leftMidSlope,
    // rightMidSlope,
    // centerFan,
    // leftSling,
    // rightSling,
    centerPost,
    leftLanePost,
    rightLanePost,
    lowerCenterGuide,
    lowerLeftGuide,
    lowerRightGuide,
    leftInlaneGuide,
    rightInlaneGuide,
    leftSavePost,
    rightSavePost,
    drainGuide, // TODO make this a sensor only for the drain area
    leftFlipper,
    rightFlipper,
    leftPivot,
    rightPivot,
    drainSensor,
    ...bumpers,
  ]);

  // Controls
  let leftActive = false;
  let rightActive = false;
  let launchCharging = false;
  let launchCharge = 0;
  let pendingLaunch = false;
  const scoreableLabels = new Set(Object.keys(scoreConfig));

  const ballIsInLaunchLane = () =>
    ball.position.x > width - launchLaneWidth - 24 && ball.position.y > height * 0.55;

  const resetBall = ({ resetScore = false } = {}) => {
    if (resetScore) {
      score = 0;
      emitScore();
    }

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
    if (e.code === "ArrowLeft") {
      e.preventDefault();
      leftActive = true;
    }

    if (e.code === "ArrowRight") {
      e.preventDefault();
      rightActive = true;
    }

    if (e.code === "Space") {
      e.preventDefault();
      if (ballIsInLaunchLane()) {
        launchCharging = true;
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === "ArrowLeft") {
      e.preventDefault();
      leftActive = false;
    }

    if (e.code === "ArrowRight") {
      e.preventDefault();
      rightActive = false;
    }

    if (e.code === "Space") {
      e.preventDefault();
      if (launchCharging && ballIsInLaunchLane()) {
        pendingLaunch = true;
      }

      launchCharging = false;
    }

    if (e.code === "KeyR") {
      e.preventDefault();
      resetBall({ resetScore: true });
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  Body.setAngle(leftFlipper, -0.3);
  Body.setAngle(rightFlipper, 0.3);

  Events.on(engine, "collisionStart", ({ pairs }) => {
    pairs.forEach(({ bodyA, bodyB }) => {
      const labels = [bodyA.label, bodyB.label];

      if (labels.includes("drain") && labels.includes("ball")) {
        resetBall();
      }

      const scoringBody =
        bodyA.label === "ball"
          ? bodyB
          : bodyB.label === "ball"
            ? bodyA
            : null;

      if (scoringBody && scoreableLabels.has(scoringBody.label)) {
        addScore(scoringBody.label);
      }

      if (labels.includes("bumper") && labels.includes("ball")) {
        const bumper = bodyA.label === "bumper" ? bodyA : bodyB;
        const dx = ball.position.x - bumper.position.x;
        const dy = ball.position.y - bumper.position.y;
        const length = Math.max(Math.hypot(dx, dy), 1);
        const boost = 0.03;

        Body.applyForce(ball, ball.position, {
          x: (dx / length) * boost,
          y: (dy / length) * boost,
        });
      }
    });
  });
  emitScore();

  Events.on(engine, "beforeUpdate", () => {
    if (launchCharging && ballIsInLaunchLane()) {
      launchCharge = Math.min(maxLaunchCharge, launchCharge + 0.02);
    } else if (!launchCharging) {
      launchCharge = Math.max(0, launchCharge - 0.04);
    }

    Body.setPosition(plunger, {
      x: launchX,
      y: height - 18 + launchCharge * 26,
    });

    if (pendingLaunch && ballIsInLaunchLane()) {
      Body.setVelocity(ball, {
        x: -3.2 - launchCharge * 3.4,
        y: -11 - launchCharge * 13,
      });

      pendingLaunch = false;
      launchCharge = 0;
    }

    // Left flipper limits
    const leftMin = -0.8;
    const leftMax = -0.2;

    if (leftActive) {
      if (leftFlipper.angle > leftMin) {
        Body.setAngularVelocity(leftFlipper, -0.4);
      } else {
        Body.setAngularVelocity(leftFlipper, 0);
      }
    } else {
      if (leftFlipper.angle < leftMax) {
        Body.setAngularVelocity(leftFlipper, 0.2);
      } else {
        Body.setAngularVelocity(leftFlipper, 0);
        Body.setAngle(leftFlipper, leftMax); // snap to rest
      }
    }

    // Right flipper limits
    const rightMin = 0.2;
    const rightMax = 0.8;

    if (rightActive) {
      if (rightFlipper.angle < rightMax) {
        Body.setAngularVelocity(rightFlipper, 0.4);
      } else {
        Body.setAngularVelocity(rightFlipper, 0);
      }
    } else {
      if (rightFlipper.angle > rightMin) {
        Body.setAngularVelocity(rightFlipper, -0.2);
      } else {
        Body.setAngularVelocity(rightFlipper, 0);
        Body.setAngle(rightFlipper, rightMin); // snap to rest
      }
    }
  });

  Events.on(render, "afterRender", () => {
    const { context } = render;
    drawPlayfieldArt(context, width, height, launchCharge, {
      bumpers,
      centerPost,
      leftLanePost,
      rightLanePost,
      leftSavePost,
      rightSavePost,
    });
  });

  Render.run(render);
  const runner = Runner.create();
  Runner.run(runner, engine);

  return {
    engine,
    render,
    runner,
    getScore() {
      return score;
    },
    restart() {
      resetBall({ resetScore: true });
    },
    destroy() {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    },
  };
}
