let bot2Enabled = false; // Toggle bot on/off

// Function to simulate pressing a movement key for a duration (e.g., 400ms)
function sendKey(direction, duration) {
  if (!bot2Enabled) return; // Prevent movement if the bot is disabled

  const bot = balls[1];
  if (!bot[direction]) {
    bot[direction] = true;
    console.log(`[sendKey] ${direction} pressed for ${duration}ms`);
    setTimeout(() => {
      bot[direction] = false;
      console.log(`[sendKey] ${direction} released`);
    }, duration);
  }
}

function botMove(seek) {
  if (!bot2Enabled) return; // Prevent movement if the bot is disabled

  const threshold = 5; // Minimal difference in pixels
  if (Math.abs(seek.x) > threshold) {
    sendKey(seek.x > 0 ? "right" : "left", 400);
  }
  if (Math.abs(seek.y) > threshold) {
    sendKey(seek.y > 0 ? "down" : "up", 400);
  }
}

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

function checkEnemyPosition() {
  if (!bot2Enabled) return; // Prevent checking if the bot is disabled

  const enemyPos = balls[0].GetPosition();
  const enemyPosPixel = {
    x: enemyPos.x * PIXELS_PER_TPU,
    y: enemyPos.y * PIXELS_PER_TPU
  };
}

function runBlueBot() {
  if (!bot2Enabled) return; // Prevent running the bot if disabled

  const bot = balls[1];
  const pos = bot.GetPosition();
  const botPos = { x: pos.x * PIXELS_PER_TPU, y: pos.y * PIXELS_PER_TPU };
  const vel = bot.GetLinearVelocity();
  const botVel = { x: vel.x * PIXELS_PER_TPU, y: vel.y * PIXELS_PER_TPU };
  
  const predictedBotPos = { 
    x: botPos.x + botVel.x, 
    y: botPos.y + botVel.y 
  };

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
  
  botMove(seek);
}

// Run the blue bot AI and check enemy position every 100ms.
let botInterval = setInterval(() => {
  runBlueBot();
  checkEnemyPosition();
}, 100);

// Functions to enable or disable the bot
function enableBot2() {
bot1Enabled = false;
bot3Enabled = false;
  bot2Enabled = true;
  console.log("Bot 2 enabled.");
}

function disableBot2() {
  bot2Enabled = false;
  console.log("Bot 2 disabled.");
}
