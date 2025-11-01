// SkyBird Nest Building Game - Core Game Logic

/**
 * SkyBird Nest Building Game Class
 * A peaceful puzzle game for children aged 4-8
 * Features drag-and-drop nest building with encouraging feedback
 */

class SkyBirdGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Game state
        this.state = 'loading'; // loading, menu, playing, completed
        this.progress = 0; // 0-100% nest completion
        
        // SVG Images
        this.images = {
            bird: null,
            stickStraight: null,
            stickCurved: null,
            stickYShaped: null
        };
        this.imagesLoaded = false;
        
        // Nest building elements
        this.nestFoundation = {
            x: 0, y: 0, width: 200, height: 150,
            centerX: 0, centerY: 0 // Will be set in setupCanvas
        };
        
        // Stick types for building
        this.stickTypes = [
            { type: 'straight', length: 60, thickness: 8, color: '#8B4513' },
            { type: 'curved', length: 50, thickness: 6, color: '#A0522D' },
            { type: 'y-shaped', length: 45, thickness: 7, color: '#654321' }
        ];
        
        // Available sticks (inventory)
        this.availableSticks = [];
        
        // Placed sticks in the nest
        this.placedSticks = [];
        
        // Drop zones for correct placement
        this.dropZones = [];
        
        // Drag and drop state
        this.dragState = {
            isDragging: false,
            draggedStick: null,
            dragOffset: { x: 0, y: 0 },
            startPos: { x: 0, y: 0 }
        };
        
        // Touch/mouse handling
        this.inputState = {
            isPressed: false,
            currentPos: { x: 0, y: 0 },
            startPos: { x: 0, y: 0 }
        };
        
        // Animation and feedback
        this.animations = [];
        this.particles = [];
        
        // Game settings
        this.snapDistance = 30; // How close to snap to drop zone
        this.celebrationDuration = 3000; // ms
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadImages().then(() => {
            this.imagesLoaded = true;
            this.initializeNestPuzzle();
        });
    }
    
    async loadImages() {
        const imagePromises = [
            this.loadImage('assets/images/bird.svg', 'bird'),
            this.loadImage('assets/images/stick-straight.svg', 'stickStraight'),
            this.loadImage('assets/images/stick-curved.svg', 'stickCurved'),
            this.loadImage('assets/images/stick-y-shaped.svg', 'stickYShaped')
        ];
        
        try {
            await Promise.all(imagePromises);
            console.log('All images loaded successfully');
        } catch (error) {
            console.warn('Some images failed to load, using fallback rendering:', error);
        }
    }
    
    loadImage(src, key) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                resolve(null); // Don't reject, just continue without the image
            };
            img.src = src;
        });
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
        
        // Store canvas dimensions
        this.width = viewport.width;
        this.height = viewport.height;
        
        // Position nest foundation in center
        this.nestFoundation.centerX = this.width / 2;
        this.nestFoundation.centerY = this.height / 2 - 50;
        this.nestFoundation.x = this.nestFoundation.centerX - this.nestFoundation.width / 2;
        this.nestFoundation.y = this.nestFoundation.centerY - this.nestFoundation.height / 2;
    }
    
    setupEventListeners() {
        // Prevent default touch behaviors
        Utils.input.preventDefaults(this.canvas);
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Mouse events (for desktop testing)
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Resize handler
        window.addEventListener('resize', Utils.debounce(() => {
            this.setupCanvas();
            this.repositionElements();
        }, 250));
    }
    
    initializeNestPuzzle() {
        // Create the nest foundation drop zones
        this.createDropZones();
        
        // Create available sticks for building
        this.createAvailableSticks();
        
        // Reset progress
        this.progress = 0;
    }
    
    createDropZones() {
        const foundation = this.nestFoundation;
        
        // Create drop zones in a circular pattern for the nest
        this.dropZones = [
            // Bottom foundation layer
            { 
                id: 'bottom-1', 
                x: foundation.centerX - 80, 
                y: foundation.centerY + 40, 
                width: 60, 
                height: 12, 
                stickType: 'straight',
                filled: false,
                angle: 0
            },
            { 
                id: 'bottom-2', 
                x: foundation.centerX + 20, 
                y: foundation.centerY + 40, 
                width: 60, 
                height: 12, 
                stickType: 'straight',
                filled: false,
                angle: 0
            },
            
            // Left side
            { 
                id: 'left-1', 
                x: foundation.centerX - 90, 
                y: foundation.centerY, 
                width: 50, 
                height: 10, 
                stickType: 'curved',
                filled: false,
                angle: -Math.PI / 3
            },
            { 
                id: 'left-2', 
                x: foundation.centerX - 85, 
                y: foundation.centerY - 30, 
                width: 45, 
                height: 10, 
                stickType: 'y-shaped',
                filled: false,
                angle: -Math.PI / 4
            },
            
            // Right side
            { 
                id: 'right-1', 
                x: foundation.centerX + 90, 
                y: foundation.centerY, 
                width: 50, 
                height: 10, 
                stickType: 'curved',
                filled: false,
                angle: Math.PI / 3
            },
            { 
                id: 'right-2', 
                x: foundation.centerX + 85, 
                y: foundation.centerY - 30, 
                width: 45, 
                height: 10, 
                stickType: 'y-shaped',
                filled: false,
                angle: Math.PI / 4
            }
        ];
    }
    
    createAvailableSticks() {
        this.availableSticks = [];
        
        // Create sticks based on drop zones needed
        const stickCounts = { straight: 2, curved: 2, 'y-shaped': 2 };
        
        let stickId = 0;
        let xOffset = 0;
        Object.entries(stickCounts).forEach(([type, count]) => {
            const stickTemplate = this.stickTypes.find(s => s.type === type);
            
            for (let i = 0; i < count; i++) {
                const stick = {
                    id: `stick-${stickId++}`,
                    type: type,
                    x: 50 + xOffset,
                    y: this.height - 100,
                    width: stickTemplate.length,
                    height: stickTemplate.thickness,
                    color: stickTemplate.color,
                    angle: 0,
                    isPlaced: false,
                    originalPos: { x: 50 + xOffset, y: this.height - 100 }
                };
                this.availableSticks.push(stick);
                xOffset += 80; // Space them out properly
            }
        });
        
        console.log('Created sticks:', this.availableSticks); // Debug log
    }
    
    repositionElements() {
        // Reposition elements after canvas resize
        this.createDropZones();
        
        // Reposition available sticks
        this.availableSticks.forEach((stick, index) => {
            if (!stick.isPlaced) {
                stick.x = 50 + (index * 80);
                stick.y = this.height - 100;
                stick.originalPos = { x: stick.x, y: stick.y };
            }
        });
    }
    
    // Input handling
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const pos = this.getTouchPos(touch);
        this.handleInputStart(pos.x, pos.y);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const pos = this.getTouchPos(touch);
        this.handleInputMove(pos.x, pos.y);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.handleInputEnd();
    }
    
    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        this.handleInputStart(pos.x, pos.y);
    }
    
    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        this.handleInputMove(pos.x, pos.y);
    }
    
    handleMouseUp(e) {
        this.handleInputEnd();
    }
    
    getTouchPos(touch) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    handleInputStart(x, y) {
        console.log('Input start at:', x, y); // Debug log
        this.inputState.isPressed = true;
        this.inputState.startPos = { x, y };
        this.inputState.currentPos = { x, y };
        
        // Check if we're clicking on a stick
        const clickedStick = this.getStickAt(x, y);
        console.log('Clicked stick:', clickedStick); // Debug log
        if (clickedStick && !clickedStick.isPlaced) {
            console.log('Starting drag for stick:', clickedStick.id); // Debug log
            this.startDragging(clickedStick, x, y);
        }
    }
    
    handleInputMove(x, y) {
        this.inputState.currentPos = { x, y };
        
        if (this.dragState.isDragging && this.dragState.draggedStick) {
            // Update stick position
            this.dragState.draggedStick.x = x - this.dragState.dragOffset.x;
            this.dragState.draggedStick.y = y - this.dragState.dragOffset.y;
        }
    }
    
    handleInputEnd() {
        if (this.dragState.isDragging) {
            this.stopDragging();
        }
        
        this.inputState.isPressed = false;
    }
    
    getStickAt(x, y) {
        // Check available sticks (in reverse order for top-most)
        for (let i = this.availableSticks.length - 1; i >= 0; i--) {
            const stick = this.availableSticks[i];
            if (this.isPointInStick(x, y, stick)) {
                return stick;
            }
        }
        return null;
    }
    
    isPointInStick(x, y, stick) {
        // Simple rectangular hit test (can be improved for rotated sticks)
        return x >= stick.x && x <= stick.x + stick.width &&
               y >= stick.y && y <= stick.y + stick.height;
    }
    
    startDragging(stick, x, y) {
        this.dragState.isDragging = true;
        this.dragState.draggedStick = stick;
        this.dragState.dragOffset = {
            x: x - stick.x,
            y: y - stick.y
        };
        this.dragState.startPos = { x: stick.x, y: stick.y };
    }
    
    stopDragging() {
        if (!this.dragState.draggedStick) return;
        
        const stick = this.dragState.draggedStick;
        const dropZone = this.findNearestDropZone(stick);
        
        if (dropZone && dropZone.stickType === stick.type && !dropZone.filled) {
            // Successful placement
            this.placeStickInZone(stick, dropZone);
            this.createSuccessAnimation(dropZone);
            this.updateProgress();
        } else {
            // Return to original position
            this.returnStickToOriginal(stick);
        }
        
        // Reset drag state
        this.dragState.isDragging = false;
        this.dragState.draggedStick = null;
    }
    
    findNearestDropZone(stick) {
        let nearest = null;
        let minDistance = this.snapDistance;
        
        this.dropZones.forEach(zone => {
            if (zone.filled) return;
            
            const distance = Math.sqrt(
                Math.pow(stick.x + stick.width/2 - zone.x, 2) + 
                Math.pow(stick.y + stick.height/2 - zone.y, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = zone;
            }
        });
        
        return nearest;
    }
    
    placeStickInZone(stick, zone) {
        // Position stick in the zone
        stick.x = zone.x - stick.width / 2;
        stick.y = zone.y - stick.height / 2;
        stick.angle = zone.angle;
        stick.isPlaced = true;
        
        // Mark zone as filled
        zone.filled = true;
        zone.stickId = stick.id;
        
        // Move to placed sticks array
        this.placedSticks.push(stick);
        this.availableSticks = this.availableSticks.filter(s => s.id !== stick.id);
    }
    
    returnStickToOriginal(stick) {
        // Animate back to original position
        this.animateStickReturn(stick);
    }
    
    animateStickReturn(stick) {
        const startX = stick.x;
        const startY = stick.y;
        const targetX = stick.originalPos.x;
        const targetY = stick.originalPos.y;
        const duration = 300; // ms
        
        this.animations.push({
            type: 'stickReturn',
            stick: stick,
            startTime: Date.now(),
            duration: duration,
            startPos: { x: startX, y: startY },
            targetPos: { x: targetX, y: targetY }
        });
    }
    
    createSuccessAnimation(zone) {
        // Create celebration particles
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: zone.x + Utils.random(-20, 20),
                y: zone.y + Utils.random(-20, 20),
                vx: Utils.random(-2, 2),
                vy: Utils.random(-3, -1),
                life: 1.0,
                decay: 0.02,
                color: `hsl(${Utils.random(40, 60)}, 80%, 60%)`,
                size: Utils.random(3, 8)
            });
        }
    }
    
    updateProgress() {
        const totalZones = this.dropZones.length;
        const filledZones = this.dropZones.filter(zone => zone.filled).length;
        this.progress = (filledZones / totalZones) * 100;
        
        if (this.progress >= 100) {
            this.completeNest();
        }
    }
    
    completeNest() {
        this.state = 'completed';
        
        // Create big celebration
        this.createCompletionCelebration();
        
        // Trigger completion callback after delay
        setTimeout(() => {
            if (this.onNestComplete) {
                this.onNestComplete();
            }
        }, 2000);
    }
    
    createCompletionCelebration() {
        // Create lots of celebration particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: this.nestFoundation.centerX + Utils.random(-100, 100),
                y: this.nestFoundation.centerY + Utils.random(-100, 100),
                vx: Utils.random(-5, 5),
                vy: Utils.random(-8, -2),
                life: 1.0,
                decay: 0.01,
                color: `hsl(${Utils.random(0, 360)}, 80%, 60%)`,
                size: Utils.random(5, 15)
            });
        }
    }
    
    update(deltaTime) {
        // Update animations
        this.updateAnimations(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
    }
    
    updateAnimations(deltaTime) {
        this.animations = this.animations.filter(anim => {
            const elapsed = Date.now() - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);
            
            if (anim.type === 'stickReturn') {
                // Ease out animation
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                anim.stick.x = anim.startPos.x + (anim.targetPos.x - anim.startPos.x) * easeProgress;
                anim.stick.y = anim.startPos.y + (anim.targetPos.y - anim.startPos.y) * easeProgress;
            }
            
            return progress < 1;
        });
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life -= particle.decay;
            
            return particle.life > 0;
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw nest foundation
        this.drawNestFoundation();
        
        // Draw drop zones (for debugging/guidance)
        if (this.state === 'playing') {
            this.drawDropZones();
        }
        
        // Draw placed sticks
        this.drawPlacedSticks();
        
        // Draw available sticks
        this.drawAvailableSticks();
        
        // Draw particles
        this.drawParticles();
        
        // Draw progress
        this.drawProgress();
        
        // Draw completion message
        if (this.state === 'completed') {
            this.drawCompletionMessage();
        }
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8E8');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Simple clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.drawCloud(100, 80, 60);
        this.drawCloud(this.width - 150, 120, 80);
        this.drawCloud(this.width / 2, 60, 50);
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y, size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x - size * 0.3, y, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawNestFoundation() {
        const foundation = this.nestFoundation;
        
        // Draw tree branch
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(foundation.x - 20, foundation.y + foundation.height);
        this.ctx.lineTo(foundation.x + foundation.width + 20, foundation.y + foundation.height);
        this.ctx.stroke();
        
        // Draw branch texture
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const x = foundation.x + (i * foundation.width / 4);
            this.ctx.beginPath();
            this.ctx.moveTo(x, foundation.y + foundation.height - 5);
            this.ctx.lineTo(x + 10, foundation.y + foundation.height + 5);
            this.ctx.stroke();
        }
    }
    
    drawDropZones() {
        this.dropZones.forEach(zone => {
            if (zone.filled) return;
            
            // Draw subtle guidance
            this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            
            this.ctx.save();
            this.ctx.translate(zone.x, zone.y);
            this.ctx.rotate(zone.angle);
            this.ctx.strokeRect(-zone.width/2, -zone.height/2, zone.width, zone.height);
            this.ctx.restore();
            
            this.ctx.setLineDash([]);
        });
    }
    
    drawPlacedSticks() {
        this.placedSticks.forEach(stick => {
            this.drawStick(stick);
        });
    }
    
    drawAvailableSticks() {
        console.log('Drawing available sticks:', this.availableSticks.length); // Debug
        this.availableSticks.forEach((stick, index) => {
            console.log(`Drawing stick ${index}:`, stick.x, stick.y, stick.width, stick.height); // Debug
            this.drawStick(stick);
        });
    }
    
    drawStick(stick) {
        this.ctx.save();
        
        // Move to stick center and rotate
        this.ctx.translate(stick.x + stick.width/2, stick.y + stick.height/2);
        this.ctx.rotate(stick.angle);
        
        // Draw stick based on type
        this.ctx.fillStyle = stick.color;
        
        if (stick.type === 'straight') {
            this.ctx.fillRect(-stick.width/2, -stick.height/2, stick.width, stick.height);
        } else if (stick.type === 'curved') {
            // Draw curved stick
            this.ctx.beginPath();
            this.ctx.arc(0, stick.width/3, stick.width/2, -Math.PI/2, Math.PI/2);
            this.ctx.lineWidth = stick.height;
            this.ctx.strokeStyle = stick.color;
            this.ctx.stroke();
        } else if (stick.type === 'y-shaped') {
            // Draw Y-shaped stick
            this.ctx.lineWidth = stick.height;
            this.ctx.strokeStyle = stick.color;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, stick.width/2);
            this.ctx.lineTo(0, 0);
            this.ctx.lineTo(-stick.width/3, -stick.width/3);
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(stick.width/3, -stick.width/3);
            this.ctx.stroke();
        }
        
        // Add highlight if being dragged
        if (this.dragState.draggedStick === stick) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(-stick.width/2 - 5, -stick.height/2 - 5, stick.width + 10, stick.height + 10);
        }
        
        this.ctx.restore();
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawProgress() {
        // Progress bar at top
        const barWidth = this.width * 0.6;
        const barHeight = 20;
        const barX = (this.width - barWidth) / 2;
        const barY = 30;
        
        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress fill
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(barX, barY, barWidth * (this.progress / 100), barHeight);
        
        // Border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Text
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Nest Building: ${Math.round(this.progress)}%`, this.width / 2, barY + barHeight + 20);
    }
    
    drawCompletionMessage() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Success message
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎉 Nest Complete! 🎉', this.width / 2, this.height / 2 - 20);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Great job building the nest!', this.width / 2, this.height / 2 + 20);
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
    
    reset() {
        // Reset all game state
        this.initializeNestPuzzle();
        this.particles = [];
        this.animations = [];
        this.dragState.isDragging = false;
        this.dragState.draggedStick = null;
        this.state = 'playing';
    }
    
    gameLoop(currentTime = 0) {
        if (this.state === 'paused') return;
        
        const deltaTime = currentTime - (this.lastTime || 0);
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = Utils.animation.requestFrame((time) => this.gameLoop(time));
    }
    
    // Public methods for UI interaction
    getProgress() {
        return this.progress;
    }
    
    getState() {
        return this.state;
    }
    
    setCompletionCallback(callback) {
        this.onNestComplete = callback;
    }
}
