const vikingGame = {
  name: undefined,
  description: undefined,
  version: "1.0.0",
  licence: undefined,
  author: "Daniel Y. and Juan R.",
  canvasTag: undefined,
  ctx: undefined,
  intervalID: undefined,
  canvasSize: {
    w: 1024,
    h: 768,
  },
  actualLevel: 1,
  levels: [],
  floors: [],
  stairs: [],
  doors: [],
  characters: [],
  enemies: [],
  arrows: [],
  keysItems: [],
  keys: {
    CTRL: "Control",
    SPACE: " ",
    LEFT: "ArrowLeft",
    UP: "ArrowUp",
    RIGHT: "ArrowRight",
    DOWN: "ArrowDown",
    A: "A",
    D: "D",
    S: "S",
    W: "W",
  },
  keysStatus: {
    TAB: undefined,
    SPACE: undefined,
    LEFT: undefined,
    UP: undefined,
    RIGHT: undefined,
    DOWN: undefined,
    A: undefined,
    D: undefined,
    S: undefined,
    W: undefined,
  },
  FPS: 360,
  framesCounter: 0,
  changeCharacterCount: 1,

  init() {
    setEventListeners(this.keys);
    this.setContext();
    this.setDimensions();
    this.createLevels();
    this.saveFloors();
    this.saveStairs();
    this.saveKeysItems();
    this.saveDoors();
    this.createEnemies();
    this.createCharacters();
    this.start();
  },

  setContext() {
    this.canvasTag = document.querySelector("canvas");
    this.ctx = this.canvasTag.getContext("2d");
  },

  setDimensions() {
    this.canvasTag.setAttribute("width", this.canvasSize.w);
    this.canvasTag.setAttribute("height", this.canvasSize.h);
  },

  createLevels() {
    this.levels.push(new Background(this.ctx, this.canvasSize));
    this.levels.push(new Level1(this.ctx, this.canvasSize));
    this.levels.push(new Level2(this.ctx, this.canvasSize));
    this.levels.push(new Level3(this.ctx, this.canvasSize));
  },

  createEnemies() {
    this.enemies.push(
      new Sentinel(
        this.ctx,
        this.canvasSize,
        100,
        450,
        50,
        50,
        100,
        this.actualLevel,
        "right",
        "./img/sentinel/sentinelRight.png",
        8
      )
    );

    this.enemies.push(
      new Skeleton(
        this.ctx,
        this.canvasSize,
        400,
        300,
        40,
        40,
        100,
        this.actualLevel,
        "./img/pork/porkRigth.png",
        12
      )
    );
  },

  createCharacters() {
    this.characters.push(
      new Viking1(
        this.ctx,
        this.canvasSize,
        "./img/ninjaIdle.png",
        11,
        50,
        50,
        this.actualLevel,
        this.floors,
        this.stairs,
        this.doors,
        this.keysItems,
        this.enemyArrows
      )
    );
    this.characters.push(
      new Viking2(
        this.ctx,
        this.canvasSize,
        "./img/turtleRight.png",
        14,
        50,
        50,
        this.actualLevel,
        this.floors,
        this.stairs,
        this.doors,
        this.keysItems,
        this.enemyArrows
      )
    );
    this.characters.push(
      new Viking3(
        this.ctx,
        this.canvasSize,
        "./img/trunk/trunkIdle.png",
        18,
        80,
        50,
        this.actualLevel,
        this.floors,
        this.stairs,
        this.doors,
        this.keysItems,
        this.enemyArrows,
        this.arrows
      )
    );
  },

  changeCharacter(changeCharacterCount) {
    this.characters.forEach((character) => (character.status = false));
    this.characters[changeCharacterCount].status = true;
  },

  moveCharacters() {
    this.characters.forEach((e) => {
      e.status === true && e.move(this.keysStatus);
    });
  },

  useHability() {
    if (this.keysStatus.SPACE === true && this.characters[0].status === true) {
      this.characters[0].checkJump(this.keysStatus);
      this.characters[0].jump();
    }
    if (this.framesCounter % 100 === 0) {
      if (
        this.keysStatus.SPACE === true &&
        this.keysStatus.RIGHT === true &&
        this.characters[2].status === true
      ) {
        this.characters[2].attack("right");
      } else if (
        this.keysStatus.SPACE === true &&
        this.keysStatus.LEFT === true &&
        this.characters[2].status === true
      ) {
        this.characters[2].attack("left");
      }
    }
  },

  saveFloors() {
    this.levels.forEach((e) => this.floors.push(e.floors));
  },

  saveStairs() {
    this.levels.forEach((e) => this.stairs.push(e.stairs));
  },

  saveKeysItems() {
    this.levels.forEach((e) => this.keysItems.push(e.keysItems));
  },

  saveDoors() {
    this.levels.forEach((level) => this.doors.push(level.doors));
  },

  checkDoors() {
    let charactersInDoor = 0;
    this.characters.forEach((character) => {
      character.isInDoor() && charactersInDoor++;
    });
    return charactersInDoor === this.characters.length;
  },

  takeKeysItem() {
    if (this.characters.some((element) => element.checkKey())) {
      this.characters.forEach((character) => {
        character.haveKey = true;
      });

      this.levels[this.actualLevel].keysItems.splice(0, 1);
    }
  },

  finishLevel() {
    return this.checkDoors() &&
      this.characters.some((character) => character.haveKey)
      ? true
      : false;
  },

  checkHitBoxTwoElements(characters, enemyArrows) {
    let colisionArray = undefined;
    characters.forEach((character) => {
      if (enemyArrows.length >= 1) {
        if (getHitBoxElements(enemyArrows, character))
          colisionArray = getHitBoxElements(enemyArrows, character);
      }
    });
    return colisionArray;
  },

  limitatePositionCharacter(characters, enemies) {
    characters.forEach((character) => {
      enemies.forEach((enemy) => {
        character.position.x - character;
      });
    });
  },

  removeArrow(enemyElement, arrow) {
    const arrowIndex = enemyElement.arrows.indexOf(arrow);
    if (arrowIndex !== -1) {
      enemyElement.arrows.splice(arrowIndex, 1);
    }
  },

  receiveDamage(characters, enemy, enemyElement) {
    if (enemyElement) {
      if (this.checkHitBoxTwoElements(characters, enemy)) {
        const colisionObject = this.checkHitBoxTwoElements(characters, enemy);
        const arrow = colisionObject[0][0];
        const character = colisionObject[1][0];
        this.removeArrow(enemyElement, arrow);
        if (character.isVulnerable) {
          character.lives -= 1;
          character.isVulnerable = false;
          setTimeout(() => {
            character.isVulnerable = true;
          }, 2000);
        }
      }
    } else {
      if (this.checkHitBoxTwoElements(characters, enemy)) {
        const colisionObject = this.checkHitBoxTwoElements(characters, enemy);
        const character = colisionObject[1][0];
        if (character.isVulnerable) {
          character.lives -= 1;
          character.isVulnerable = false;
          setTimeout(() => {
            character.isVulnerable = true;
          }, 2000);
        }
      }
    }
  },

  changeVulnerability(character) {},

  start() {
    const intervalID = setInterval(() => {
      this.framesCounter > 6001
        ? (this.framesCounter = 0)
        : this.framesCounter++;
      this.clearAll();
      this.finishLevel() && this.actualLevel++;

      this.drawAll();
      this.moveCharacters();
      this.useHability();
    }, 1000 / this.FPS);
    this.intervalID = intervalID;
  },

  drawAll() {
    this.levels[0].init();
    this.levels[this.actualLevel].init();
    this.takeKeysItem();
    this.characters[0].init(this.framesCounter);
    this.characters[1].init(this.framesCounter);
    this.characters[2].init(this.framesCounter);
    this.characters[2].arrows.forEach((e) => e.init());
    this.enemies[0].init(this.framesCounter);
    this.enemies[1].init(this.framesCounter);
    // this.receiveDamage(
    //   this.characters,
    //   this.enemies[0].arrows,
    //   this.enemies[0]
    // );
    this.receiveDamage(this.characters, this.enemies);
  },

  clearAll() {
    this.ctx.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
  },
};
