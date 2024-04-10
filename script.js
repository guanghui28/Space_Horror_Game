class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.mouse = {
            x: undefined,
            y: undefined,
            width: 1,
            height: 1,
            pressed: false,
            fired: false,
        };
        this.crewImg = crewImage;
        this.enemyPool = [];
        this.numOfEnemies = 50;
        this.enemyTimer = 0;
        this.enemyInterval = 1000;
        this.winningScore = 20;
        this.score = 0;
        this.lives;
        this.message1 = "Run!";
        this.message2 = "Or get eaten!";
        this.message3 = 'Press "ENTER" or "R" to start!';
        this.gameOver = true;
        this.spriteUpdate = false;
        this.spriteTimer = 0;
        this.spriteInterval = 100;
        this.debug = false;
        this.crewSpriteImg = crewSpriteImage;
        this.crewSpriteArrays = [];
        this.createEnemyPool();
        this.sounds = new AudioControl();

        this.resize(window.innerWidth, window.innerHeight);
        resetBtn.addEventListener("click", () => {
            this.start();
        });
        fullscreenBtn.addEventListener("click", () => {
            this.toggleFullScreen();
        });
        window.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key.toLowerCase() === "r") {
                this.start();
            } else if (e.key === " " || e.key.toLowerCase() === "f") {
                this.toggleFullScreen();
            } else if (e.key.toLowerCase() === "d") this.debug = !this.debug;
        });

        window.addEventListener("resize", (e) => {
            this.resize(e.target.innerWidth, e.target.innerHeight);
        });
        window.addEventListener("mousedown", (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
            this.mouse.pressed = true;
            this.mouse.fired = false;
            console.log(this.score);
        });
        window.addEventListener("mouseup", (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
            this.mouse.pressed = false;
        });
        window.addEventListener("touchstart", (e) => {
            this.mouse.x = e.changedTouches[0].pageX;
            this.mouse.y = e.changedTouches[0].pageY;
            this.mouse.pressed = true;
            this.mouse.fired = false;
        });
        window.addEventListener("touchend", (e) => {
            this.mouse.x = e.changedTouches[0].pageX;
            this.mouse.y = e.changedTouches[0].pageY;
            this.mouse.pressed = false;
        });
    }
    createSpriteArray() {
        for (let i = 0; i < this.lives; i++) {
            this.crewSpriteArrays.push({
                frameX: Math.floor(Math.random() * 5),
                frameY: Math.floor(Math.random() * 5),
            });
        }
    }
    start() {
        this.resize(window.innerWidth, window.innerHeight);
        this.score = 0;
        this.lives = 20;
        this.gameOver = false;
        this.createSpriteArray();
        this.enemyPool.forEach((enemy) => enemy.reset());
        for (let i = 0; i < 2; i++) {
            const enemy = this.getEnemy();
            if (enemy) enemy.start();
        }
        this.sounds.play(this.sounds.newGame);
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.ctx.font = "40px Bangers";
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "white";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
    }
    toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    triggerGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            if (this.lives < 1) {
                this.message1 = "Aargh!";
                this.message2 = "The crew was eaten!";
                this.sounds.play(this.sounds.lose);
            } else if (this.score >= this.winningScore) {
                this.message1 = "Well done!";
                this.message2 = "You escaped the swarm!";
                this.sounds.play(this.sounds.win);
            }
        }
    }
    drawTextStatus() {
        this.ctx.save();
        this.ctx.font = "40px Bangers";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        const w = 20;
        const h = 45;
        for (let i = 0; i < this.lives; i++) {
            const { frameX, frameY } = this.crewSpriteArrays[i];
            this.ctx.drawImage(
                this.crewSpriteImg,
                frameX * w,
                frameY * h,
                w,
                h,
                20 + 20 * i,
                60,
                w,
                h
            );
        }
        if (this.lives < 1 || this.score >= this.winningScore) {
            this.triggerGameOver();
        }
        if (this.gameOver) {
            this.ctx.textAlign = "center";
            this.ctx.font = "80px Bangers";
            this.ctx.fillText(
                this.message1,
                this.width * 0.5,
                this.height * 0.5 - 25
            );
            this.ctx.font = "20px Bangers";
            this.ctx.fillText(
                this.message2,
                this.width * 0.5,
                this.height * 0.5 + 25
            );
            this.ctx.fillText(
                this.message3,
                this.width * 0.5,
                this.height * 0.5 + 80
            );
        }
        this.ctx.restore();
    }
    createEnemyPool() {
        for (let i = 0; i < this.numOfEnemies; i++) {
            const randomize = Math.random();
            if (randomize < 0.3) {
                this.enemyPool.push(new Beetle(this));
            } else if (randomize < 0.7) {
                this.enemyPool.push(new Lobster(this));
            } else {
                this.enemyPool.push(new Phantom(this));
            }
        }
    }
    getEnemy() {
        return this.enemyPool.find((enemy) => enemy.free);
    }
    handleEnemy(deltaTime) {
        if (this.enemyTimer > this.enemyInterval) {
            const enemy = this.getEnemy();
            if (enemy) enemy.start();
            this.enemyTimer = 0;
        } else {
            this.enemyTimer += deltaTime;
        }
    }
    checkCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            b.x < a.x + a.width &&
            a.y < b.y + b.height &&
            b.y < a.y + a.height
        );
    }
    handleSpriteAnimation(deltaTime) {
        if (this.spriteTimer > this.spriteInterval) {
            this.spriteUpdate = true;
            this.spriteTimer = 0;
        } else {
            this.spriteUpdate = false;
            this.spriteTimer += deltaTime;
        }
    }
    render(deltaTime) {
        this.handleSpriteAnimation(deltaTime);
        this.drawTextStatus();
        //add periodically enemy
        if (!this.gameOver) this.handleEnemy(deltaTime);
        for (let i = this.enemyPool.length - 1; i >= 0; i--) {
            this.enemyPool[i].update(deltaTime);
        }
        this.enemyPool.forEach((enemy) => {
            enemy.draw();
        });
    }
}

window.addEventListener("load", () => {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const game = new Game(canvas, ctx);
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(deltaTime);
        requestAnimationFrame(animate);
    }
    animate(0);
});
