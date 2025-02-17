  <script src="tf.min.js"></script>
// ==========================================
// 1. Define the RL Model
// ==========================================
let epsilon = 1.0; // Start with 100% exploration
const epsilonMin = 0.01; // Minimum value epsilon can decay to
const epsilonDecayRate = 0.993; // Decay rate per episode or step
let ED = 50000; 
let DOW = 360000;
function updateEpsilon() {
  if (ED === 0) {
    // Decay epsilon
    epsilon = Math.max(epsilon * epsilonDecayRate, epsilonMin);
    // Reset the decay counter (e.g., decay every 50,000 steps or episodes)
    ED = 50000; 
  } else {
    // Decrease the counter each step
    ED--;
  }

  function download() {
  if (DOW === 0) {
 
 saveModelAndDownload()
    DOW = 360000; 
  } else {
    // Decrease the counter each step
    DOW--;
  }
  
function createRLModel() {
  const input = tf.input({ shape: [4] });
  const dense1 = tf.layers.dense({ units: 16, activation: 'relu' }).apply(input);
  const dense2 = tf.layers.dense({ units: 16, activation: 'relu' }).apply(dense1);
  
  const directionOutput = tf.layers.dense({
    units: 4,
    activation: 'softmax',
    name: 'direction'
  }).apply(dense2);
  
  const durationOutput = tf.layers.dense({
    units: 1,
    activation: 'sigmoid',
    name: 'duration'
  }).apply(dense2);
  
  return tf.model({ inputs: input, outputs: [directionOutput, durationOutput] });
}

// Create the model (and later you can load pretrained weights if desired)
const rlModel = createRLModel();


// ==========================================
// 2. Action Selection Functions for Each Bot
// ==========================================

// Bot 1: Uses sendKeyC
function chooseActionBot1(state, epsilon = 0.1) {
  // Convert state (an array of 4 numbers) into a 2D tensor [1,4]
  const stateTensor = tf.tensor2d([state]);
  const [directionTensor, durationTensor] = rlModel.predict(stateTensor);

  // Get raw output values (synchronously for simplicity)
  const directionProbs = directionTensor.dataSync(); // Array of 4 probabilities
  const durationValue = durationTensor.dataSync()[0];  // A scalar between 0 and 1
  
  const directions = ['up', 'down', 'left', 'right'];
  let chosenDirection;
  
  // Epsilon-greedy exploration
  if (Math.random() < epsilon) {
    chosenDirection = directions[Math.floor(Math.random() * directions.length)];
  } else {
    const maxIndex = directionProbs.indexOf(Math.max(...directionProbs));
    chosenDirection = directions[maxIndex];
  }
  
  // Scale duration output to an integer between 0 and 6000 ms
  const chosenDuration = Math.floor(Math.min(Math.max(durationValue * 6000, 0), 6000));
  
  // Clean up tensors.
  stateTensor.dispose();
  directionTensor.dispose();
  durationTensor.dispose();
  
  return { direction: chosenDirection, duration: chosenDuration };
}

// Bot 2: Uses sendKey
// For now, we'll have it use the same policy as Bot 1. Later, you can customize it further.
function chooseActionBot2(state, epsilon = 0.1) {
  return chooseActionBot1(state, epsilon);
}


// ==========================================
// 3. Reward Variables & Helper Functions
// ==========================================

// These variables will accumulate rewards for each bot over a time step.
let rewardBot1 = 0;  // For Bot 1 (controlled by sendKeyC)
let rewardBot2 = 0;  // For Bot 2 (controlled by sendKey)

// Example reward functions (call these from your game logic as events occur)
function Bot1Tag() {
  rewardBot1 += 15;
}

function Bot1Hold() {
  rewardBot1 += 0.05;
}

function Bot1Chase() {
  rewardBot1 -= 0.05;
}
function Bot2Chase() {
  rewardBot2 -= 0.05;
}


function Bot2Tag() {
  rewardBot2 += 15;
}

function Bot2Hold() {
  rewardBot2 += 0.05;
}


// ==========================================
// 4. Experience Replay Memory for Each Bot
// ==========================================
const MEMORY_SIZE = 5000;
let memoryBot1 = [];
let memoryBot2 = [];

function rememberBot1(state, action, reward, nextState) {
  memoryBot1.push({ state, action, reward, nextState });
  if (memoryBot1.length > MEMORY_SIZE) memoryBot1.shift();
}

function rememberBot2(state, action, reward, nextState) {
  memoryBot2.push({ state, action, reward, nextState });
  if (memoryBot2.length > MEMORY_SIZE) memoryBot2.shift();
}


// ==========================================
// 5. Training Function Using Experience Replay
// ==========================================

async function trainModel(batchSize = 32) {
  // Combine the memories from both bots since they share the same model
  const combinedMemory = memoryBot1.concat(memoryBot2);
  if (combinedMemory.length < batchSize) return; // Not enough samples yet
  
  // Sample a random batch from the combined memory
  const batch = [];
  for (let i = 0; i < batchSize; i++) {
    const index = Math.floor(Math.random() * combinedMemory.length);
    batch.push(combinedMemory[index]);
  }
  
  // Prepare arrays for states, actions (as indices), and rewards.
  const states = [];
  const actions = []; // action indices corresponding to the chosen direction
  const rewards = [];
  
  // Mapping for directions to indices
  const directionMapping = { 'up': 0, 'down': 1, 'left': 2, 'right': 3 };
  
  for (const exp of batch) {
    states.push(exp.state);
    actions.push(directionMapping[exp.action.direction]);
    rewards.push(exp.reward);
  }
  
  const statesTensor = tf.tensor2d(states); // shape [batchSize, 4]
  const actionsTensor = tf.tensor1d(actions, 'int32'); // shape [batchSize]
  const rewardsTensor = tf.tensor1d(rewards); // shape [batchSize]
  
  // We'll use a simple policy gradient loss:
  // For each sample, loss = -log(probability of taken action) * reward
  const optimizer = tf.train.adam(0.001);
  
  await optimizer.minimize(() => {
    // Get predictions from the model on these states
    const [directionPred, durationPred] = rlModel.apply(statesTensor, { training: true });
    // directionPred shape: [batchSize, 4]
    
    // Create one-hot encoded actions from actionsTensor
    const oneHotActions = tf.oneHot(actionsTensor, 4); // shape: [batchSize, 4]
    
    // Compute the probability for the taken action
    // Multiply elementwise and then sum along the last dimension
    const selectedProbs = tf.sum(tf.mul(directionPred, oneHotActions), 1);
    
    // Compute the log probability (adding a small number for numerical stability)
    const logProbs = tf.log(selectedProbs.add(1e-10));
    
    // Policy gradient loss: negative log likelihood weighted by reward.
    const loss = tf.neg(tf.mean(tf.mul(logProbs, rewardsTensor)));
    return loss;
  });
  
  // Clean up tensors
  statesTensor.dispose();
  actionsTensor.dispose();
  rewardsTensor.dispose();
}


// ==========================================
// 6. Main RL Step Function (to be called in your game loop)
// ==========================================
let frameCount = 0;

// Modify the rlStep to train after N frames (e.g., 6000 frames)
async function rlStep() {
  // Capture current state before taking an action
  const state = [
    ncBallSprite.x,
    ncBallSprite.y,
    ballSprite.x,
    ballSprite.y
  ];

  // Get actions for each bot
  const actionBot1 = chooseActionBot1(state, epsilon);
  const actionBot2 = chooseActionBot2(state, epsilon);

  // Send actions to the bots
  sendKeyC(actionBot1.direction, actionBot1.duration);
  sendKey(actionBot2.direction, actionBot2.duration);

  // Capture next state after action
  const nextState = [
    ncBallSprite.x,
    ncBallSprite.y,
    ballSprite.x,
    ballSprite.y
  ];

  // Store the experience for each bot
  rememberBot1(state, actionBot1, rewardBot1, nextState);
  rememberBot2(state, actionBot2, rewardBot2, nextState);

  // Update epsilon (decay exploration over time)
  updateEpsilon();
download();
  // Reset rewards after each step
  rewardBot1 = 0;
  rewardBot2 = 0;

  // Increment frame count
  frameCount++;

  // Train model every 6000 frames (or ~1 minute, depending on game speed)
  if (frameCount % 6000 === 0) {
    // Call training function every 6000 frames (adjust as needed)
    await trainModel(32);  // Train with a batch of 32 experiences
  }
}

async function saveModelAndDownload() {
  // Save the model to local storage first
  await rlModel.save('localstorage://myModel');

  // Create a download link for the model
  const modelJSON = await rlModel.toJSON();  // Convert model to JSON format
  const modelBlob = new Blob([JSON.stringify(modelJSON)], { type: 'application/json' });
  const modelURL = URL.createObjectURL(modelBlob);

  // Create a temporary link element to trigger the download
  const link = document.createElement('a');
  link.href = modelURL;
  link.download = 'rlModel.json';  // Name the downloaded file
  link.click();  // Trigger the download

  // Cleanup
  URL.revokeObjectURL(modelURL);
  console.log('Model downloaded');
}

async function loadModelFromFile() {
  // Load the model from a file path or URL
  rlModel = await tf.loadLayersModel('path/to/your/model.json');  // Directly assign to rlModel
  
  console.log('Model loaded from file');
}

