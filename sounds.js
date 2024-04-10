class AudioControl {
    constructor() {
        this.newGame = newgame;
        this.boom1 = boom1;
        this.boom2 = boom2;
        this.boom3 = boom3;
        this.boom4 = boom4;
        this.booms = [this.boom1, this.boom2, this.boom3, this.boom4];
        this.lose = lose;
        this.scream = scream;
        this.win = win;
        this.slide = slide;
    }
    play(audio) {
        audio.currentTime = 0;
        audio.play();
    }
}
