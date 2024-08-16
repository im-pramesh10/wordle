import {wordlist} from "./wordlist.js";
class Game {
    constructor() {
        this.newGame();
    }
    newGame() {
        this.word = wordlist[Math.floor(Math.random() * wordlist.length)];
        this.currentRow = 0;
        this.activeCell = 0;
        this.initializeBoard();
    }
    initializeBoard() {
        this.board = [];
        for (let i = 0; i < 6; i++) {
            this.board.push(Array(5).fill(""));
        }

        this.renderBoard();
        this.renderKeyboard();
    }

    renderBoard() {
        const board = document.getElementById("board");
        board.innerHTML = "";

        for (let i = 0; i < this.board.length; i++) {
            const row = document.createElement("div");
            row.className = "row";
            for (let j = 0; j < this.board[i].length; j++) {
                const cell = document.createElement("div");
                cell.id = (`${i}-${j}`);
                cell.className = "cell";
                if (j === this.activeCell && i === this.currentRow) {
                    cell.className = "cell active";
                }
                cell.innerText = this.board[i][j];
                cell.addEventListener("click", () => {
                    this.handleCellClick(i, j);
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
                const key = document.createElement("button");
                key.className = "key";
                if (arrayRefrence[j] === "⏎" || arrayRefrence[j] === "⌫") {
                    key.className = "key special-key";
                }
                key.innerText = arrayRefrence[j];
                keyboardRow.appendChild(key);
            }
            keyboard.appendChild(keyboardRow);
        }
    }

    handleCellClick(row, col) {
        if (row === this.currentRow) {
            const currentActiveCell = document.getElementById(`${
                this.currentRow
            }-${
                this.activeCell
            }`);
            currentActiveCell.className = "cell";
            const cell = document.getElementById(`${row}-${col}`);
            cell.className = "cell active";
            this.activeCell = col;
        }
    }
    reStart() {
        this.newGame();
    }
}


function main() {
    const game = new Game();
}
main()
