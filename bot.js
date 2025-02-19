const PIXELS_PER_TPU = 100; // Scale factor for game units to pixels

// Function to simulate pressing a movement key for a duration (500ms)
function sendKey(direction, duration) {
    const bot = balls[1];

    if (!bot[direction]) {
        bot[direction] = true;
        //console.log(`[sendKey] ${direction} pressed for ${duration}ms`);

        setTimeout(() => {
            bot[direction] = false;
           // console.log(`[sendKey] ${direction} released`);
        }, duration);
    }
}

    // botMove translates a "seek" vector into simulated key presses.
    function botMove(seek) {
      var threshold = 5; // minimal difference in pixels
      if (Math.abs(seek.x) > threshold) {
        if (seek.x > 0) {
          sendKey("right", 500);
        } else {
          sendKey("left", 500);
        }
      }
      if (Math.abs(seek.y) > threshold) {
        if (seek.y > 0) {
          sendKey("down", 500);
        } else {
          sendKey("up", 500);
        }
      }
    }
    
    // runBlueBot computes a desired destination based on simple logic:
    // - If the bot has the flag, head for the safe base.
    // - Else if the enemy (controlledBall) has the flag, chase the enemy.
    // - Otherwise, go for the flag on the ground.
    function runBlueBot() {
      var botData = balls[1].hasFlag;
      var pos = balls[1].GetPosition();
      var botPos = { x: pos.x * PIXELS_PER_TPU, y: pos.y * PIXELS_PER_TPU };
      var vel = balls[1].GetLinearVelocity();
      var botVel = { x: vel.x * PIXELS_PER_TPU, y: vel.y * PIXELS_PER_TPU };
      // A rough predicted position (current position + velocity)
      var predictedBotPos = { x: botPos.x + botVel.x, y: botPos.y + botVel.y };
      
      var destination;
      if (balls[0].hasFlag) {
        // If the enemy has the flag, chase the enemy.
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
    }}
    
    // Run the blue bot AI every 100ms.
    setInterval(runBlueBot, 100);
