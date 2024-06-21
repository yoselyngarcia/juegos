const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const timerDisplay = document.getElementById('timer');
const messageDisplay = document.getElementById('message');

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    dx: 0,
    dy: 0,
    speed: 2
};

const dots = [];
const dotSize = 5;
const numDots = 25;
const gameTime = 40; // Duración del juego en segundos
let timeRemaining = gameTime;
let gameWon = false;
let gameRunning = true;

const ghosts = [];
const ghostSize = 20;
const ghostSpeed = 1;
const numGhosts = 4;
const directions = ['up', 'down', 'left', 'right'];

// Crear puntos en posiciones aleatorias
for (let i = 0; i < numDots; i++) {
    dots.push({
        x: Math.random() * (canvas.width - 2 * dotSize) + dotSize,
        y: Math.random() * (canvas.height - 2 * dotSize) + dotSize,
        size: dotSize,
    });
}

// Crear fantasmas en posiciones aleatorias
for (let i = 0; i < numGhosts; i++) {
    ghosts.push({
        x: Math.random() * (canvas.width - 2 * ghostSize) + ghostSize,
        y: Math.random() * (canvas.height - 2 * ghostSize) + ghostSize,
        size: ghostSize,
        dx: ghostSpeed * (Math.random() > 0.5 ? 1 : -1),
        dy: ghostSpeed * (Math.random() > 0.5 ? 1 : -1),
    });
}

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0.25 * Math.PI, 1.75 * Math.PI);
    ctx.lineTo(player.x, player.y);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();
}

function drawDots() {
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    });
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, ghost.size, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    });
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        ghost.x += ghost.dx;
        ghost.y += ghost.dy;

        // Cambiar de dirección al colisionar con los bordes
        if (ghost.x - ghost.size < 0 || ghost.x + ghost.size > canvas.width) {
            ghost.dx *= -1;
        }
        if (ghost.y - ghost.size < 0 || ghost.y + ghost.size > canvas.height) {
            ghost.dy *= -1;
        }

        // Cambiar de dirección aleatoriamente
        if (Math.random() < 0.01) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            switch (dir) {
                case 'up':
                    ghost.dx = 0;
                    ghost.dy = -ghostSpeed;
                    break;
                case 'down':
                    ghost.dx = 0;
                    ghost.dy = ghostSpeed;
                    break;
                case 'left':
                    ghost.dx = -ghostSpeed;
                    ghost.dy = 0;
                    break;
                case 'right':
                    ghost.dx = ghostSpeed;
                    ghost.dy = 0;
                    break;
            }
        }
    });
}

function update() {
    if (!gameRunning) return;

    player.x += player.dx;
    player.y += player.dy;

    // Detectar colisiones con los bordes
    if (player.x - player.size < 0) {
        player.x = player.size;
    }
    if (player.x + player.size > canvas.width) {
        player.x = canvas.width - player.size;
    }
    if (player.y - player.size < 0) {
        player.y = player.size;
    }
    if (player.y + player.size > canvas.height) {
        player.y = canvas.height - player.size;
    }

    // Detectar colisiones con los puntos
    dots.forEach((dot, index) => {
        const dist = Math.hypot(player.x - dot.x, player.y - dot.y);
        if (dist < player.size + dot.size) {
            dots.splice(index, 1); // Eliminar punto si Pac-Man lo come
        }
    });

    if (dots.length === 0) {
        gameWon = true;
        gameRunning = false;
        messageDisplay.textContent = "¡Ganaste!";
        messageDisplay.style.display = "block";
    }

    // Detectar colisiones con los fantasmas
    ghosts.forEach(ghost => {
        const dist = Math.hypot(player.x - ghost.x, player.y - ghost.y);
        if (dist < player.size + ghost.size) {
            gameRunning = false;
            messageDisplay.textContent = "¡Perdiste!";
            messageDisplay.style.display = "block";
        }
    });

    moveGhosts();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawDots();
    drawGhosts();
}

function moveUp() {
    player.dy = -player.speed;
}

function moveDown() {
    player.dy = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function moveRight() {
    player.dx = player.speed;
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        moveLeft();
    } else if (e.key === 'ArrowUp' || e.key === 'Up') {
        moveUp();
    } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        moveDown();
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left' ||
        e.key === 'ArrowUp' ||
        e.key === 'Up' ||
        e.key === 'ArrowDown' ||
        e.key === 'Down'
    ) {
        player.dx = 0;
        player.dy = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function countdown() {
    if (timeRemaining > 0) {
        timeRemaining--;
        timerDisplay.textContent = `Time: ${timeRemaining}`;
    } else {
        gameRunning = false;
        if (!gameWon) {
            messageDisplay.textContent = "¡Perdiste! Tiempo agotado.";
            messageDisplay.style.display = "block";
        }
    }
}

   // Verificar si todos los puntos han sido comidos
    if (dots.every(dot => dot.isEaten)) {
        gameWon = true;
        gameRunning = false;
        messageDisplay.textContent = "¡Ganaste!";
        messageDisplay.style.display = "block";
    }

function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

setInterval(countdown, 1000);
gameLoop();