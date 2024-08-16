class Game {
    constructor() {
        this.word = "hello";
        this.row = 1;
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

