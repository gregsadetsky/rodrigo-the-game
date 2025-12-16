import p5 from "p5";
import { PLAYER_1, PLAYER_2, SYSTEM } from "@rcade/plugin-input-classic";

// Rcade game dimensions
const WIDTH = 336;
const HEIGHT = 262;

const sketch = (p: p5) => {
    // Player 1 (controls r.png)
    let p1x: number;
    let p1y: number;
    let p1rotation = 0;

    // Player 2 (controls g.png)
    let p2x: number;
    let p2y: number;
    let p2rotation = 0;

    const speed = 3;
    const playerSize = 50;

    let gameStarted = false;
    let gameOver = false;

    let rImg: p5.Image;
    let gImg: p5.Image;

    // Hearts for game over
    let hearts: { x: number; y: number; size: number; alpha: number }[] = [];

    p.preload = () => {
        rImg = p.loadImage("/r.png");
        gImg = p.loadImage("/g.png");
    };

    p.setup = () => {
        p.createCanvas(WIDTH, HEIGHT);
        p.imageMode(p.CENTER);
        resetPositions();
    };

    const resetPositions = () => {
        p1x = WIDTH / 4;
        p1y = HEIGHT / 2;
        p2x = (WIDTH * 3) / 4;
        p2y = HEIGHT / 2;
        p1rotation = 0;
        p2rotation = 0;
        hearts = [];
    };

    const checkCollision = () => {
        const dist = p.dist(p1x, p1y, p2x, p2y);
        return dist < playerSize * 0.8;
    };

    const spawnHearts = () => {
        const centerX = (p1x + p2x) / 2;
        const centerY = (p1y + p2y) / 2;
        for (let i = 0; i < 15; i++) {
            hearts.push({
                x: centerX + p.random(-50, 50),
                y: centerY + p.random(-50, 50),
                size: p.random(15, 35),
                alpha: 255,
            });
        }
    };

    const drawHeart = (x: number, y: number, size: number, alpha: number) => {
        p.push();
        p.translate(x, y);
        p.fill(255, 100, 150, alpha);
        p.noStroke();
        p.beginShape();
        p.vertex(0, size * 0.3);
        p.bezierVertex(
            -size * 0.5,
            -size * 0.3,
            -size * 0.5,
            -size * 0.6,
            0,
            -size * 0.3
        );
        p.bezierVertex(
            size * 0.5,
            -size * 0.6,
            size * 0.5,
            -size * 0.3,
            0,
            size * 0.3
        );
        p.endShape(p.CLOSE);
        p.pop();
    };

    p.draw = () => {
        p.background(26, 26, 46);

        if (!gameStarted) {
            // Show start screen
            p.fill(255);
            p.textSize(16);
            p.textAlign(p.CENTER, p.CENTER);
            p.text("Press 2P START", WIDTH / 2, HEIGHT / 2 - 20);
            p.textSize(10);
            p.text("P1 (Red): DPAD to move", WIDTH / 2, HEIGHT / 2 + 10);
            p.text("P2 (Green): DPAD to move", WIDTH / 2, HEIGHT / 2 + 25);
            p.text("P1 A rotates Green, P2 A rotates Red", WIDTH / 2, HEIGHT / 2 + 40);
            p.textSize(9);
            p.text("Touch each other to win!", WIDTH / 2, HEIGHT / 2 + 60);

            if (SYSTEM.TWO_PLAYER || SYSTEM.ONE_PLAYER) {
                gameStarted = true;
            }
            return;
        }

        if (gameOver) {
            // Draw both players at final positions
            p.push();
            p.translate(p1x, p1y);
            p.rotate(p1rotation);
            p.image(rImg, 0, 0, playerSize, playerSize);
            p.pop();

            p.push();
            p.translate(p2x, p2y);
            p.rotate(p2rotation);
            p.image(gImg, 0, 0, playerSize, playerSize);
            p.pop();

            // Draw and animate hearts
            for (const heart of hearts) {
                heart.y -= 0.5;
                drawHeart(heart.x, heart.y, heart.size, heart.alpha);
            }

            // Game over text
            p.fill(255, 100, 150);
            p.textSize(24);
            p.textAlign(p.CENTER, p.CENTER);
            p.text("LOVE WINS!", WIDTH / 2, HEIGHT / 2 - 50);

            p.fill(255);
            p.textSize(12);
            p.text("Press START to play again", WIDTH / 2, HEIGHT - 30);

            if (SYSTEM.ONE_PLAYER || SYSTEM.TWO_PLAYER) {
                gameOver = false;
                resetPositions();
            }
            return;
        }

        // Player 1 movement (r.png)
        if (PLAYER_1.DPAD.up) p1y -= speed;
        if (PLAYER_1.DPAD.down) p1y += speed;
        if (PLAYER_1.DPAD.left) p1x -= speed;
        if (PLAYER_1.DPAD.right) p1x += speed;

        // Player 2 movement (g.png)
        if (PLAYER_2.DPAD.up) p2y -= speed;
        if (PLAYER_2.DPAD.down) p2y += speed;
        if (PLAYER_2.DPAD.left) p2x -= speed;
        if (PLAYER_2.DPAD.right) p2x += speed;

        // Player 1's A button rotates Player 2 (g.png)
        if (PLAYER_1.A) {
            p2rotation += 0.15;
        }

        // Player 2's A button rotates Player 1 (r.png)
        if (PLAYER_2.A) {
            p1rotation += 0.15;
        }

        // Keep players in bounds
        const halfSize = playerSize / 2;
        p1x = p.constrain(p1x, halfSize, WIDTH - halfSize);
        p1y = p.constrain(p1y, halfSize, HEIGHT - halfSize);
        p2x = p.constrain(p2x, halfSize, WIDTH - halfSize);
        p2y = p.constrain(p2y, halfSize, HEIGHT - halfSize);

        // Draw Player 1 (r.png)
        p.push();
        p.translate(p1x, p1y);
        p.rotate(p1rotation);
        p.image(rImg, 0, 0, playerSize, playerSize);
        p.pop();

        // Draw Player 2 (g.png)
        p.push();
        p.translate(p2x, p2y);
        p.rotate(p2rotation);
        p.image(gImg, 0, 0, playerSize, playerSize);
        p.pop();

        // Check for collision
        if (checkCollision()) {
            gameOver = true;
            spawnHearts();
        }

        // Draw player labels
        p.fill(255, 150);
        p.textSize(8);
        p.textAlign(p.CENTER);
        p.text("P1", p1x, p1y - playerSize / 2 - 5);
        p.text("P2", p2x, p2y - playerSize / 2 - 5);
    };
};

new p5(sketch, document.getElementById("sketch")!);
