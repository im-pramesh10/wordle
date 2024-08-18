import {wordlist, allowedList} from "./wordlist.js";
class Game {
    constructor() {
        this.newGame();
        this.addEventHandlers();
    }
    newGame() {
        this.word = wordlist[Math.floor(Math.random() * wordlist.length)];
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
        document.addEventListener("keydown", this.handlePhysicalKeyboard.bind(this));

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
        if (key >= "a" && key <= "z") {
            key = key.toUpperCase();
        } else if (key === "Backspace") {
            key = "⌫";
        } else if (key === "Enter") {
            key = "⏎";
        } else if (key === "ArrowLeft") {
            if (this.activeCell > 0) {
                this.setActiveCell(this.currentRow, this.activeCell - 1);
            }
            return;
        } else if (key === "ArrowRight") {
            if (this.activeCell < 4) {
                this.setActiveCell(this.currentRow, this.activeCell + 1);
            }
            return;
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
            if (!allowedList.includes(textcontent)) {
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
        this.newGame();
    }

    showCorrectWord(word) {
        const correctWord = document.getElementById("correct-word");
        const message = this.gameState === "won" ? "You won!" : "You lost!";
        const color = this.gameState === "won" ? "rgb(75, 221, 62)" : "rgb(255, 0, 0)"; // Green if won, red if lost
        this.gameState === "won" ? this.showNotification("success", "Congratulations!!! " + message) : this.showNotification("error", "Sorry!!! " + message);
        correctWord.innerHTML = `
            <div style="text-align: center;">
                <p style="color: ${color};">${message}</p>
                <p>Word: <span style="font-weight: bold; color: green;">${word}</span></p>
            </div>
        `;
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
    const game = new Game();
}
main()
