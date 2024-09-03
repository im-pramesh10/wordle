import {wordlist, allowedList} from "./wordlist.js";
class Game {
    constructor(wordlist, allowedList) {
        this.dontShowWord = false;
        this.wordlist = wordlist;
        this.allowedList = allowedList;
        this.firstReload = true;
        this.isSlidingMenuVisible = false;
        this.handlePhysicalKeyboardIns = this.handlePhysicalKeyboard.bind(this)
        this.newGame();
        this.addEventHandlers();
    }

    toggleSlidingMenuVisibility() {
        this.isSlidingMenuVisible = !this.isSlidingMenuVisible;
        const slidingMenu = document.getElementById("sliding-menu");

        if (slidingMenu) {
            if (this.isSlidingMenuVisible) {
                slidingMenu.classList.remove("slideup");
                slidingMenu.classList.add("slidedown");
                document.removeEventListener("keydown", this.handlePhysicalKeyboardIns);
            } else {
                slidingMenu.classList.remove("slidedown");
                slidingMenu.classList.add("slideup");
                document.addEventListener("keydown", this.handlePhysicalKeyboardIns);
            }
        }
    }

    newGame() {
        const wordQuery = window.location.search;
        const urlParams = new URLSearchParams(wordQuery);
        const word = urlParams.get('cfg');
        if (word && this.firstReload) {
            const decodedWords = atob(decodeURIComponent(word)).split(',');
            const decodedWord = decodedWords[0].toLowerCase();
            this.dontShowWord = JSON.parse(decodedWords[1]);
            if (!this.allowedList.includes(decodedWord)) {
                this.allowedList.push(decodedWord)
            }
            this.firstReload = false;
            this.showNotification("error", "Custom Word Mode");
            this.customMode = true;
            this.word = decodedWord;
        } else {
            this.word = this.wordlist[Math.floor(Math.random() * wordlist.length)];
        }
        this.currentRow = 0;
        this.activeCell = 0;
        this.gameState = "playing"; // playing, won, lost
        this.presentLetters = new Set();
        this.absentLetters = new Set();
        this.correctLetters = new Set();
        this.initializeBoard();
    }
    initializeBoard() {
        this.board = [];
        this.boardState = [];
        for (let i = 0; i < 6; i++) {
            this.board.push(Array(5).fill(""));
        }
        for (let i = 0; i < 6; i++) {
            this.boardState.push(Array(5).fill(0));
        }

        this.renderBoard();
        this.renderKeyboard();
    }

    addEventHandlers() {
        const form = document.getElementById("myForm");
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const base64Word = btoa(event.target[0].value + "," + event.target[1].checked);
            if (!event.target[0].value) {
                return
            }
            const baseURI = window.location.origin + window.location.pathname;
            const url = `${baseURI}?cfg=${
                encodeURIComponent(base64Word)
            }`;
            const urlContainer = document.getElementById('url');
            urlContainer.innerHTML = `
                <div id="url-text">
                    ${url}
                </div>
                <div class="submit" id="copy" style="cursor: pointer; width: fit-content; margin-left: 10px;">
                    Copy
                </div>
                `;

            const copy = document.getElementById("copy");
            copy.addEventListener("click", () => {
                navigator.clipboard.writeText(url);
                this.showNotification("success", "Copied to clipboard");
            })
        })
        const close = document.getElementById("close");
        close.addEventListener("click", () => {
            this.toggleSlidingMenuVisibility();
        })
        document.addEventListener("keydown", this.handlePhysicalKeyboardIns);
        const customButton = document.getElementById("custom-button");
        customButton.addEventListener("click", () => {
            this.toggleSlidingMenuVisibility();
        });
        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();

            // Remove any existing custom menu
            const existingMenu = document.getElementById('custom-menu');
            if (existingMenu) {
                existingMenu.remove();
            }

            const customMenu = document.createElement("div");
            customMenu.id = "custom-menu";
            customMenu.style.position = "absolute";
            customMenu.style.top = `${
                event.clientY
            }px`;
            customMenu.style.left = `${
                event.clientX
            }px`;
            customMenu.style.zIndex = "999";

            const replayButton = document.createElement("button");
            replayButton.className = "replay";
            replayButton.innerText = "⟳ Replay";
            customMenu.appendChild(replayButton);

            replayButton.addEventListener("click", () => {
                this.reStart();
                customMenu.remove(); // Remove menu after clicking replay
            });

            document.body.appendChild(customMenu);

            // Hide custom menu when clicking elsewhere
            const hideMenu = (event) => {
                if (! customMenu.contains(event.target)) {
                    customMenu.remove();
                    document.removeEventListener("click", hideMenu);
                }
            };
            document.addEventListener("click", hideMenu);
        });
    }

    handlePhysicalKeyboard(event) {
        let key = event.key;
        if (key === "Backspace") {
            key = "⌫";
        } else if (key === "Enter") {
            key = "⏎";
        } else if (key === "ArrowLeft" || key === "ArrowDown" || key === "4" || key === "2") {
            if (this.activeCell > 0) {
                this.setActiveCell(this.currentRow, this.activeCell - 1);
            }
            return;
        } else if (key === "ArrowRight" || key === "ArrowUp" || key === "6" || key === "8") {
            if (this.activeCell < 4) {
                this.setActiveCell(this.currentRow, this.activeCell + 1);
            }
            return;
        } else if (key.length === 1 && ((key >= "a" && key <= "z") || (key >= "A" && key <= "Z"))) {
            key = key.toUpperCase();
        } else {
            key = "";
        }
        this.handleKeyPress(key);
    }
    renderBoard() {
        const board = document.getElementById("board");
        board.innerHTML = "";

        for (let i = 0; i < this.board.length; i++) {
            const row = document.createElement("div");
            row.className = "row";
            row.id = `row${i}`
            for (let j = 0; j < this.board[i].length; j++) {
                const cell = document.createElement("div");
                cell.id = (`${i}-${j}`);
                cell.className = "cell";
                if (j === this.activeCell && i === this.currentRow) {
                    cell.className = "cell active";
                }
                if (this.boardState[i][j] === 1) {
                    cell.className = "cell correct";
                } else if (this.boardState[i][j] === 2) {
                    cell.className = "cell present";
                } else if (this.boardState[i][j] === 3) {
                    cell.className = "cell absent";
                }
                cell.innerText = this.board[i][j];
                cell.addEventListener("click", () => {
                    this.setActiveCell(i, j);
                })
                row.appendChild(cell);
            }
            board.appendChild(row);
        }
    }

    renderKeyboard() {
        const firstrow = [
            "Q",
            "W",
            "E",
            "R",
            "T",
            "Y",
            "U",
            "I",
            "O",
            "P"
        ];
        const secondrow = [
            "A",
            "S",
            "D",
            "F",
            "G",
            "H",
            "J",
            "K",
            "L"
        ];
        const thirdrow = [
            "⏎",
            "Z",
            "X",
            "C",
            "V",
            "B",
            "N",
            "M",
            "⌫"
        ];
        const keyboard = document.getElementById("keyboard");
        keyboard.innerHTML = "";
        for (let i = 0; i < 3; i++) {
            const keyboardRow = document.createElement("div");
            keyboardRow.className = "row";
            let arrayRefrence;
            if (i === 0) {
                arrayRefrence = firstrow;
            } else if (i === 1) {
                arrayRefrence = secondrow;
            } else {
                arrayRefrence = thirdrow;
            }
            for (let j = 0; j < arrayRefrence.length; j++) {
                const buttonContainer = document.createElement("div");
                buttonContainer.className = "key-container";
                buttonContainer.id = arrayRefrence[j];
                const key = document.createElement("button");
                key.id = `button-${
                    arrayRefrence[j]
                }`;
                key.className = "key";
                if (arrayRefrence[j] === "⏎" || arrayRefrence[j] === "⌫") {
                    key.className = "key special-key";
                }
                if (this.correctLetters.has(arrayRefrence[j])) {
                    key.className = "key correct";
                } else if (this.presentLetters.has(arrayRefrence[j])) {
                    key.className = "key present";
                } else if (this.absentLetters.has(arrayRefrence[j])) {
                    key.className = "key absent";
                }
                key.innerText = arrayRefrence[j];
                buttonContainer.appendChild(key);
                keyboardRow.appendChild(buttonContainer);

                key.addEventListener("click", () => {
                    this.handleKeyPress(arrayRefrence[j]);
                });
            }
            keyboard.appendChild(keyboardRow);
        }
    }

    handleKeyPress(key) {
        if (this.gameState !== "playing") {
            if (key === "R") {
                this.reStart();
            }
            return;
        }

        if (key) {
            const pressedDownKey = document.getElementById(`button-${key}`);
            pressedDownKey.classList.add("pressed");
            setTimeout(() => {
                pressedDownKey.classList.remove("pressed");
            }, 300)
        }

        if (key === "⏎") {
            const selectedrow = document.getElementById(`row${
                this.currentRow
            }`);
            const textcontent = selectedrow.innerText.replace(/\s+/g, '').trim().toLowerCase();
            if (textcontent.length !== 5) {
                return
            }
            if (!this.allowedList.includes(textcontent)) {
                this.showNotification("error", `"${
                    textcontent.toUpperCase()
                }" is not in the wordlist`);
                return;
            }
            for (let i = 0; i < this.word.length; i++) {
                if (this.word[i] === textcontent[i]) {
                    this.boardState[this.currentRow][i] = 1; // correct
                    this.correctLetters.add(textcontent[i].toUpperCase());

                } else if (this.word.includes(textcontent[i])) {
                    this.boardState[this.currentRow][i] = 2; // present
                    this.presentLetters.add(textcontent[i].toUpperCase());

                } else {
                    this.boardState[this.currentRow][i] = 3; // absent
                    this.absentLetters.add(textcontent[i].toUpperCase());

                }
            }
            if (textcontent === this.word) {
                this.gameState = "won";
                this.showCorrectWord(this.word);
                this.showReplayButton();
            } else if (this.currentRow === 5) {
                this.showCorrectWord(this.word);
                this.showReplayButton();
                if (textcontent !== this.word) {
                    this.gameState = "lost";
                }
            }
            this.currentRow ++;
            this.activeCell = 0;
            this.renderBoard();
            this.renderKeyboard();
            this.showNotification(this.gameState === "won" ? "success" : "error", textcontent.toUpperCase());
            return;
        }
        if (key === "⌫") {
            const selectedCell = document.getElementById(`${
                this.currentRow
            }-${
                this.activeCell
            }`);
            if (selectedCell.innerText === "" && this.activeCell > 0) {
                const previousCell = document.getElementById(`${
                    this.currentRow
                }-${
                    this.activeCell - 1
                }`);
                previousCell.innerText = "";
                this.board[this.currentRow][this.activeCell - 1] = "";
                this.setActiveCell(this.currentRow, this.activeCell - 1);
                return;
            }
            selectedCell.innerText = "";
            this.board[this.currentRow][this.activeCell] = "";
            return;
        }
        if (key >= "A" && key <= "Z") {
            const pressedKey = document.getElementById(key);
            const animatedKey = document.createElement('div');
            animatedKey.className = "animated-key";
            animatedKey.innerText = key;
            pressedKey.appendChild(animatedKey);

            setTimeout(() => {
                pressedKey.removeChild(animatedKey);
            }, 400);
            const selectedCell = document.getElementById(`${
                this.currentRow
            }-${
                this.activeCell
            }`);
            selectedCell.innerText = key;
            this.board[this.currentRow][this.activeCell] = key;
            if (this.activeCell < 4) {
                this.setActiveCell(this.currentRow, this.activeCell + 1);
            }
            return;
        }
    }

    showNotification(type, message) {
        const types = ["success", "error"];
        if (! types.includes(type)) {
            console.error("Notification type is invalid");
            return
        }
        const notifContainer = document.getElementById("notif-div");
        const wordlisNotif = document.createElement("div");
        wordlisNotif.className = type === "success" ? "notification-element success" : "notification-element";
        wordlisNotif.innerText = message;
        notifContainer.appendChild(wordlisNotif);
        setTimeout(() => {
            notifContainer.removeChild(wordlisNotif);
        }, 1500);
    }
    setActiveCell(row, col) {
        if (row === this.currentRow) {
            const currentActiveCell = document.getElementById(`${
                this.currentRow
            }-${
                this.activeCell
            }`);
            currentActiveCell.classList.remove("active");
            const cell = document.getElementById(`${row}-${col}`);
            cell.classList.add("active");
            this.activeCell = col;
        }
    }
    reStart() {
        const correctWord = document.getElementById("correct-word");
        correctWord.innerHTML = "";
        const replayContainer = document.getElementById("replay-container");
        replayContainer.innerHTML = "";
        this.dontShowWord = false;
        if (!this.firstReload && this.customMode) {
            this.showNotification("error", "Switching to default mode from custom mode");
            this.customMode = false;
        }
        this.newGame();
    }

    showCorrectWord(word) {
        const correctWord = document.getElementById("correct-word");
        const message = this.gameState === "won" ? "You won!" : "You lost!";
        this.gameState === "won" ? this.showNotification("success", "Congratulations!!! " + message) : this.showNotification("error", "Sorry!!! " + message);
        if (!this.dontShowWord) {
            correctWord.innerHTML = `
            <div style="text-align: center;">
                <p>Word: <span style="font-weight: bold; color: green;">${word}</span></p>
            </div>
        `;
        }

    }

    showReplayButton() {

        const replayContainer = document.getElementById("replay-container");
        const replayButton = document.createElement("button");
        replayButton.id = "replay";
        replayButton.innerText = "⟳ Replay (R)";
        replayContainer.appendChild(replayButton);
        replayButton.addEventListener("click", () => {
            this.reStart();
        });
    }
}


function main() {
    const game = new Game(wordlist, allowedList);
}
main()
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        }, function (err) {
            console.log('Service Worker registration failed:', err);
        });
    });
}
