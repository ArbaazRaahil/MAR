// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    score: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5,
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballSize,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8
};

// Keyboard and mouse controls
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed * 2;
}

// Update player paddle position
function updatePlayer() {
    // Arrow key controls
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y += player.speed;
    }

    // Mouse control
    const mouseSmoothing = 0.2;
    player.y += (mouseY - (player.y + player.height / 2)) * mouseSmoothing;

    // Boundary collision for player
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update computer paddle position (AI)
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    // Simple AI that follows the ball
    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }

    // Boundary collision for computer
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Paddle collision - Player
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where the ball hits the paddle
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.dy = deltaY * 0.1;
        
        // Increase ball speed slightly
        ball.dx *= 1.05;
        ball.dx = Math.min(ball.dx, ball.maxSpeed);
    }

    // Paddle collision - Computer
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where the ball hits the paddle
        const deltaY = ball.y - (computer.y + computer.height / 2);
        ball.dy = deltaY * 0.1;
        
        // Increase ball speed slightly
        ball.dx *= 1.05;
        ball.dx = Math.min(Math.abs(ball.dx), ball.maxSpeed) * (ball.dx > 0 ? 1 : -1);
    }

    // Scoring - Left side (computer scores)
    if (ball.x - ball.radius < 0) {
        computer.score++;
        updateScore();
        resetBall();
    }

    // Scoring - Right side (player scores)
    if (ball.x + ball.radius > canvas.width) {
        player.score++;
        updateScore();
        resetBall();
    }
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawCenterLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
    
    // Check for winner
    if (player.score >= 11) {
        alert('🎉 Player Wins! Final Score: ' + player.score + ' - ' + computer.score);
        resetGame();
    } else if (computer.score >= 11) {
        alert('🎮 Computer Wins! Final Score: ' + computer.score + ' - ' + player.score);
        resetGame();
    }
}

// Reset game
function resetGame() {
    player.score = 0;
    computer.score = 0;
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
    updateScore();
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateComputer();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Reset button
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Start game
resetBall();
gameLoop();
