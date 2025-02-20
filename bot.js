const PIXELS_PER_TPU = 100; // Scale factor for game units to pixels
let bot1Enabled = true; // Toggle bot on/off

function sendKey(direction, duration) {
    if (!bot1Enabled) return;

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
    if (!bot1Enabled) return;

    var threshold = 5; // Minimal difference in pixels
    if (Math.abs(seek.x) > threshold) {
        sendKey(seek.x > 0 ? "right" : "left", 500);
    }
    if (Math.abs(seek.y) > threshold) {
        sendKey(seek.y > 0 ? "down" : "up", 500);
    }
}

function runBlueBot() {
    if (!bot1Enabled) return;

    var botData = balls[1].hasFlag;
    var pos = balls[1].GetPosition();
    var botPos = { x: pos.x * PIXELS_PER_TPU, y: pos.y * PIXELS_PER_TPU };
    var vel = balls[1].GetLinearVelocity();
    var botVel = { x: vel.x * PIXELS_PER_TPU, y: vel.y * PIXELS_PER_TPU };

    var predictedBotPos = { x: botPos.x + botVel.x, y: botPos.y + botVel.y };

    var destination;
    if (balls[0].hasFlag) {
        var enemyPos = balls[0].GetPosition();
        var enemyVel = balls[0].GetLinearVelocity();
        destination = { 
            x: enemyPos.x * PIXELS_PER_TPU + enemyVel.x * PIXELS_PER_TPU, 
            y: enemyPos.y * PIXELS_PER_TPU + enemyVel.y * PIXELS_PER_TPU 
        };

        var seek = {
            x: destination.x - predictedBotPos.x,
            y: destination.y - predictedBotPos.y
        };
        botMove(seek);
    }
}

// Run the blue bot AI every 100ms.
let botInterval = setInterval(runBlueBot, 100);

// Functions to enable or disable the bot
function enableBot1() {
    bot1Enabled = true;
    console.log("Bot enabled.");
}

function disableBot1() {
    bot1Enabled = false;
    console.log("Bot disabled.");
}
