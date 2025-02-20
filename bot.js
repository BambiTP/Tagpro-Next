const PIXELS_PER_TPU = 100; // Scale factor for game units to pixels

// Only one bot is active at a time.
// 0 = no bot, 1 = bot1, 2 = bot2, 3 = bot3.
let activeBot = 1; // default active bot

// Helper: Check if a specific bot is active.
function isBotActive(botNumber) {
  return activeBot === botNumber;
}

/* ===== BOT 1 Implementation ===== */
function sendKeyBot1(direction, duration) {
  if (!isBotActive(1)) return;
  const bot = balls[1];
  if (!bot[direction]) {
    bot[direction] = true;
    console.log(`[Bot1 sendKey] ${direction} pressed for ${duration}ms`);
    setTimeout(() => {
      bot[direction] = false;
      console.log(`[Bot1 sendKey] ${direction} released`);
    }, duration);
  }
}

function botMoveBot1(seek) {
  if (!isBotActive(1)) return;
  const threshold = 5;
  if (Math.abs(seek.x) > threshold) {
    sendKeyBot1(seek.x > 0 ? "right" : "left", 500);
  }
  if (Math.abs(seek.y) > threshold) {
    sendKeyBot1(seek.y > 0 ? "down" : "up", 500);
  }
}

function runBlueBot1() {
  if (!isBotActive(1)) return;
  const pos = balls[1].GetPosition();
  const botPos = { x: pos.x * PIXELS_PER_TPU, y: pos.y * PIXELS_PER_TPU };
  const vel = balls[1].GetLinearVelocity();
  const botVel = { x: vel.x * PIXELS_PER_TPU, y: vel.y * PIXELS_PER_TPU };
  const predictedBotPos = { x: botPos.x + botVel.x, y: botPos.y + botVel.y };

  // If the enemy has the flag, chase the enemy.
  if (balls[0].hasFlag) {
    const enemyPos = balls[0].GetPosition();
    const enemyVel = balls[0].GetLinearVelocity();
    const destination = {
      x: enemyPos.x * PIXELS_PER_TPU + enemyVel.x * PIXELS_PER_TPU,
      y: enemyPos.y * PIXELS_PER_TPU + enemyVel.y * PIXELS_PER_TPU
    };
    const seek = {
      x: destination.x - predictedBotPos.x,
      y: destination.y - predictedBotPos.y
    };
    botMoveBot1(seek);
  }
}

/* ===== BOT 2 Implementation ===== */
function sendKeyBot2(direction, duration) {
  if (!isBotActive(2)) return;
  const bot = balls[1];
  if (!bot[direction]) {
    bot[direction] = true;
    console.log(`[Bot2 sendKey] ${direction} pressed for ${duration}ms`);
    setTimeout(() => {
      bot[direction] = false;
      console.log(`[Bot2 sendKey] ${direction} released`);
    }, duration);
  }
}

function botMoveBot2(seek) {
  if (!isBotActive(2)) return;
  const threshold = 5;
  if (Math.abs(seek.x) > threshold) {
    sendKeyBot2(seek.x > 0 ? "right" : "left", 400);
  }
  if (Math.abs(seek.y) > threshold) {
    sendKeyBot2(seek.y > 0 ? "down" : "up", 400);
  }
}

// Clamps a point to an allowed area.
function clampToAllowedArea(point) {
  const allowedCenter = { x: 12 * 40 + 40 / 2, y: 9 * 40 + 40 / 2 };
  const allowedWidth = 21 * 40 + 15;
  const allowedHeight = 15 * 40 + 15;
  const halfWidth = allowedWidth / 2;
  const halfHeight = allowedHeight / 2;
  
  const xMin = allowedCenter.x - halfWidth;
  const xMax = allowedCenter.x + halfWidth;
  const yMin = allowedCenter.y - halfHeight;
  const yMax = allowedCenter.y + halfHeight;
  
  return {
    x: Math.min(Math.max(point.x, xMin), xMax),
    y: Math.min(Math.max(point.y, yMin), yMax)
  };
}

function checkEnemyPositionBot2() {
  if (!isBotActive(2)) return;
  const enemyPos = balls[0].GetPosition();
  const enemyPosPixel = {
    x: enemyPos.x * PIXELS_PER_TPU,
    y: enemyPos.y * PIXELS_PER_TPU
  };
  // Additional enemy position handling can be added here.
}

function runBlueBot2() {
  if (!isBotActive(2)) return;
  const bot = balls[1];
  const pos = bot.GetPosition();
  const botPos = { x: pos.x * PIXELS_PER_TPU, y: pos.y * PIXELS_PER_TPU };
  const vel = bot.GetLinearVelocity();
  const botVel = { x: vel.x * PIXELS_PER_TPU, y: vel.y * PIXELS_PER_TPU };
  const predictedBotPos = { x: botPos.x + botVel.x, y: botPos.y + botVel.y };

  let destination;
  if (balls[0].hasFlag) {
    const enemyPos = balls[0].GetPosition();
    const enemyVel = balls[0].GetLinearVelocity();
    destination = {
      x: enemyPos.x * PIXELS_PER_TPU + enemyVel.x * PIXELS_PER_TPU,
      y: enemyPos.y * PIXELS_PER_TPU + enemyVel.y * PIXELS_PER_TPU
    };
  } else {
    const flagPos = flag.GetPosition();
    destination = {
      x: flagPos.x * PIXELS_PER_TPU,
      y: flagPos.y * PIXELS_PER_TPU
    };
  }
  destination = clampToAllowedArea(destination);
  const seek = {
    x: destination.x - predictedBotPos.x,
    y: destination.y - predictedBotPos.y
  };
  botMoveBot2(seek);
  checkEnemyPositionBot2();
}

/* ===== BOT 3 Implementation ===== */
function sendKeyBot3(direction) {
  if (!isBotActive(3)) return;
  const bot = balls[1];
  if (!bot[direction]) {
    // Ensure opposing direction is cleared before setting the new one.
    if (direction === 'up') {
      bot.down = false;
      bot.up = true;
    } else if (direction === 'down') {
      bot.up = false;
      bot.down = true;
    } else if (direction === 'right') {
      bot.left = false;
      bot.right = true;
    } else if (direction === 'left') {
      bot.right = false;
      bot.left = true;
    } else {
      bot[direction] = true;
    }
    console.log(`[Bot3 sendKey] ${direction} activated.`);
  }
}

function botMoveBot3(seek) {
  if (!isBotActive(3)) return;
  const threshold = 5;
  if (Math.abs(seek.x) > threshold) {
    sendKeyBot3(seek.x > 0 ? "right" : "left");
  }
  if (Math.abs(seek.y) > threshold) {
    sendKeyBot3(seek.y > 0 ? "down" : "up");
  }
}

function runBlueBot3() {
  if (!isBotActive(3)) return;
  const bot = balls[1];
  const pos = bot.GetPosition();
  const botPos = { x: pos.x * PIXELS_PER_TPU, y: pos.y * PIXELS_PER_TPU };
  const vel = bot.GetLinearVelocity();
  const botVel = { x: vel.x * PIXELS_PER_TPU, y: vel.y * PIXELS_PER_TPU };
  const predictedBotPos = { x: botPos.x + botVel.x, y: botPos.y + botVel.y };

  // If the enemy has the flag, chase it.
  if (balls[0].hasFlag) {
    const enemyPos = balls[0].GetPosition();
    const enemyVel = balls[0].GetLinearVelocity();
    const destination = {
      x: enemyPos.x * PIXELS_PER_TPU + enemyVel.x * PIXELS_PER_TPU,
      y: enemyPos.y * PIXELS_PER_TPU + enemyVel.y * PIXELS_PER_TPU
    };
    const seek = {
      x: destination.x - predictedBotPos.x,
      y: destination.y - predictedBotPos.y
    };
    botMoveBot3(seek);
  }
}

/* ===== Master Runner ===== */
// Calls the run function for whichever bot is active.
function runActiveBot() {
  switch(activeBot) {
    case 1:
      runBlueBot1();
      break;
    case 2:
      runBlueBot2();
      break;
    case 3:
      runBlueBot3();
      break;
    default:
      // No bot is active.
      break;
  }
}

// Run the active bot logic every 100ms.
let masterBotInterval = setInterval(runActiveBot, 100);

/* ===== Control Functions ===== */
// Enable a specific bot (automatically disables others).
function enableBot(botNumber) {
  activeBot = botNumber;
  console.log(`Bot ${botNumber} enabled.`);
}

// Disable the current bot (set activeBot to 0).
function disableCurrentBot() {
  console.log(`Bot ${activeBot} disabled.`);
  activeBot = 0;
}

// Example usage:
// enableBot(1); // Enables bot 1
// enableBot(2); // Switches to bot 2
// enableBot(3); // Switches to bot 3
// disableCurrentBot(); // Disables any active bot
