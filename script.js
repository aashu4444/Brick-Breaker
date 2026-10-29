for (let i = 0; i < 17; i++) {
    const game_body = document.querySelector(".bricks");
    const colums = 10;

    let row = document.createElement("tr");
    game_body.appendChild(row);

    for (let j = 0; j < colums; j++) {
        const is_blank = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
        let col = document.createElement("td");

        if (is_blank > 6) {
            col.className = "bg-transparent";
        }
        else {

            col.className = "brick";
        }
        row.appendChild(col);

    }

}

const paddle = document.querySelector("#paddle");
let left = 0;
const steps = 5;
paddle.style.left = left + "%";

document.addEventListener("keydown", (event) => {

    if (event.key == "ArrowRight" && left < 80) {
        left += steps;
    }
    else if (event.key == "ArrowLeft" && left > 0) {
        left -= steps;
    }
    paddle.style.left = left + "%";

})

const START_LIVES = 3;
const BASE_SPEED = 240;
const MAX_SPEED = 420;

let score = 0;
let lives = START_LIVES;
let level = 1;
let speed = BASE_SPEED;
let gameIsOver = false;

const game = document.querySelector("#game");
const startBtn = document.querySelector("button");

const hud = document.createElement("div");
hud.id = "hud";
hud.innerHTML = 'Score: <span id="score">0</span> &emsp; Lives: <span id="lives">3</span> &emsp; Level: <span id="level">1</span>';
document.querySelector("#main p").after(hud);

const scoreEl = document.querySelector("#score");
const livesEl = document.querySelector("#lives");
const levelEl = document.querySelector("#level");

function updateHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    levelEl.textContent = level;
}

const messageEl = document.createElement("div");
messageEl.id = "message";
messageEl.textContent = "Press Start";
game.appendChild(messageEl);

const ball = document.createElement("div");
ball.className = "ball";
game.appendChild(ball);

const BALL_SIZE = 12;
let ballX = 0;
let ballY = 0;
let dx = 0;
let dy = 0;
let running = false;
let lastTime = 0;

function relRect(el) {
    const g = game.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
        left: r.left - g.left,
        right: r.right - g.left,
        top: r.top - g.top,
        bottom: r.bottom - g.top,
        width: r.width,
        height: r.height,
    };
}

function drawBall() {
    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";
}

function resetBall() {
    const p = relRect(paddle);
    ballX = p.left + p.width / 2 - BALL_SIZE / 2;
    ballY = p.top - BALL_SIZE;
    drawBall();
}

function makeBricks() {
    const table = document.querySelector(".bricks");
    table.innerHTML = "";

    const blankChance = Math.max(0.2, 0.5 - 0.05 * (level - 1));

    for (let i = 0; i < 17; i++) {
        const row = document.createElement("tr");
        table.appendChild(row);

        for (let j = 0; j < 10; j++) {
            const col = document.createElement("td");
            col.className = Math.random() < blankChance ? "bg-transparent" : "brick";
            row.appendChild(col);
        }
    }
}

function startGame() {
    if (running) return;
    if (gameIsOver) resetGame();

    running = true;
    messageEl.textContent = "";

    const angle = (Math.random() * 60 - 30) * Math.PI / 180;
    dx = speed * Math.sin(angle);
    dy = -speed * Math.cos(angle);

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    score = 0;
    lives = START_LIVES;
    level = 1;
    speed = BASE_SPEED;
    gameIsOver = false;
    makeBricks();
    updateHUD();
    resetBall();
}

function nextLevel() {
    running = false;
    level++;
    speed = Math.min(BASE_SPEED + (level - 1) * 25, MAX_SPEED);
    makeBricks();
    resetBall();
    updateHUD();
    messageEl.textContent = "Level " + level + "! Press Start";
}

function loseLife() {
    running = false;
    lives--;
    updateHUD();

    if (lives <= 0) {
        gameIsOver = true;
        messageEl.textContent = "Game Over! Score: " + score + " - Press Start";
    } else {
        messageEl.textContent = "Press Start";
    }
    resetBall();
}

function gameLoop(now) {
    if (!running) return;

    const dt = Math.min((now - lastTime) / 1000, 1 / 30);
    lastTime = now;

    ballX += dx * dt;
    ballY += dy * dt;

    const W = game.clientWidth;
    const H = game.clientHeight;

    if (ballX <= 0) {
        ballX = 0;
        dx = Math.abs(dx);
    } else if (ballX + BALL_SIZE >= W) {
        ballX = W - BALL_SIZE;
        dx = -Math.abs(dx);
    }
    if (ballY <= 0) {
        ballY = 0;
        dy = Math.abs(dy);
    }

    const p = relRect(paddle);
    const ballBottom = ballY + BALL_SIZE;
    if (
        dy > 0 &&
        ballBottom >= p.top &&
        ballBottom <= p.bottom + 8 &&
        ballX + BALL_SIZE > p.left &&
        ballX < p.right
    ) {

        const hit = ((ballX + BALL_SIZE / 2) - (p.left + p.width / 2)) / (p.width / 2);
        const clamped = Math.max(-1, Math.min(1, hit));
        const angle = clamped * 60 * Math.PI / 180;

        dx = speed * Math.sin(angle);
        dy = -speed * Math.cos(angle);
        ballY = p.top - BALL_SIZE;
    }

    const bricks = document.querySelectorAll(".brick:not(.broken)");
    for (const brick of bricks) {
        const b = relRect(brick);

        const touching =
            ballX < b.right &&
            ballX + BALL_SIZE > b.left &&
            ballY < b.bottom &&
            ballY + BALL_SIZE > b.top;

        if (touching) {
            brick.classList.add("broken");
            score += 10 * level;
            updateHUD();

            const overlapX = Math.min(ballX + BALL_SIZE - b.left, b.right - ballX);
            const overlapY = Math.min(ballY + BALL_SIZE - b.top, b.bottom - ballY);

            if (overlapX < overlapY) {
                dx = -dx;
            } else {
                dy = -dy;
            }
            break;
        }
    }

    if (document.querySelectorAll(".brick:not(.broken)").length === 0) {
        nextLevel();
        return;
    }

    if (ballY > H) {
        loseLife();
        return;
    }

    drawBall();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", () => {
    if (!running) resetBall();
});

startBtn.addEventListener("click", () => {
    startBtn.blur();
    startGame();
});

resetBall();
