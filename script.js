const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
let devicePixelRatio = window.devicePixelRatio || 1;

// Game variables
let gameOver = false;
let lives = 3;
let playerX = canvasWidth / 2;
let playerY = canvasHeight / 2;
let kills = 0;
let chasers = [];
const chaserSpeed = 2;
const radius = 10;

// Bullet variables
let bullets = [];
const bulletSpeed = 5;
const bulletRadius = 5;
let lastShotTime = 0;
const shootCooldown = 500; // milliseconds

// Invincibility variables
let invincible = false;
let invincibilityDuration = 3000; // 3 seconds of invincibility
let invincibilityStartTime = 0;

// Movement flags
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let turbospeedPressed = false;
let shootPressed = false;

// Initialize canvas
function resizeCanvas() {
    devicePixelRatio = window.devicePixelRatio || 1;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = canvasWidth * devicePixelRatio;
    canvas.height = canvasHeight * devicePixelRatio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.scale(devicePixelRatio, devicePixelRatio);
}

window.addEventListener('resize', debounce(resizeCanvas, 200));
resizeCanvas();

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(event) {
    switch (event.key) {
        case 'd':
        case 'ArrowRight':
            rightPressed = true;
            break;
        case 'a':
        case 'ArrowLeft':
            leftPressed = true;
            break;
        case 's':
        case 'ArrowDown':
            downPressed = true;
            break;
        case 'w':
        case 'ArrowUp':
            upPressed = true;
            break;
        case ' ':
            turbospeedPressed = true;
            break;
        case 'o':
            if (!shootPressed && Date.now() - lastShotTime >= shootCooldown) {
                shootPressed = true;
                shootBullet(); // Shoot bullet when 'o' key is pressed
            }
            break;
        case 'Enter':
            if (gameOver) resetGame();
            break;
    }
    event.preventDefault();
}

function keyUpHandler(event) {
    switch (event.key) {
        case 'd':
        case 'ArrowRight':
            rightPressed = false;
            break;
        case 'a':
        case 'ArrowLeft':
            leftPressed = false;
            break;
        case 's':
        case 'ArrowDown':
            downPressed = false;
            break;
        case 'w':
        case 'ArrowUp':
            upPressed = false;
            break;
        case ' ':
            turbospeedPressed = false;
            break;
        case 'o':
            shootPressed = false;
            break;
    }
    event.preventDefault();
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function createChaser() {
    const minDistanceFromPlayer = 200;
    let chaserX, chaserY;

    do {
        chaserX = Math.random() * canvasWidth;
        chaserY = Math.random() * canvasHeight;
    } while ((Math.abs(playerX - chaserX) < minDistanceFromPlayer && Math.abs(playerY - chaserY) < minDistanceFromPlayer) || chasers.some(chaser => isOverlapping(chaserX, chaserY, chaser)));

    chasers.push({ x: chaserX, y: chaserY });
}

function isOverlapping(x, y, chaser) {
    const dx = x - chaser.x;
    const dy = y - chaser.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (radius * 2);
}

function updateChasers() {
    chasers.forEach(chaser => {
        const dx = playerX - chaser.x;
        const dy = playerY - chaser.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            chaser.x += (dx / distance) * chaserSpeed;
            chaser.y += (dy / distance) * chaserSpeed;
        }
    });
}

function shootBullet() {
    const dx = rightPressed ? 1 : leftPressed ? -1 : 0;
    const dy = downPressed ? 1 : upPressed ? -1 : 0;

    // Only shoot if there's a direction
    if (dx !== 0 || dy !== 0) {
        const bullet = {
            x: playerX,
            y: playerY,
            dx: dx,
            dy: dy
        };
        bullets.push(bullet);
        lastShotTime = Date.now(); // Update last shot time
    }
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx * bulletSpeed;
        bullet.y += bullet.dy * bulletSpeed;

        if (bullet.x < 0 || bullet.x > canvasWidth || bullet.y < 0 || bullet.y > canvasHeight) {
            bullets.splice(index, 1); // Remove bullets that go off-screen
        }
    });
}

function circlesCollide(circle1, circle2) {
    const dx = circle2.x - circle1.x;
    const dy = circle2.y - circle1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (circle1.radius + circle2.radius);
}

function resetGame() {
    gameOver = false;
    lives = 3;
    kills = 0;
    playerX = canvasWidth / 2;
    playerY = canvasHeight / 2;
    chasers = [];
    bullets = [];
    invincible = false;
    draw();
}

function draw() {
    if (gameOver) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.font = "48px serif";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvasWidth / 2, canvasHeight / 2);
        ctx.font = "24px serif";
        ctx.fillStyle = "white";
        ctx.fillText(`Kills: ${kills}`, canvasWidth / 2, canvasHeight / 2 + 60);
        ctx.font = "12px serif";
        ctx.fillText("Press Enter to replay", canvasWidth / 2, canvasHeight / 2 + 120);
        return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    let moveSpeed = 5;
    if (turbospeedPressed) {
        moveSpeed = 20;
    }

    if (rightPressed && playerX < canvasWidth - radius) playerX += moveSpeed;
    if (leftPressed && playerX > radius) playerX -= moveSpeed;
    if (downPressed && playerY < canvasHeight - radius) playerY += moveSpeed;
    if (upPressed && playerY > radius) playerY -= moveSpeed;

    updateChasers();
    updateBullets();

    if (invincible && (Date.now() - invincibilityStartTime) >= invincibilityDuration) {
        invincible = false;
    }

    for (let i = 0; i < chasers.length; i++) {
        if (!invincible && circlesCollide({ x: playerX, y: playerY, radius: radius }, { x: chasers[i].x, y: chasers[i].y, radius: radius })) {
            lives--;
            invincible = true;
            invincibilityStartTime = Date.now();
            if (lives === 0) {
                gameOver = true;
            }
            break;
        }
    }

    bullets.forEach((bullet, bulletIndex) => {
        chasers.forEach((chaser, chaserIndex) => {
            if (circlesCollide({ x: bullet.x, y: bullet.y, radius: bulletRadius }, { x: chaser.x, y: chaser.y, radius: radius })) {
                bullets.splice(bulletIndex, 1);
                chasers.splice(chaserIndex, 1);
                kills++;
            }
        });
    });

    ctx.beginPath();
    ctx.arc(playerX, playerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = invincible ? "rgba(0, 149, 221, 0.5)" : "#0095DD"; // Visual feedback for invincibility
    ctx.fill();
    ctx.closePath();

    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#00dd00";
        ctx.fill();
        ctx.closePath();
    });

    chasers.forEach(chaser => {
        ctx.beginPath();
        ctx.arc(chaser.x, chaser.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#dd0000";
        ctx.fill();
        ctx.closePath();
    });

    ctx.font = "10px serif";
    ctx.fillStyle = "white";
    ctx.fillText(`Kills: ${kills}`, 20, 20);
    ctx.fillText(`Lives: ${lives}`, 20, 40);

    requestAnimationFrame(draw);
}

// Start game loop and chaser creation
requestAnimationFrame(draw);
setInterval(createChaser, 1000);
