import {wordlist} from "./wordlist.js";
class Game {
    constructor() {
        this.word = wordlist[Math.floor(Math.random() * wordlist.length)];
        this.row = 1;
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
                cell.id =(`${i}-${j}`);
                cell.innerText = `${i}-${j}`;
                row.appendChild(cell);
            }
            board.appendChild(row);
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
