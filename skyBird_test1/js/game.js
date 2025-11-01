// SkyBird Game - Core Game Logic

/**
 * SkyBird Game Class
 * Handles game state, physics, rendering, and game loop
 */

class SkyBirdGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Game state
        this.state = 'loading'; // loading, menu, playing, paused, gameOver
        this.score = 0;
        this.highScore = Utils.storage.get('skybird-highscore', 0);
        
        // Game settings
        this.gravity = 0.5;
        this.jumpForce = -12;
        this.gameSpeed = 2;
        this.pipeGap = 150;
        this.pipeWidth = 60;
        
        // Bird properties
        this.bird = {
            x: 100,
            y: 0,
            width: 40,
            height: 30,
            velocity: 0,
            rotation: 0,
            color: '#FFD700'
        };
        
        // Pipes array
        this.pipes = [];
        this.pipeSpawnTimer = 0;
        this.pipeSpawnInterval = 120; // frames
        
        // Background elements
        this.clouds = [];
        this.groundOffset = 0;
        
        // Game loop
        this.lastTime = 0;
        this.animationId = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.generateClouds();
        this.resetGame();
    }
    
    setupCanvas() {
        const viewport = Utils.getViewport();
        const pixelRatio = Utils.getPixelRatio();
        
        // Set canvas size
        this.canvas.width = viewport.width * pixelRatio;
        this.canvas.height = viewport.height * pixelRatio;
        this.canvas.style.width = viewport.width + 'px';
        this.canvas.style.height = viewport.height + 'px';
        
        // Scale context for high DPI displays
        this.ctx.scale(pixelRatio, pixelRatio);
        
        // Set bird initial position
        this.bird.y = viewport.height / 2;
        
        // Store canvas dimensions
        this.width = viewport.width;
        this.height = viewport.height;
    }
    
    setupEventListeners() {
        // Prevent default touch behaviors
        Utils.input.preventDefaults(this.canvas);
        
        // Touch/click events for jumping
        const jumpEvents = ['touchstart', 'mousedown', 'keydown'];
        jumpEvents.forEach(event => {
            if (event === 'keydown') {
                document.addEventListener(event, (e) => {
                    if (e.code === 'Space' || e.code === 'ArrowUp') {
                        e.preventDefault();
                        this.handleJump();
                    }
                });
            } else {
                this.canvas.addEventListener(event, (e) => {
                    e.preventDefault();
                    this.handleJump();
                }, { passive: false });
            }
        });
        
        // Resize handler
        window.addEventListener('resize', Utils.debounce(() => {
            this.setupCanvas();
        }, 250));
    }
    
    handleJump() {
        if (this.state === 'playing') {
            this.bird.velocity = this.jumpForce;
            // TODO: Play jump sound
        }
    }
    
    generateClouds() {
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Utils.random(0, this.width * 2),
                y: Utils.random(50, this.height * 0.4),
                width: Utils.random(60, 120),
                height: Utils.random(30, 60),
                speed: Utils.random(0.2, 0.8),
                opacity: Utils.random(0.3, 0.7)
            });
        }
    }
    
    resetGame() {
        this.score = 0;
        this.bird.x = 100;
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.pipes = [];
        this.pipeSpawnTimer = 0;
        this.groundOffset = 0;
    }
    
    start() {
        this.state = 'playing';
        this.gameLoop();
    }
    
    pause() {
        this.state = 'paused';
        if (this.animationId) {
            Utils.animation.cancelFrame(this.animationId);
        }
    }
    
    resume() {
        this.state = 'playing';
        this.gameLoop();
    }
    
    gameOver() {
        this.state = 'gameOver';
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            Utils.storage.set('skybird-highscore', this.highScore);
        }
        
        if (this.animationId) {
            Utils.animation.cancelFrame(this.animationId);
        }
        
        // TODO: Play game over sound
    }
    
    update(deltaTime) {
        if (this.state !== 'playing') return;
        
        // Update bird physics
        this.updateBird(deltaTime);
        
        // Update pipes
        this.updatePipes(deltaTime);
        
        // Update background elements
        this.updateBackground(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Spawn new pipes
        this.spawnPipes();
    }
    
    updateBird(deltaTime) {
        // Apply gravity
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;
        
        // Update rotation based on velocity
        this.bird.rotation = Utils.clamp(this.bird.velocity * 0.1, -0.5, 0.5);
        
        // Check bounds
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        
        if (this.bird.y + this.bird.height > this.height - 60) { // Ground level
            this.gameOver();
        }
    }
    
    updatePipes(deltaTime) {
        // Move pipes
        this.pipes.forEach(pipe => {
            pipe.x -= this.gameSpeed;
        });
        
        // Remove off-screen pipes and update score
        this.pipes = this.pipes.filter(pipe => {
            if (pipe.x + this.pipeWidth < 0) {
                if (!pipe.scored) {
                    this.score++;
                    pipe.scored = true;
                }
                return false;
            }
            return true;
        });
    }
    
    updateBackground(deltaTime) {
        // Move clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.width + Utils.random(0, 200);
            }
        });
        
        // Move ground
        this.groundOffset -= this.gameSpeed;
        if (this.groundOffset <= -60) {
            this.groundOffset = 0;
        }
    }
    
    spawnPipes() {
        this.pipeSpawnTimer++;
        if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
            this.pipeSpawnTimer = 0;
            
            const gapY = Utils.random(100, this.height - this.pipeGap - 160);
            
            this.pipes.push({
                x: this.width,
                topHeight: gapY,
                bottomY: gapY + this.pipeGap,
                bottomHeight: this.height - (gapY + this.pipeGap) - 60,
                scored: false
            });
        }
    }
    
    checkCollisions() {
        const birdRect = {
            x: this.bird.x,
            y: this.bird.y,
            width: this.bird.width,
            height: this.bird.height
        };
        
        // Check pipe collisions
        this.pipes.forEach(pipe => {
            // Top pipe
            if (this.isColliding(birdRect, {
                x: pipe.x,
                y: 0,
                width: this.pipeWidth,
                height: pipe.topHeight
            })) {
                this.gameOver();
            }
            
            // Bottom pipe
            if (this.isColliding(birdRect, {
                x: pipe.x,
                y: pipe.bottomY,
                width: this.pipeWidth,
                height: pipe.bottomHeight
            })) {
                this.gameOver();
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw sky gradient
        this.drawSky();
        
        // Draw clouds
        this.drawClouds();
        
        // Draw pipes
        this.drawPipes();
        
        // Draw ground
        this.drawGround();
        
        // Draw bird
        this.drawBird();
        
        // Draw UI elements if needed
        if (this.state === 'playing') {
            this.drawScore();
        }
    }
    
    drawSky() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8E8');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(cloud => {
            this.ctx.globalAlpha = cloud.opacity;
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#228B22';
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            
            // Pipe caps
            this.ctx.fillStyle = '#32CD32';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, this.pipeWidth + 10, 30);
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 30);
            this.ctx.fillStyle = '#228B22';
        });
    }
    
    drawGround() {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.height - 60, this.width, 60);
        
        // Ground pattern
        this.ctx.fillStyle = '#A0522D';
        for (let x = this.groundOffset; x < this.width; x += 60) {
            this.ctx.fillRect(x, this.height - 50, 30, 10);
        }
    }
    
    drawBird() {
        this.ctx.save();
        
        // Move to bird center
        this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
        this.ctx.rotate(this.bird.rotation);
        
        // Draw bird body
        this.ctx.fillStyle = this.bird.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw bird eye
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.ellipse(8, -5, 6, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.ellipse(10, -5, 3, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw beak
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.moveTo(15, 0);
        this.ctx.lineTo(25, -3);
        this.ctx.lineTo(25, 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawScore() {
        // This will be handled by the UI overlay
        // Score is displayed in the HUD
    }
    
    gameLoop(currentTime = 0) {
        if (this.state !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = Utils.animation.requestFrame((time) => this.gameLoop(time));
    }
    
    // Public methods for UI interaction
    getScore() {
        return this.score;
    }
    
    getHighScore() {
        return this.highScore;
    }
    
    getState() {
        return this.state;
    }
}
