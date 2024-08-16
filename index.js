import {wordlist} from "./wordlist.js";
class Game {
    constructor() {
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

    handleCellClick(row, col) {
        if (row === this.currentRow) {
            const currentActiveCell = document.getElementById(`${this.currentRow}-${this.activeCell}`);
            currentActiveCell.className = "cell";
            const cell = document.getElementById(`${row}-${col}`);
            cell.className = "cell active";
            this.activeCell = col;
        }
    }
    start() {
        console.log(this.word);
    }
}
function main() {
    const game = new Game();
    game.start();
}

main();
