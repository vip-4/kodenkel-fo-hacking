(() => {
  // src/data/CachedJSONData.ts
  var CachedJSONData = class {
    constructor(url) {
      this.filename = url.substring(url.lastIndexOf("/") + 1);
      let dataInStorage = JSON.parse(window.localStorage.getItem(this.filename));
      if (dataInStorage !== null) {
        this.data = dataInStorage;
        return;
      }
      (async () => {
        await fetch(url).then((v) => {
          v.text().then((text) => {
            dataInStorage = JSON.parse(text);
            window.localStorage.setItem(this.filename, JSON.stringify(dataInStorage));
            this.data = dataInStorage;
          });
        });
      })();
    }
    getStringByKey(key) {
      return this.data[key];
    }
    getArrayByKey(key) {
      return this.data[key];
    }
  };

  // src/graphics/DrawingSurface.ts
  var _DrawingSurface = class {
    constructor(width, height, id) {
      this.width = width;
      this.height = height;
      if (document.querySelector("#" + id) !== null) {
        throw new Error(`Element id "${id}" is already in use!`);
      }
      this.canvasElement = document.createElement("canvas");
      this.canvasElement.setAttribute("width", width.toString());
      this.canvasElement.setAttribute("height", height.toString());
      this.canvasElement.setAttribute("id", id);
      this.parentElement = document.querySelector("#border");
      this.parentElement.appendChild(this.canvasElement);
      this.context = this.canvasElement.getContext("2d");
      this.clear();
    }
    registerFont(name) {
      let customFont = new FontFace(name, `url(assets/fonts/${name}.ttf)`);
      customFont.load().then(function(font) {
        document.fonts.add(font);
      });
    }
    getCanvasElement() {
      return this.canvasElement;
    }
    getWidth() {
      return this.width;
    }
    getHeight() {
      return this.height;
    }
    clear() {
      this.context.fillStyle = _DrawingSurface.clearBackgroundColor;
      this.context.clearRect(0, 0, this.width, this.height);
    }
    drawText(text, positionX, positionY, font = "serif", fontSize = 12, color = "white") {
      this.context.fillStyle = color;
      this.context.font = `${fontSize.toString()}px '${font}'`;
      this.context.fillText(text, positionX, positionY);
    }
    drawRectangle(x, y, width, height, color = "white") {
      this.context.fillStyle = color;
      this.context.fillRect(x, y, width, height);
    }
    drawImage(image, positionX, positionY, width = null, height = null) {
      if (width === null)
        width = image.width;
      if (height === null)
        height = image.height;
      this.context.drawImage(image, positionX, positionY, width, height);
    }
    onMouseMove(handler) {
      this.canvasElement.addEventListener("mousemove", handler);
    }
    onClick(handler) {
      this.canvasElement.addEventListener("click", handler);
    }
  };
  var DrawingSurface = _DrawingSurface;
  DrawingSurface.clearBackgroundColor = "black";

  // src/UserAgent.ts
  var UserAgent = class {
    static hasTouchScreen() {
      var hasTouchScreen = false;
      if ("maxTouchPoints" in navigator) {
        hasTouchScreen = navigator.maxTouchPoints > 0;
      } else if ("msMaxTouchPoints" in navigator) {
        hasTouchScreen = navigator.msMaxTouchPoints > 0;
      } else {
        var mQ = window.matchMedia && matchMedia("(pointer:coarse)");
        if (mQ && mQ.media === "(pointer:coarse)") {
          hasTouchScreen = !!mQ.matches;
        } else if ("orientation" in window) {
          hasTouchScreen = true;
        } else {
          var UA = navigator.userAgent;
          hasTouchScreen = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
        }
      }
      return hasTouchScreen;
    }
  };

  // src/main.ts
  var Application = class {
    constructor() {
      this.maxFPS = 21;
      this.frameTimestamp = Date.now();
      this.isMobile = UserAgent.hasTouchScreen();
      this.wordLength = 5;
      this.wordCount = 0;
      this.charHorizontal = 22;
      this.charVertical = 53;
      this.lines = [];
      this.statusLines = [];
      this.attemptsLeft = 4;
      this.charMouseX = 0;
      this.charMouseY = 0;
      this.passwords = {};
      this.addresses = [
        "0xF964",
        "0xF970",
        "0xF97C",
        "0xF988",
        "0xF994",
        "0xF9A0",
        "0xF9AC",
        "0xF9B8",
        "0xF9C4",
        "0xF9D0",
        "0xF9DC",
        "0xF9E8",
        "0xF9F4",
        "0xFA00",
        "0xFA0C",
        "0xFA18",
        "0xFA24",
        "0xFA30",
        "0xFA3C",
        "0xFA48",
        "0xFA54",
        "0xFA60",
        "0xFA6C",
        "0xFA78",
        "0xFA84",
        "0xFA90",
        "0xFA9C",
        "0xFAA8",
        "0xFAB4",
        "0xFAC0",
        "0xFACC",
        "0xFAD8",
        "0xFAE4",
        "0xFAF0"
      ];
      this.punctuation = [
        "<",
        ">",
        "{",
        "}",
        "(",
        ")",
        "=",
        "$",
        ",",
        "'",
        ";",
        ":",
        "_",
        '"',
        "!",
        "[",
        "]",
        "^",
        "#",
        "|",
        "+",
        "-",
        "*",
        "@",
        "\\",
        "/",
        "%"
      ];
      this.punctuationNonBlocky = [
        "=",
        "$",
        ",",
        "'",
        ";",
        ":",
        "_",
        '"',
        "!",
        "^",
        "#",
        "|",
        "+",
        "-",
        "*",
        "@",
        "\\",
        "/",
        "%"
      ];
      this.gaussY = -1;
      this.displayHighlightImage = new Image(640, 480);
      this.displayHighlightImage.src = "assets/images/display-highlight.png";
      this.displayGaussImage = new Image(640, 120);
      this.displayGaussImage.src = "assets/images/display-gauss.png";
      this.data = new CachedJSONData("fo-hacking-data.json");
      this.canvas = new DrawingSurface(640, 480, "fo-hacking");
      this.canvas.registerFont("VCR_OSD_MONO_1.001");
      this.FPSCounter = document.querySelector("#fps");
      document.querySelector("#reset").addEventListener("click", () => {
        this.reset();
      });
      document.querySelector("#letters").addEventListener("change", (event) => {
        this.wordLength = parseInt(event.target.value);
        this.reset();
      });
      document.querySelector("#help").addEventListener("click", () => {
        window.open("https://fallout.fandom.com/wiki/Hacking_(Fallout_3)", "_blank");
      });
      this.canvas.onMouseMove((event) => {
        this.onMouseMove(event);
      });
      this.canvas.onClick((event) => {
        this.onMouseMove(event);
        this.drawCharHighlight();
        if (this.gameState === GameState.ATTEMPT) {
          if (this.highlightedWord !== null && this.gameState === GameState.ATTEMPT) {
            if (this.highlightedWord === this.correctPassword) {
              this.appendStatusLines(["", "is accessed.", "while system", "Please wait", "Exact match!", ""]);
              this.lines[1] = "";
              this.lines[3] = "ACCESS GRANTED";
              this.gameState = GameState.MATCH;
            } else {
              let numCorrect = 0;
              for (let i = 0; i < this.correctPassword.length; i++) {
                if (this.correctPassword.charAt(i) === this.highlightedWord.charAt(i))
                  numCorrect++;
              }
              this.appendStatusLines(["", `>${numCorrect.toString()}/${this.wordLength} correct.`, ">Entry denied", ">" + this.highlightedWord.toUpperCase()]);
              this.deductAttempt();
            }
          }
          if (this.highlightedBlockStart !== null && this.highlightedBlockEnd !== null) {
            let wordSoupPos = this.wordSoupPosToCharAbs(this.highlightedBlockStart);
            let substituteText = "";
            for (let i = 0; i < this.highlightedBlockEnd - this.highlightedBlockStart; i++) {
              substituteText += this.punctuationNonBlocky[Math.floor(Math.random() * this.punctuationNonBlocky.length)];
            }
            this.lines[wordSoupPos.y] = this.lines[wordSoupPos.y].substring(0, wordSoupPos.x) + substituteText + this.lines[wordSoupPos.y].substring(wordSoupPos.x + substituteText.length);
            if (Math.floor(Math.random() * 3) < 1) {
              this.resetTries();
            } else {
              if (Object.keys(this.passwords).length > 1) {
                this.removeDud();
              } else {
                this.resetTries();
              }
            }
          }
        }
      });
      if (this.isMobile) {
        window.addEventListener("deviceorientation", () => {
          this.onDeviceOrientation();
        }, true);
        this.onDeviceOrientation();
      }
      setTimeout(() => {
        this.reset();
        this.draw(1e3 / this.maxFPS);
      }, 1200);
    }
    draw(refreshPeriod) {
      this.FPSCounter.innerText = "FPS: " + Math.ceil(1e3 / (Date.now() - this.frameTimestamp)).toString();
      this.frameTimestamp = Date.now();
      setTimeout(() => {
        this.canvas.clear();
        let bandColorDark = "#0b1f10";
        let bandColorLight = "#162918";
        for (let by = 0; by < 240; by++) {
          this.canvas.drawRectangle(0, by * 2, 640, by * 2 + 2, by % 2 ? bandColorDark : bandColorLight);
        }
        this.drawCharHighlight();
        for (let y = 0; y < this.charHorizontal; y++) {
          this.canvas.drawText(this.lines[y], 15, 21 + 21 * y, "VCR_OSD_MONO_1.001", 21, "#36fc9b");
          if (y >= 5 && this.statusLines.length >= this.charHorizontal - y) {
            this.canvas.drawText(this.statusLines[this.charHorizontal - y - 1], 480, 21 + 21 * y, "VCR_OSD_MONO_1.001", 21, "#36fc9b");
          }
        }
        if (this.gaussY === -1 && Math.floor(Math.random() * 70) === 0) {
          this.gaussY = 0;
        }
        if (this.gaussY > -1) {
          this.canvas.drawImage(this.displayGaussImage, 0, Math.floor(this.gaussY), 640, 120);
          this.gaussY += 6;
          if (this.gaussY >= 480)
            this.gaussY = -1;
        }
        this.canvas.drawImage(this.displayHighlightImage, 0, 0);
        this.draw(refreshPeriod);
      }, refreshPeriod);
    }
    onMouseMove(event) {
      let canvasElement = this.canvas.getCanvasElement().getBoundingClientRect();
      let scaleX = this.canvas.getWidth() / canvasElement.width;
      let scaleY = this.canvas.getHeight() / canvasElement.height;
      this.charMouseX = Math.ceil((event.clientX - canvasElement.left) * scaleX / 12.3) - 2;
      this.charMouseY = Math.ceil((event.clientY - canvasElement.top) * scaleY / 21) - 1;
    }
    drawCharHighlight() {
      if (this.charMouseX >= 7 && this.charMouseX <= 17 && this.charMouseY >= 5 && this.charMouseY <= 21 || this.charMouseX >= 26 && this.charMouseX <= 36 && this.charMouseY >= 5 && this.charMouseY <= 21) {
        this.highlightCharAbs(this.charMouseX, this.charMouseY);
      }
    }
    highlightCharAbs(x, y) {
      this.canvas.drawRectangle(Math.ceil(x * 12.3) + 15, y * 21, 13, 21, "white");
      let cursorPos = this.charAbsToWordSoupPos(x, y);
      this.highlightedWord = null;
      if (this.gameState === GameState.ATTEMPT)
        this.statusLines[0] = ">" + this.lines[y][x];
      if (cursorPos === null)
        return;
      Object.keys(this.passwords).forEach((startPos2) => {
        let password = this.passwords[parseInt(startPos2)];
        let endPos2 = parseInt(startPos2) + password.length;
        if (cursorPos >= parseInt(startPos2) && cursorPos < endPos2) {
          for (let i = parseInt(startPos2); i < endPos2; i++) {
            let wordSoupPos = this.wordSoupPosToCharAbs(i);
            this.canvas.drawRectangle(Math.ceil(wordSoupPos.x * 12.3) + 15, wordSoupPos.y * 21, 13, 21, "white");
          }
          this.highlightedWord = password;
          if (this.gameState === GameState.ATTEMPT)
            this.statusLines[0] = ">" + password;
        }
      });
      this.highlightedBlockStart = null;
      this.highlightedBlockEnd = null;
      let startPos = this.charAbsToWordSoupPos(x, y);
      let endPos = null;
      for (let lx = x; lx < this.charVertical; lx++) {
        if (this.lines[y].charAt(lx) === " " || this.lines[y].charAt(lx).match(/[a-zA-Z]/i))
          break;
        if (this.lines[y].charAt(x) === "(" && this.lines[y].charAt(lx) === ")") {
          endPos = this.charAbsToWordSoupPos(lx, y) + 1;
          break;
        }
        if (this.lines[y].charAt(x) === "[" && this.lines[y].charAt(lx) === "]") {
          endPos = this.charAbsToWordSoupPos(lx, y) + 1;
          break;
        }
        if (this.lines[y].charAt(x) === "<" && this.lines[y].charAt(lx) === ">") {
          endPos = this.charAbsToWordSoupPos(lx, y) + 1;
          break;
        }
        if (this.lines[y].charAt(x) === "{" && this.lines[y].charAt(lx) === "}") {
          endPos = this.charAbsToWordSoupPos(lx, y) + 1;
          break;
        }
      }
      if (endPos === null) {
        for (let lx = x; lx > 0; lx--) {
          if (this.lines[y].charAt(lx) === " " || this.lines[y].charAt(lx).match(/[a-zA-Z]/i))
            break;
          if (this.lines[y].charAt(x) === ")" && this.lines[y].charAt(lx) === "(") {
            endPos = this.charAbsToWordSoupPos(lx, y);
            break;
          }
          if (this.lines[y].charAt(x) === "]" && this.lines[y].charAt(lx) === "[") {
            endPos = this.charAbsToWordSoupPos(lx, y);
            break;
          }
          if (this.lines[y].charAt(x) === ">" && this.lines[y].charAt(lx) === "<") {
            endPos = this.charAbsToWordSoupPos(lx, y);
            break;
          }
          if (this.lines[y].charAt(x) === "}" && this.lines[y].charAt(lx) === "{") {
            endPos = this.charAbsToWordSoupPos(lx, y);
            break;
          }
        }
      }
      if (endPos !== null) {
        if (startPos < endPos) {
          this.highlightedBlockStart = startPos;
          this.highlightedBlockEnd = endPos;
          for (let i = startPos; i < endPos; i++) {
            let wordSoupPos = this.wordSoupPosToCharAbs(i);
            this.canvas.drawRectangle(Math.ceil(wordSoupPos.x * 12.3) + 15, wordSoupPos.y * 21, 13, 21, "white");
          }
        } else {
          this.highlightedBlockStart = endPos;
          this.highlightedBlockEnd = startPos + 1;
          for (let i = endPos; i < startPos; i++) {
            let wordSoupPos = this.wordSoupPosToCharAbs(i);
            this.canvas.drawRectangle(Math.ceil(wordSoupPos.x * 12.3) + 15, wordSoupPos.y * 21, 13, 21, "white");
          }
        }
      }
    }
    charAbsToWordSoupPos(x, y) {
      if (y < 5 || y > 21)
        return null;
      if (x >= 7 && x <= 17) {
        return x - 7 + (y - 5) * 11;
      } else if (x >= 26 && x <= 36) {
        return x - 26 + (y - 5) * 11 + 187;
      } else {
        return null;
      }
    }
    wordSoupPosToCharAbs(pos) {
      if (pos < 187) {
        return {
          x: 7 + Math.floor(pos % 11),
          y: 5 + Math.floor(pos / 11)
        };
      } else {
        return {
          x: 26 + Math.floor((pos - 187) % 11),
          y: 5 + Math.floor((pos - 187) / 11)
        };
      }
    }
    appendStatusLines(lines) {
      this.statusLines = lines.concat(this.statusLines.slice(1, this.statusLines.length));
    }
    deductAttempt() {
      let tries = parseInt(this.lines[3].slice(0, 1));
      if (tries > 0) {
        this.lines[3] = this.lines[3].slice(0, -2);
        this.lines[3] = (tries - 1).toString() + this.lines[3].slice(1, this.lines[3].length);
      }
      if (tries === 2) {
        this.lines[1] = "!!! WARNING: LOCKOUT IMMINENT !!!";
      }
      if (tries === 1) {
        this.gameState = GameState.LOCKOUT;
        this.lines[1] = "";
        this.lines[3] = "PERMISSION DENIED. Lockout initiated.";
        this.appendStatusLines(["", ">DENIED", ">PERMISSION"]);
      }
    }
    reset() {
      this.passwords = {};
      this.gameState = GameState.ATTEMPT;
      this.statusLines = [];
      let attemptBlocks = "";
      for (let i = 0; i < this.attemptsLeft; i++) {
        attemptBlocks += " \u220E";
      }
      this.lines = [];
      this.lines.push("kodenkel (TM) RETCON PROTOCOL");
      this.lines.push("ENTER PASSWORD NOW");
      this.lines.push("");
      this.lines.push(this.attemptsLeft.toString() + " ATTEMPT(S) LEFT: " + attemptBlocks);
      this.lines.push("");
      let addressPointer = 0;
      let wordSoupPointerLeft = 0;
      let wordSoupPointerRight = 187;
      let wordSoup = "";
      let randomWord;
      this.wordCount = 0;
      let possibleWords = this.data.getArrayByKey(this.wordLength.toString());
      let wordSpacing = 0;
      for (let i = 0; i < 374; i++) {
        if (Math.floor(Math.random() * 12) === 0) {
          if (wordSpacing < 4 || i + this.wordLength > 374) {
            wordSoup += this.punctuation[Math.floor(Math.random() * this.punctuation.length)];
          } else {
            randomWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
            while (Object.values(this.passwords).includes(randomWord)) {
              randomWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
            }
            wordSoup += randomWord;
            this.passwords[i] = randomWord;
            this.wordCount++;
            wordSpacing = 0;
            i += randomWord.length - 1;
          }
        } else {
          wordSoup += this.punctuation[Math.floor(Math.random() * this.punctuation.length)];
        }
        wordSpacing++;
      }
      this.correctPassword = Object.values(this.passwords)[Math.floor(Math.random() * Object.values(this.passwords).length)];
      for (let i = 1; i <= 17; i++) {
        this.lines.push(`${this.addresses[addressPointer]} ${wordSoup.slice(wordSoupPointerLeft, wordSoupPointerLeft + 11)} ${this.addresses[addressPointer + 1]} ${wordSoup.slice(wordSoupPointerRight, wordSoupPointerRight + 11)}`);
        addressPointer += 2;
        wordSoupPointerLeft += 11;
        wordSoupPointerRight += 11;
      }
    }
    resetTries() {
      this.appendStatusLines(["", ">Tries reset."]);
      let attemptBlocks = "";
      for (let i = 0; i < this.attemptsLeft; i++) {
        attemptBlocks += " \u220E";
      }
      this.lines[3] = this.attemptsLeft.toString() + " ATTEMPT(S) LEFT: " + attemptBlocks;
    }
    removeDud() {
      let randomPasswordKeys = Object.keys(this.passwords);
      let randomPasswordIndex = parseInt(randomPasswordKeys[randomPasswordKeys.length * Math.random() << 0]);
      let randomPassword = this.passwords[randomPasswordIndex];
      if (randomPassword === this.correctPassword) {
        this.removeDud();
        return;
      }
      let wordSoupPos;
      let nonBlockyChar = "";
      for (let i = randomPasswordIndex; i < randomPasswordIndex + randomPassword.length; i++) {
        wordSoupPos = this.wordSoupPosToCharAbs(i);
        nonBlockyChar = this.punctuationNonBlocky[Math.floor(Math.random() * this.punctuationNonBlocky.length)];
        this.lines[wordSoupPos.y] = this.lines[wordSoupPos.y].substring(0, wordSoupPos.x) + nonBlockyChar + this.lines[wordSoupPos.y].substring(wordSoupPos.x + nonBlockyChar.length);
      }
      this.appendStatusLines(["", ">Dud removed."]);
      delete this.passwords[randomPasswordIndex];
    }
    onDeviceOrientation() {
      let portrait = window.innerHeight > window.innerWidth;
      let displayElement = document.querySelector("#display");
      displayElement.style.padding = "0";
      displayElement.style.width = portrait ? "100%" : "auto";
      displayElement.style.height = portrait ? "auto" : "100%";
      let displayBorderElement = document.querySelector("#border");
      displayBorderElement.style.width = portrait ? "100%" : "auto";
      displayBorderElement.style.height = portrait ? "auto" : "100%";
      displayBorderElement.style.boxSizing = "border-box";
      let canvasElement = document.querySelector("canvas");
      canvasElement.style.width = portrait ? "100%" : "auto";
      canvasElement.style.height = portrait ? "auto" : "100%";
      let headerElement = document.querySelector("header");
      headerElement.style.display = portrait ? "block" : "none";
    }
  };
  var GameState;
  (function(GameState2) {
    GameState2[GameState2["ATTEMPT"] = 0] = "ATTEMPT";
    GameState2[GameState2["MATCH"] = 1] = "MATCH";
    GameState2[GameState2["LOCKOUT"] = 2] = "LOCKOUT";
  })(GameState || (GameState = {}));

  // src/browser.ts
  if (window === null) {
    throw new Error("Requires browser environment!");
  } else {
    document.addEventListener("DOMContentLoaded", function() {
      var app = new Application();
    }, false);
  }
})();
