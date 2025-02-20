const PIXELS_PER_TPU = 100; // Scale factor for game units to pixels
let bot3Enabled = false; // Toggle for this specific bot

// Function to simulate pressing a movement key for a duration (500ms)
function sendKey(direction) {
    if (!bot3Enabled) return; // Prevent movement if the bot is disabled

    const bot = balls[1];

    // Only act if the key isn't already active
    if (!bot[direction]) {
        // Set opposing key to false and current key to true
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
            // For any other direction, simply set it to true.
            bot[direction] = true;
        }
    }
}

// botMove translates a "seek" vector into simulated key presses.
function botMove(seek) {
    if (!bot3Enabled) return; // Prevent movement if the bot is disabled

    const threshold = 5; // Minimal difference in pixels
    if (Math.abs(seek.x) > threshold) {
        sendKey(seek.x > 0 ? "right" : "left");
    }
    if (Math.abs(seek.y) > threshold) {
        sendKey(seek.y > 0 ? "down" : "up");
    }
}

// runBlueBot computes a desired destination based on simple logic:
// - If the bot has the flag, head for the safe base.
// - Else if the enemy (controlledBall) has the flag, chase the enemy.
// - Otherwise, go for the flag on the ground.
function runBlueBot() {
    if (!bot3Enabled) return; // Prevent running the bot if disabled

    const botData = balls[1].hasFlag;
    const pos = balls[1].GetPosition();
    const botPos = { x: pos.x * PIXELS_PER_TPU, y: pos.y * PIXELS_PER_TPU };
    const vel = balls[1].GetLinearVelocity();
    const botVel = { x: vel.x * PIXELS_PER_TPU, y: vel.y * PIXELS_PER_TPU };

    // A rough predicted position (current position + velocity)
    const predictedBotPos = { x: botPos.x + botVel.x, y: botPos.y + botVel.y };

    let destination;
    if (balls[0].hasFlag) {
        // If the enemy has the flag, chase the enemy.
        const enemyPos = balls[0].GetPosition();
        const enemyVel = balls[0].GetLinearVelocity();
        destination = { 
            x: enemyPos.x * PIXELS_PER_TPU + enemyVel.x * PIXELS_PER_TPU, 
            y: enemyPos.y * PIXELS_PER_TPU + enemyVel.y * PIXELS_PER_TPU 
        };

        const seek = {
            x: destination.x - predictedBotPos.x,
            y: destination.y - predictedBotPos.y
        };

        botMove(seek);
    }
}

// Run the blue bot AI every 100ms.
let bot3Interval = setInterval(runBlueBot, 100);

// Functions to enable or disable the bot
function enableBot3() {
    bot1Enabled = false;
bot2Enabled= false;
    bot3Enabled = true;
    console.log("Bot 3 enabled.");
}

function disableBot3() {
    bot3Enabled = false;
    console.log("Bot 3 disabled.");
}
