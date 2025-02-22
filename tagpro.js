// Global variable to store the selected flair index.
let selectedFlairIndex = 0;

function initGame() {
  fetch("textures.json")
    .then(response => response.json())
    .then(data => {
      startGame(data.texturePacks);
    })
    .catch(err => {
      console.error("Failed to load textures.json", err);
    });
}

function startGame(texturePacks) {
  const config = {
    tileSize: 40,      // Each tile is 40×40 pixels.
    quadSize: 20,      // tileSize / 2
    pixPerTPU: 100,    // Pixels per physics unit
    maxSpeed: 2.5,
    acceleration: 0.025,
    baseDT: 1 / 60,
    mapRows: 20,
    mapCols: 25,
    texturePackDefaultIndex: 0
  };

  let currentTexturePack = texturePacks[config.texturePackDefaultIndex];
  const textureSelect = document.getElementById('textureSelect');
  texturePacks.forEach((pack, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = pack.name;
    textureSelect.appendChild(option);
  });

  textureSelect.addEventListener('change', (e) => {
    const selectedPack = texturePacks[parseInt(e.target.value, 10)];
    updateTexturePack(selectedPack);
  });

  // Close modal button
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('textureModal').style.display = "none";
  });

  // Toggle modal on Escape key
  document.addEventListener('keydown', (e) => {
    if(e.key === "Escape") {
      const modal = document.getElementById('textureModal');
      modal.style.display = (modal.style.display === "none" || modal.style.display === "") ? "flex" : "none";
    }
  });

  const flairContainer = document.getElementById("flairSelectContainer");
  const flairImage = new Image();
  flairImage.src = "flair.png"; // Your flair spritesheet
  flairImage.onload = () => {
    const cols = Math.floor(flairImage.width / 16);
    const rows = Math.floor(flairImage.height / 16);
    const maxIcons = 15 * 11;
    flairContainer.innerHTML = "";
    let iconCount = 0;
    for (let r = 0; r < rows && iconCount < maxIcons; r++) {
      for (let c = 0; c < cols && iconCount < maxIcons; c++) {
        const iconDiv = document.createElement("div");
        iconDiv.className = "flairIcon";
        const innerDiv = document.createElement("div");
        innerDiv.className = "flairIconInner";
        innerDiv.style.backgroundImage = "url(flair.png)";
        innerDiv.style.backgroundPosition = `-${c * 16}px -${r * 16}px`;
        iconDiv.appendChild(innerDiv);
        const index = iconCount;
        iconDiv.dataset.flairIndex = index;
        iconDiv.addEventListener("click", function() {
          document.querySelectorAll('.flairIcon').forEach(icon => icon.classList.remove("selected"));
          iconDiv.classList.add("selected");
          selectedFlairIndex = parseInt(iconDiv.dataset.flairIndex, 10);
        });
        flairContainer.appendChild(iconDiv);
        iconCount++;
      }
    }
    if (flairContainer.firstChild) {
      flairContainer.firstChild.classList.add("selected");
    }
  };

  const flairBaseTexture = PIXI.BaseTexture.from("flair.png");

  flairBaseTexture.on("loaded", () => {
    console.log("Flair texture loaded:", flairBaseTexture.width, flairBaseTexture.height);
  });

  function getFlairTexture(index) {
    if (!flairBaseTexture.valid) {
      console.error("Flair texture is not ready yet!");
      return PIXI.Texture.EMPTY; // Avoids crashing
    }

    const cols = Math.floor(flairBaseTexture.width / 16);
    const row = Math.floor(index / cols);
    const col = index % cols;
    return new PIXI.Texture(flairBaseTexture, new PIXI.Rectangle(col * 16, row * 16, 16, 16));
  }

  // ******************************************************************
  // UPDATE THE UI FOR EACH BALL (NAME, DEGREE, AND FLAIR)
  function updatePlayerUI() {
    const offsetx = -20;
    const offsety = -19;
    // Loop over all players so both controlled and non-controlled get updated.
    players.forEach(player => {
      const data = player.GetUserData();
      const ballX = data.sprite.x;
      const ballY = data.sprite.y;
      let name, degreeValue, flairIndex, nameColor;
 if (data.controlled) {
  name = document.getElementById("playerNameInput").value;
  degreeValue = parseFloat(document.getElementById("degreeInput").value);
  flairIndex = selectedFlairIndex;
  data.auth = document.getElementById("authCheckbox").checked; // Store auth in data
} else {
  name = data.name || "";
  degreeValue = data.degree || 0;
  flairIndex = data.flairIndex || 0;
}

// Set name color based on auth status
nameColor = data.auth ? 0xBFFF00 : 0xFFFFFF;

      data.name = name;

      // Update or create the name text sprite.
      if (data.sprites.name) {
        data.sprites.name.text = name;
        data.sprites.name.style.fill = nameColor;
        data.sprites.name.x = ballX + 36 + offsetx;
        data.sprites.name.y = ballY - 17 + offsety;
      } else {
     const nameText = new PIXI.Text(name, {
  fontFamily: "Arial",
  fontSize: 11, // No need for "px" in PIXI.js
  fontWeight: "bold",
  fill: data.auth ? 0xBFFF00 : 0xFFFFFF, // Corrected: No quotes around expression
  stroke: "#000000",
  strokeThickness: 2,
  lineJoin: "round",
  dropShadow: true,
  dropShadowColor: "#000000",
  dropShadowAngle: 0,
  dropShadowDistance: 0,
  dropShadowBlur: 3,
  dropShadowAlpha: 0.8,
  padding: 1 // Set as a number, not a fraction
});

        nameText.x = ballX + 36 + offsetx;
        nameText.y = ballY - 17 + offsety;
        worldContainer.addChild(nameText);
        data.sprites.name = nameText;
      }

      // Update or create the degree text sprite.
      if (data.sprites.degrees) {
        data.sprites.degrees.text = degreeValue + "°";
        data.sprites.degrees.x = ballX + 41 + offsetx;
        data.sprites.degrees.y = ballY - 6 + offsety;
      } else {
        const degreeText = new PIXI.Text(degreeValue + "°", {
          fontFamily: "Arial",
          fontSize: "11px",
          fontWeight: "bold",
          fill: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 2,
          lineJoin: "round",
          dropShadow: true,
          dropShadowColor: "#000000",
          dropShadowAngle: 0,
          dropShadowDistance: 0,
          dropShadowBlur: 3,
          dropShadowAlpha: 0.8,
          padding: 0.1,
        });
        degreeText.x = ballX + 41 + offsetx;
        degreeText.y = ballY - 6 + offsety;
        worldContainer.addChild(degreeText);
        data.sprites.degrees = degreeText;
      }

      // Update or create the flair sprite.
      if (data.sprites.flair) {
        data.sprites.flair.texture = getFlairTexture(flairIndex);
        data.sprites.flair.x = ballX + 20 + offsetx;
        data.sprites.flair.y = ballY - 9 + offsety;
      } else {
        const flairSprite = new PIXI.Sprite(getFlairTexture(flairIndex));
        flairSprite.pivot.x = 8;
        flairSprite.pivot.y = 8;
        flairSprite.x = ballX + 20 + offsetx;
        flairSprite.y = ballY - 9 + offsety;
        worldContainer.addChild(flairSprite);
        data.sprites.flair = flairSprite;
      }
    });
  }
  // ******************************************************************

  const tileMap =   [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
  const wallTypes = {
    1: { wallSolids: 0xff },
    2: { wallSolids: 0xff },
    3: { wallSolids: 0xd2 },
    4: { wallSolids: 0x4b },
    5: { wallSolids: 0xb4 }
  };
  const tiles = {
    6: { sx: 520, sy: 160 }
  };
  var quadrantCoords = {
      "132": [10.5, 7.5],
      "232": [11, 7.5],
      "332": [11, 8],
      "032": [10.5, 8],
      "132d": [0.5, 3.5],
      "232d": [1, 3.5],
      "032d": [0.5, 4],
      "143": [4.5, 9.5],
      "243": [5, 9.5],
      "343": [5, 10],
      "043": [4.5, 10],
      "143d": [1.5, 2.5],
      "243d": [2, 2.5],
      "043d": [1.5, 3],
      "154": [6.5, 9.5],
      "254": [7, 9.5],
      "354": [7, 10],
      "054": [6.5, 10],
      "154d": [9.5, 2.5],
      "254d": [10, 2.5],
      "354d": [10, 3],
      "165": [0.5, 7.5],
      "265": [1, 7.5],
      "365": [1, 8],
      "065": [0.5, 8],
      "165d": [10.5, 3.5],
      "265d": [11, 3.5],
      "365d": [11, 4],
      "176": [1.5, 6.5],
      "276": [2, 6.5],
      "376": [2, 7],
      "076": [1.5, 7],
      "276d": [9, 1.5],
      "376d": [9, 2],
      "076d": [8.5, 2],
      "107": [6.5, 8.5],
      "207": [7, 8.5],
      "307": [7, 9],
      "007": [6.5, 9],
      "207d": [11, 1.5],
      "307d": [11, 2],
      "007d": [10.5, 2],
      "110": [4.5, 8.5],
      "210": [5, 8.5],
      "310": [5, 9],
      "010": [4.5, 9],
      "110d": [0.5, 1.5],
      "310d": [1, 2],
      "010d": [0.5, 2],
      "121": [9.5, 6.5],
      "221": [10, 6.5],
      "321": [10, 7],
      "021": [9.5, 7],
      "121d": [2.5, 1.5],
      "321d": [3, 2],
      "021d": [2.5, 2],
      "142": [1.5, 7.5],
      "242": [2, 7.5],
      "042": [1.5, 8],
      "142d": [10.5, 0.5],
      "242d": [11, 0.5],
      "042d": [10.5, 1],
      "153": [5.5, 6.5],
      "253": [6, 6.5],
      "353": [6, 7],
      "053": [5.5, 7],
      "153d": [5.5, 0.5],
      "253d": [6, 0.5],
      "164": [9.5, 7.5],
      "264": [10, 7.5],
      "364": [10, 8],
      "164d": [0.5, 0.5],
      "264d": [1, 0.5],
      "364d": [1, 1],
      "175": [4.5, 5.5],
      "275": [5, 5.5],
      "375": [5, 6],
      "075": [4.5, 6],
      "275d": [7, 1.5],
      "375d": [7, 2],
      "206": [4, 9.5],
      "306": [4, 10],
      "006": [3.5, 10],
      "206d": [2, 3.5],
      "306d": [2, 4],
      "006d": [1.5, 4],
      "117": [5.5, 2.5],
      "217": [6, 2.5],
      "317": [6, 4],
      "017": [5.5, 4],
      "317d": [6, 3],
      "017d": [5.5, 3],
      "120": [7.5, 9.5],
      "320": [8, 10],
      "020": [7.5, 10],
      "120d": [9.5, 3.5],
      "320d": [10, 4],
      "020d": [9.5, 4],
      "131": [6.5, 5.5],
      "231": [7, 5.5],
      "331": [7, 6],
      "031": [6.5, 6],
      "131d": [4.5, 1.5],
      "031d": [4.5, 2],
      "141": [7.5, 8.5],
      "241": [8, 8.5],
      "323": [4, 5],
      "041": [7.5, 9],
      "141d": [8.5, 3.5],
      "041d": [8.5, 4],
      "152": [8.5, 7.5],
      "252": [9, 7.5],
      "334": [2, 0],
      "052": [8.5, 8],
      "152d": [3.5, 0.5],
      "252d": [4, 0.5],
      "163": [2.5, 7.5],
      "263": [3, 7.5],
      "363": [3, 8],
      "045": [9.5, 0],
      "163d": [7.5, 0.5],
      "263d": [8, 0.5],
      "174": [3.5, 8.5],
      "274": [4, 8.5],
      "374": [4, 9],
      "056": [7.5, 5],
      "274d": [3, 3.5],
      "374d": [3, 4],
      "167": [7.5, 6.5],
      "205": [10, 8.5],
      "305": [10, 9],
      "005": [9.5, 9],
      "205d": [2, 0.5],
      "305d": [2, 1],
      "170": [6.5, 7.5],
      "216": [9, 9.5],
      "316": [9, 10],
      "016": [8.5, 10],
      "316d": [10, 5],
      "016d": [9.5, 5],
      "127": [2.5, 9.5],
      "201": [5, 7.5],
      "327": [3, 10],
      "027": [2.5, 10],
      "327d": [2, 5],
      "027d": [1.5, 5],
      "130": [1.5, 8.5],
      "212": [4, 6.5],
      "330": [2, 9],
      "030": [1.5, 9],
      "130d": [9.5, 0.5],
      "030d": [9.5, 1],
      "151": [10.5, 9.5],
      "251": [11, 9.5],
      "324": [0, 7],
      "051": [10.5, 10],
      "151d": [10.5, 4.5],
      "324d": [0, 0],
      "162": [8.5, 10.5],
      "262": [9, 10.5],
      "335": [6, 8],
      "035": [5.5, 8],
      "162d": [3.5, 2.5],
      "262d": [8, 2.5],
      "173": [0.5, 9.5],
      "273": [1, 9.5],
      "373": [1, 10],
      "046": [11.5, 7],
      "046d": [11.5, 0],
      "273d": [1, 4.5],
      "157": [11.5, 8.5],
      "204": [0, 5.5],
      "304": [0, 5],
      "057": [11.5, 9],
      "204d": [0, 4.5],
      "304d": [0, 6],
      "160": [11.5, 7.5],
      "215": [8, 6.5],
      "315": [8, 7],
      "015": [7.5, 7],
      "160d": [2.5, 4.5],
      "315d": [9, 3],
      "171": [5.5, 10.5],
      "271": [6, 10.5],
      "326": [6, 5],
      "026": [5.5, 5],
      "326d": [7, 5],
      "026d": [4.5, 5],
      "137": [3.5, 6.5],
      "202": [0, 7.5],
      "337": [4, 7],
      "037": [3.5, 7],
      "202d": [9, 4.5],
      "037d": [2.5, 3],
      "140": [11.5, 5.5],
      "213": [0, 8.5],
      "313": [0, 9],
      "040": [11.5, 5],
      "140d": [11.5, 4.5],
      "040d": [11.5, 6],
      "161": [9.5, 10.5],
      "261": [10, 10.5],
      "325": [9, 6],
      "025": [8.5, 6],
      "161d": [3.5, 1.5],
      "325d": [4, 1],
      "172": [1.5, 10.5],
      "272": [2, 10.5],
      "336": [3, 6],
      "036": [2.5, 6],
      "036d": [7.5, 1],
      "272d": [8, 1.5],
      "147": [4.5, 7.5],
      "203": [4, 3.5],
      "303": [4, 4],
      "047": [4.5, 8],
      "047d": [8.5, 5],
      "203d": [8, 4.5],
      "150": [7.5, 3.5],
      "214": [7, 7.5],
      "314": [7, 8],
      "050": [7.5, 4],
      "150d": [3.5, 4.5],
      "314d": [3, 5],
      "100": [5.5, 5.5],
      "200": [6, 5.5],
      "300": [6, 6],
      "000": [5.5, 6],
      "100d": [5.5, 8.5],
      "200d": [6, 8.5],
      "300d": [6, 10],
      "000d": [5.5, 10]
    };
  const wallSolidsAt = (col, row) => {
    if(col < 0 || row < 0 || row >= tileMap.length || col >= tileMap[0].length) return 0;
    const code = tileMap[row][col];
    if(code === 6) return 0;
    const wt = wallTypes[code];
    return wt ? wt.wallSolids : 0;
  };

  const app = new PIXI.Application({
    width: 1280,
    height: 800,
    transparent: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  document.body.appendChild(app.view);

  // Disable the scroll wheel's default behavior on the canvas.
  app.view.addEventListener('wheel', (e) => {
    e.preventDefault();
  }, { passive: false });

  const worldContainer = new PIXI.Container();
  app.stage.addChild(worldContainer);

  const b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2BodyDef = Box2D.Dynamics.b2BodyDef,
        b2Body = Box2D.Dynamics.b2Body,
        b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
        b2World = Box2D.Dynamics.b2World,
        b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
        b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
  const world = new b2World(new b2Vec2(0, 0), true);
  const MAP_WIDTH = tileMap[0] ? tileMap[0].length * config.tileSize : 0;
  const MAP_HEIGHT = tileMap.length * config.tileSize;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = MAP_WIDTH;
  mapCanvas.height = MAP_HEIGHT;
  const mapCtx = mapCanvas.getContext('2d');
  let tileImage = new Image();
  tileImage.crossOrigin = "anonymous";
  tileImage.src = "https://static.koalabeast.com" + currentTexturePack.tiles + "?t=" + Date.now();
  let mapSprite, flagSprite, miniFlagSprite;
  tileImage.onload = () => {
    drawMapOnCanvas(mapCtx);
    mapSprite = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(mapCanvas)));
    mapSprite.zIndex = -1000; // Set zIndex for mapSprite
    worldContainer.addChildAt(mapSprite, 0);
    const baseTextureForFlag = PIXI.BaseTexture.from("https://static.koalabeast.com" + currentTexturePack.tiles);
    flagSprite = createSpriteFromTexture(baseTextureForFlag, new PIXI.Rectangle(520, 40, 40, 40));
    flagSprite.anchor.set(0.5);
    flagSprite.x = flag.x;
    flagSprite.y = flag.y;
    worldContainer.addChild(flagSprite);
    worldContainer.sortableChildren = true; // Enable sorting by z-index
    miniFlagSprite = createSpriteFromTexture(baseTextureForFlag, new PIXI.Rectangle(520, 40, 40, 40));
    miniFlagSprite.anchor.set(0, 0.6);
    miniFlagSprite.visible = false;
    miniFlagSprite.zIndex = -5;
    worldContainer.addChild(miniFlagSprite);
  };
  const createSpriteFromTexture = (baseTexture, rect) => {
    return new PIXI.Sprite(new PIXI.Texture(baseTexture, rect));
  };
  const flag = {
    col: 12,
    row: 10,
    taken: false,
    x: 12 * config.tileSize + config.tileSize / 2,
    y: 9 * config.tileSize + config.tileSize / 2,
    carrier: null
  };
  let ballIdCounter = 1;
  const players = [];
  
  // Modified spawnBall function with properties for name, degree, and flair.
  const spawnBall = (options) => {
  const bodyDef = new b2BodyDef();
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.bullet = true;
  bodyDef.position.Set(options.x, options.y);
  bodyDef.linearDamping = 0.5;
  bodyDef.angularDamping = 0.5;
  const ballBody = world.CreateBody(bodyDef);
  const fixDef = new b2FixtureDef();
  fixDef.shape = new b2CircleShape(0.19);
  fixDef.density = 1;
  fixDef.friction = .5;
  fixDef.restitution = 0.2;
  ballBody.CreateFixture(fixDef);
  ballBody.ResetMassData();
  
  // Include initial properties for name, degree, flairIndex, and auth.
  const data = {
    id: ballIdCounter++,
    controlled: options.canControl,
    hasFlag: false,
    team: options.team.toLowerCase(),
    startPos: new b2Vec2(options.x, options.y),
    canMove: true,
    sprite: null,
    sprites: {}, // For UI elements like name, degrees, flair, etc.
    name: options.name || "",
    degree: options.degree || 0,
    flairIndex: options.flairIndex || 0,
    auth: options.auth || false  // New property for authentication
  };
  ballBody.SetUserData(data);
  ballBody.hasFlag = data.hasFlag;
  
  let textureRect;
  if (data.team === 'red') textureRect = new PIXI.Rectangle(560, 0, 40, 40);
  else if (data.team === 'blue') textureRect = new PIXI.Rectangle(600, 0, 40, 40);
  else textureRect = new PIXI.Rectangle(560, 0, 40, 40);
  
  const baseTexture = PIXI.BaseTexture.from("https://static.koalabeast.com" + currentTexturePack.tiles);
  const ballTexture = new PIXI.Texture(baseTexture, textureRect);
  const ballSprite = new PIXI.Sprite(ballTexture);
  ballSprite.anchor.set(0.5);
  ballSprite.x = options.x * config.pixPerTPU;
  ballSprite.y = options.y * config.pixPerTPU;
  ballSprite.zIndex = 1;
  worldContainer.addChild(ballSprite);
  data.sprite = ballSprite;
  
  if (options.cameraFollow) window.cameraFollowBall = ballBody;
  return ballBody;
};


  // Spawn the red (controlled) ball.
  players.push(spawnBall({
    cameraFollow: true,
    canControl: true,
    team: 'red',
    x: (2 * config.tileSize - config.tileSize / 2) / config.pixPerTPU,
    y: (17 * config.tileSize + config.tileSize / 2) / config.pixPerTPU,
    // For controlled ball the UI will override these values from the input.
    name: "",
    degree: 0,
    flairIndex: selectedFlairIndex,
    auth: true,
  }));
  
  // Spawn the blue ball with the Bambot properties.
  players.push(spawnBall({
    cameraFollow: false,
    canControl: false,
    team: 'blue',
    x: (23 * config.tileSize + 20) / config.pixPerTPU,
    y: (2 * config.tileSize - 20) / config.pixPerTPU,
    name: "Bambot",
    degree: 69,
    flairIndex: 77,
    auth:true,
  }));
  
  for(let row = 0; row < tileMap.length; row++){
    for(let col = 0; col < tileMap[row].length; col++){
      if(tileMap[row][col] === 1){
        const wallBodyDef = new b2BodyDef();
        wallBodyDef.type = b2Body.b2_staticBody;
        wallBodyDef.position.Set(
          (col * config.tileSize + config.tileSize / 2) / config.pixPerTPU,
          (row * config.tileSize + config.tileSize / 2) / config.pixPerTPU
        );
        const wallBody = world.CreateBody(wallBodyDef);
        const wallFixDef = new b2FixtureDef();
        wallFixDef.shape = new b2PolygonShape();
        wallFixDef.shape.SetAsBox((config.tileSize / 2) / config.pixPerTPU, (config.tileSize / 2) / config.pixPerTPU);
        wallBody.CreateFixture(wallFixDef);
      }
    }
  }
  const disableCollisions = (body) => {
    let fixture = body.GetFixtureList();
    while(fixture){
      fixture.SetSensor(true);
      fixture = fixture.GetNext();
    }
  };
  const enableCollisions = (body) => {
    let fixture = body.GetFixtureList();
    while(fixture){
      fixture.SetSensor(false);
      fixture = fixture.GetNext();
    }
  };
  const createExplosionAt = (position, dyingBody) => {
    const blastRadius = 2.8;
    const strength = 12;
    let body = world.GetBodyList();
    while(body){
      const data = body.GetUserData();
      if(data && data.id && body !== dyingBody){
        const worldCenter = body.GetWorldCenter();
        const diff = new Box2D.Common.Math.b2Vec2(worldCenter.x - position.x, worldCenter.y - position.y);
        const distance = diff.Length();
        if(distance <= blastRadius && distance > 0){
          diff.Normalize();
          const speedBoost = 3.536 * 0.7;
          diff.Multiply(speedBoost);
          const currentVelocity = body.GetLinearVelocity();
          diff.Add(currentVelocity);
          body.SetLinearVelocity(diff);
        }
      }
      body = body.GetNext();
    }
  };

  const listener = new Box2D.Dynamics.b2ContactListener();
  listener.BeginContact = (contact) => {
    const fixtureA = contact.GetFixtureA();
    const fixtureB = contact.GetFixtureB();
    const bodyA = fixtureA.GetBody();
    const bodyB = fixtureB.GetBody();
    const dataA = bodyA.GetUserData();
    const dataB = bodyB.GetUserData();
    const worldManifold = new Box2D.Collision.b2WorldManifold();
    contact.GetWorldManifold(worldManifold);
    const cp = worldManifold.m_points[0];
    const contactPoint = new b2Vec2(cp.x, cp.y);

    if(dataA && dataB && dataA.hasFlag !== undefined && dataB.hasFlag !== undefined){
      if(dataA.team !== dataB.team){
        // If player A is dying/popping:
        if(dataA.hasFlag && !dataB.hasFlag){
          if(!dataB.canMove) return;
          dataA.canMove = false;
          const friendlyDropAudio = new Audio("friendlydrop.mp3");
          friendlyDropAudio.play();
          const alertAudio = new Audio("alert.mp3");
          alertAudio.volume = 0.3;
          alertAudio.play();
          createExplosionAt(contactPoint, bodyA);
          if(dataA.sprite){ dataA.sprite.visible = false; }
          // Hide UI elements for player A
          if(dataA.sprites){
            if(dataA.sprites.name) dataA.sprites.name.visible = false;
            if(dataA.sprites.degrees) dataA.sprites.degrees.visible = false;
            if(dataA.sprites.flair) dataA.sprites.flair.visible = false;
          }
          disableCollisions(bodyA);
          dataA.hasFlag = false;
          dataB.hasFlag = true;
          bodyA.hasFlag = dataA.hasFlag;
          bodyB.hasFlag = dataB.hasFlag;
          flag.carrier = bodyB;
          console.log("Flag stolen: " + dataB.team + " team now has the flag.");
          if(!dataA.isRespawning){
            dataA.isRespawning = true;
            setTimeout(() => {
              bodyA.SetPosition(dataA.startPos);
              bodyA.SetLinearVelocity(new b2Vec2(0,0));
              if(dataA.sprite){ dataA.sprite.visible = true; }
              // Optionally, show UI again upon respawn:
              if(dataA.sprites){
                if(dataA.sprites.name) dataA.sprites.name.visible = true;
                if(dataA.sprites.degrees) dataA.sprites.degrees.visible = true;
                if(dataA.sprites.flair) dataA.sprites.flair.visible = true;
              }
              enableCollisions(bodyA);
              dataA.isRespawning = false;
              dataA.canMove = true;
            }, 3000);
          }
        }
        // If player B is dying/popping:
        else if(dataB.hasFlag && !dataA.hasFlag){
          if(!dataA.canMove) return;
          dataB.canMove = false;
          const dropAudio = new Audio("drop.mp3");
          dropAudio.play();
          const falertAudio = new Audio("friendlyalert.mp3");
          falertAudio.volume = 0.5;
          falertAudio.play();
          createExplosionAt(contactPoint, bodyB);
          if(dataB.sprite){ dataB.sprite.visible = false; }
          // Hide UI elements for player B
          if(dataB.sprites){
            if(dataB.sprites.name) dataB.sprites.name.visible = false;
            if(dataB.sprites.degrees) dataB.sprites.degrees.visible = false;
            if(dataB.sprites.flair) dataB.sprites.flair.visible = false;
          }
          disableCollisions(bodyB);
          dataB.hasFlag = false;
          dataA.hasFlag = true;
          bodyB.hasFlag = dataB.hasFlag;
          bodyA.hasFlag = dataA.hasFlag;
          flag.carrier = bodyA;
          console.log("Flag stolen: " + dataA.team + " team now has the flag.");
          if(!dataB.isRespawning){
            dataB.isRespawning = true;
            setTimeout(() => {
              bodyB.SetPosition(dataB.startPos);
              bodyB.SetLinearVelocity(new b2Vec2(0,0));
              if(dataB.sprite){ dataB.sprite.visible = true; }
              // Optionally, show UI again upon respawn:
              if(dataB.sprites){
                if(dataB.sprites.name) dataB.sprites.name.visible = true;
                if(dataB.sprites.degrees) dataB.sprites.degrees.visible = true;
                if(dataB.sprites.flair) dataB.sprites.flair.visible = true;
              }
              enableCollisions(bodyB);
              dataB.isRespawning = false;
              dataB.canMove = true;
            }, 3000);
          }
        }
      }
    }

    if((dataA && dataA.controlled) || (dataB && dataB.controlled)){
      const controlledBody = dataA && dataA.controlled ? bodyA : bodyB;
      const tangent = new b2Vec2(-worldManifold.m_normal.y, worldManifold.m_normal.x);
      const velocity = controlledBody.GetLinearVelocity();
      const dot = velocity.x * tangent.x + velocity.y * tangent.y;
      const sign = (dot >= 0) ? 1 : -1;
      const speed = velocity.Length();
      const ballRadius = 19 / config.pixPerTPU;
      const expectedAngularVel = sign * (speed / ballRadius);
      const currentAngularVel = controlledBody.GetAngularVelocity();
      const adjustmentFactor = 0.11;
      const newAngularVel = currentAngularVel + adjustmentFactor * (expectedAngularVel - currentAngularVel);
      controlledBody.SetAngularVelocity(newAngularVel);
    }
  };
  world.SetContactListener(listener);

  const drawWallTile = (ctx, col, row) => {
    const tileCode = tileMap[row][col];
    const wt = wallTypes[tileCode];
    if(!wt) return;
    const solids = wt.wallSolids;
    for(let q = 0; q < 4; q++){
      const mask = (solids >> (q << 1)) & 3;
      if(mask === 0) continue;
      const cornerX = col + ((q & 2) === 0 ? 1 : 0);
      const cornerY = row + ((((q+1) & 2) === 0 ? 0 : 1));
      let aroundCorner =
        (wallSolidsAt(cornerX, cornerY) & 0xc0) |
        (wallSolidsAt(cornerX-1, cornerY) & 0x03) |
        (wallSolidsAt(cornerX-1, cornerY-1) & 0x0c) |
        (wallSolidsAt(cornerX, cornerY-1) & 0x30);
      aroundCorner |= (aroundCorner << 8);
      const startDirection = q * 2 + 1;
      let cwSteps = 0;
      while(cwSteps < 8 && (aroundCorner & (1 << (startDirection+cwSteps)))){ cwSteps++; }
      let ccwSteps = 0;
      while(ccwSteps < 8 && (aroundCorner & (1 << (startDirection+7-ccwSteps)))){ ccwSteps++; }
      const hasChip = (mask === 3 && (((solids | (solids << 8)) >> ((q+2) << 1)) & 3) === 0);
      let solidStart, solidEnd;
      if(cwSteps === 8){
        solidStart = solidEnd = 0;
      } else {
        solidEnd = (startDirection+cwSteps+4)%8;
        solidStart = (startDirection-ccwSteps+12)%8;
      }
      const key = `${q}${solidStart}${solidEnd}${hasChip ? "d" : ""}`;
      const coords = quadrantCoords[key] || [5.5, 5.5];
      let destX = col * config.tileSize;
      let destY = row * config.tileSize;
      if(q === 0) destX += config.quadSize;
      else if(q === 1){ destX += config.quadSize; destY += config.quadSize; }
      else if(q === 2) destY += config.quadSize;
      const srcX = coords[0]*40;
      const srcY = coords[1]*40;
      ctx.drawImage(tileImage, srcX, srcY, config.quadSize, config.quadSize, destX, destY, config.quadSize, config.quadSize);
    }
  };

  const drawMapOnCanvas = (ctx) => {
    ctx.clearRect(0,0, mapCanvas.width, mapCanvas.height);
    for(let r = 0; r < tileMap.length; r++){
      for(let c = 0; c < tileMap[r].length; c++){
        const x = c * config.tileSize;
        const y = r * config.tileSize;
        const tileType = tileMap[r][c];
        if(tileType === 6){
          const tile = tiles[6];
          ctx.drawImage(tileImage, tile.sx, tile.sy, config.tileSize, config.tileSize, x, y, config.tileSize, config.tileSize);
        } else {
          drawWallTile(ctx, c, r);
        }
      }
    }
  };

  const updateTexturePack = (selectedPack) => {
    currentTexturePack = selectedPack;
    tileImage.src = "https://static.koalabeast.com" + selectedPack.tiles + "?t=" + Date.now();
    tileImage.onload = () => {
      drawMapOnCanvas(mapCtx);
      if(mapSprite){
        mapSprite.texture = new PIXI.Texture(new PIXI.BaseTexture(mapCanvas));
      }
    };
    const baseTextureForFlag = PIXI.BaseTexture.from("https://static.koalabeast.com" + selectedPack.tiles);
    const flagRect = flag.taken ? new PIXI.Rectangle(520,80,40,40) : new PIXI.Rectangle(520,40,40,40);
    if(flagSprite) flagSprite.texture = new PIXI.Texture(baseTextureForFlag, flagRect);
    const miniFlagRect = new PIXI.Rectangle(520,40,40,40);
    if(miniFlagSprite) miniFlagSprite.texture = new PIXI.Texture(baseTextureForFlag, miniFlagRect);
    players.forEach(player => {
      const data = player.GetUserData();
      let textureRect;
      if(data.team === 'red') textureRect = new PIXI.Rectangle(560,0,40,40);
      else if(data.team === 'blue') textureRect = new PIXI.Rectangle(600,0,40,40);
      else textureRect = new PIXI.Rectangle(560,0,40,40);
      const baseTexture = PIXI.BaseTexture.from("https://static.koalabeast.com" + selectedPack.tiles);
      const ballTexture = new PIXI.Texture(baseTexture, textureRect);
      if(data.sprite) data.sprite.texture = ballTexture;
    });
  };

  const keys = {};
  window.addEventListener("keydown", (e) => {
    if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) e.preventDefault();
    keys[e.key] = true;
  });
  window.addEventListener("keyup", (e) => {
    if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) e.preventDefault();
    keys[e.key] = false;
  });

  // ------------------------------------------------------------------
  // Main ticker loop
 let accumulator = 0;

app.ticker.add((delta) => {
  // Convert elapsed time from milliseconds to seconds.
  const dt = app.ticker.deltaMS / 1000;
  accumulator += dt;

  // Process input for each player.
  players.forEach(player => {
    const data = player.GetUserData();
    if (data.canMove) {
      const currentVel = player.GetLinearVelocity();
      const newVel = new b2Vec2(currentVel.x, currentVel.y);
      if (data.controlled) {
        if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
          if (newVel.x > -config.maxSpeed) newVel.x -= config.acceleration;
        }
        if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
          if (newVel.x < config.maxSpeed) newVel.x += config.acceleration;
        }
        if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
          if (newVel.y > -config.maxSpeed) newVel.y -= config.acceleration;
        }
        if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
          if (newVel.y < config.maxSpeed) newVel.y += config.acceleration;
        }
      }
      // Additional directional properties, if any.
      if (player.left)  { if (newVel.x > -config.maxSpeed) newVel.x -= config.acceleration; }
      if (player.right) { if (newVel.x < config.maxSpeed) newVel.x += config.acceleration; }
      if (player.up)    { if (newVel.y > -config.maxSpeed) newVel.y -= config.acceleration; }
      if (player.down)  { if (newVel.y < config.maxSpeed) newVel.y += config.acceleration; }
      player.SetLinearVelocity(newVel);
      player.SetAwake(true);
    } else {
      player.SetLinearVelocity(new b2Vec2(0, 0));
    }
  });

  // Step the physics world in fixed increments.
  while (accumulator >= config.baseDT) {
    world.Step(config.baseDT, 8, 3);
    accumulator -= config.baseDT;
  }
  world.ClearForces();

  // Update each player's sprite position based on their physics body.
  players.forEach(player => {
    const pos = player.GetPosition();
    const sprite = player.GetUserData().sprite;
    sprite.x = pos.x * config.pixPerTPU;
    sprite.y = pos.y * config.pixPerTPU;
    sprite.rotation = player.GetAngle();
  });

  // Update the UI elements (name, degree, flair) for each player.
  updatePlayerUI();

  // Center the camera on the controlled player's ball.
  const controlledPlayer = players.find(p => p.GetUserData().controlled);
  if (controlledPlayer) {
    const cs = controlledPlayer.GetUserData().sprite;
    worldContainer.x = app.screen.width / 2 - cs.x;
    worldContainer.y = app.screen.height / 2 - cs.y;
  }

  // Flag pickup logic.
  if (!flag.taken && flagSprite) {
    const pickupDistance = 15 + 19;
    players.forEach(player => {
      const pos = player.GetPosition();
      const x = pos.x * config.pixPerTPU;
      const y = pos.y * config.pixPerTPU;
      const dx = x - flag.x;
      const dy = y - flag.y;
      if (Math.sqrt(dx * dx + dy * dy) < pickupDistance) {
        flag.taken = true;
        player.GetUserData().hasFlag = true;
        player.hasFlag = true;
        flag.carrier = player;
        const baseTexture = PIXI.BaseTexture.from("https://static.koalabeast.com" + currentTexturePack.tiles);
        flagSprite.texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(520, 80, 40, 40));
        console.log(player.GetUserData().team + " team picked up the flag from the ground.");
        const audio = new Audio(player.GetUserData().team === 'red' ? "friendlyalert.mp3" : "alert.mp3");
        audio.volume = 0.5;
        audio.play();
      }
    });
  }

  // Update the mini flag sprite so it follows the flag carrier.
  if (miniFlagSprite) {
    if (flag.carrier) {
      miniFlagSprite.visible = true;
      const carrierSprite = flag.carrier.GetUserData().sprite;
      miniFlagSprite.x = carrierSprite.x;
      miniFlagSprite.y = carrierSprite.y - carrierSprite.height / 2 - 10;
    } else {
      miniFlagSprite.visible = false;
    }
  }
});

  // ------------------------------------------------------------------

  window.balls = players;

}
window.addEventListener('load', initGame);
