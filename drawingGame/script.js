document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const drawingCanvas = document.createElement('canvas');
    const drawingCtx = drawingCanvas.getContext('2d');
    let currentColor = '#000000';
    let currentWidth = 10;
    let isDrawing = false;
    let numSegments = 8;
    let mirrorSegments = true;
    let isDarkMode = false;
    let specialBrush = null;
    let lastDrawTime = 0;
    const BRUSH_SPACING = 20; // Minimum pixels between special brush symbols

    // Get rotation offset based on number of segments
    function getRotationOffset() {
        // For 4 or 8 segments, rotate by half a segment
        if (numSegments === 4 || numSegments === 8) {
            return Math.PI / numSegments;
        }
        return 0;
    }

    // Create heart path
    function drawHeart(ctx, x, y, size) {
        const scale = size / 24;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.translate(-12, -12);
        ctx.fillStyle = currentColor;
        ctx.fill(new Path2D('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'));
        ctx.restore();
    }

    // Create star path
    function drawStar(ctx, x, y, size) {
        const scale = size / 24;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.translate(-12, -12);
        ctx.fillStyle = currentColor;
        ctx.fill(new Path2D('M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'));
        ctx.restore();
    }

    // Set canvas size to match its display size and clear it
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawingCanvas.width = rect.width;
        drawingCanvas.height = rect.height;
        updateDisplay();
    }

    // Clear the canvas
    function clearCanvas() {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        updateDisplay();
    }

    // Update the display canvas with background and drawing
    function updateDisplay() {
        // Draw background
        ctx.fillStyle = isDarkMode ? '#000000' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the content on top
        ctx.drawImage(drawingCanvas, 0, 0);
    }

    // Initial resize
    resizeCanvas();

    // Resize canvas when window is resized
    window.addEventListener('resize', resizeCanvas);

    // Get center point of canvas
    function getCenter() {
        return {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
    }

    // Convert point from canvas coordinates to polar coordinates
    function toPolar(x, y) {
        const center = getCenter();
        const dx = x - center.x;
        const dy = y - center.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        const rotationOffset = getRotationOffset();
        // Subtract rotation offset to counter-rotate input point
        const angle = Math.atan2(dy, dx) - rotationOffset;
        return { radius, angle };
    }

    // Convert point from polar coordinates to canvas coordinates
    function fromPolar(radius, angle) {
        const center = getCenter();
        const rotationOffset = getRotationOffset();
        // Add rotation offset back when converting to canvas coordinates
        const adjustedAngle = angle + rotationOffset;
        return {
            x: center.x + radius * Math.cos(adjustedAngle),
            y: center.y + radius * Math.sin(adjustedAngle)
        };
    }

    // Calculate distance between two points
    function distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Draw a point at the given coordinates and mirror it across all segments
    function drawMirroredPoint(x, y) {
        const center = getCenter();
        const polar = toPolar(x, y);
        
        drawingCtx.save();
        
        // Draw in each segment
        for (let i = 0; i < numSegments; i++) {
            const segmentAngle = (2 * Math.PI * i) / numSegments;
            let rotatedAngle = polar.angle + segmentAngle;
            
            if (mirrorSegments && i % 2 === 1) {
                rotatedAngle = -rotatedAngle + (2 * segmentAngle);
            }
            
            const point = fromPolar(polar.radius, rotatedAngle);
            
            if (!lastPoints[i]) {
                lastPoints[i] = point;
            }

            // Handle special brushes and emojis
            if (specialBrush) {
                const dist = distance(lastPoints[i].x, lastPoints[i].y, point.x, point.y);
                if (dist >= BRUSH_SPACING) {
                    if (specialBrush === 'hearts') {
                        drawHeart(drawingCtx, point.x, point.y, currentWidth * 2);
                    } else if (specialBrush === 'stars') {
                        drawStar(drawingCtx, point.x, point.y, currentWidth * 2);
                    } else if (specialBrush === 'emoji') {
                        drawingCtx.save();
                        drawingCtx.font = `${currentWidth * 2}px Arial`;
                        drawingCtx.textAlign = 'center';
                        drawingCtx.textBaseline = 'middle';
                        drawingCtx.fillText(currentEmoji, point.x, point.y);
                        drawingCtx.restore();
                    }
                    lastPoints[i] = point;
                }
            } else {
                // Normal line drawing
                drawingCtx.lineWidth = currentWidth;
                drawingCtx.lineCap = 'round';
                drawingCtx.strokeStyle = currentColor;
                drawingCtx.beginPath();
                drawingCtx.moveTo(lastPoints[i].x, lastPoints[i].y);
                drawingCtx.lineTo(point.x, point.y);
                drawingCtx.stroke();
                lastPoints[i] = point;
            }
        }
        
        drawingCtx.restore();
        updateDisplay();
    }

    // Color picker functionality
    const colorButtons = document.querySelectorAll('.color-btn');
    let currentEmoji = '🌟';
    const emojiPopup = document.getElementById('emojiPopup');
    let isEmojiPickerOpen = false;
    let isRandomMode = false;

    // All available colors (excluding special brushes)
    const availableColors = [
        // Warm Colors
        '#FF355E', // Bright Red (like raspberry)
        '#FF69B4', // Hot Pink
        '#FF7F50', // Coral
        '#FF8C00', // Dark Orange
        '#FFD700', // Gold Yellow
        
        // Cool Colors
        '#2ECCB9', // Teal
        '#00CED1', // Turquoise
        '#1E90FF', // Bright Blue
        '#4169E1', // Royal Blue
        '#8A2BE2', // Blue Violet
        
        // Fresh/Fun Colors
        '#32CD32', // Lime Green
        '#9FE2BF', // Seafoam Green
        '#FF1493', // Deep Pink
        '#9B30FF'  // Purple
    ];

    // All available emojis
    const availableEmojis = [
        '💖', '⭐', '🌈', '🦄', '❄️', '💩',
        '🌺', '🦋', '🔥', '🌸', '✨', '🚀'
    ];

    // Function to get a random drawing option
    function getRandomOption() {
        const allOptions = [
            ...availableColors.map(color => ({ type: 'color', value: color })),
            ...availableEmojis.map(emoji => ({ type: 'emoji', value: emoji }))
        ];
        return allOptions[Math.floor(Math.random() * allOptions.length)];
    }

    // Function to apply a random option
    function applyRandomOption() {
        const option = getRandomOption();
        if (option.type === 'color') {
            specialBrush = null;
            currentColor = option.value;
        } else if (option.type === 'emoji') {
            specialBrush = 'emoji';
            currentEmoji = option.value;
        }
    }

    // Close emoji popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.emoji-picker') && !e.target.closest('.emoji-popup')) {
            emojiPopup.classList.remove('show');
            isEmojiPickerOpen = false;
        }
    });

    // Handle emoji picker button click
    document.querySelector('.emoji-picker').addEventListener('click', (e) => {
        e.stopPropagation();
        isEmojiPickerOpen = !isEmojiPickerOpen;
        if (isEmojiPickerOpen) {
            const button = e.currentTarget;
            const buttonRect = button.getBoundingClientRect();
            emojiPopup.style.left = `${buttonRect.left}px`;
            emojiPopup.classList.add('show');
        } else {
            emojiPopup.classList.remove('show');
        }
    });

    // Handle emoji selection
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentEmoji = btn.dataset.emoji;
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            emojiPopup.classList.remove('show');
            isEmojiPickerOpen = false;

            // Update color picker UI
            colorButtons.forEach(b => b.classList.remove('active'));
            document.querySelector('.emoji-picker').classList.add('active');
            specialBrush = 'emoji';
            isRandomMode = false;
        });
    });

    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('emoji-picker')) {
                return; // Emoji picker button handling is separate
            }
            if (btn.classList.contains('random-picker')) {
                isRandomMode = true;
                applyRandomOption();
            } else {
                isRandomMode = false;
                currentColor = btn.dataset.color;
                specialBrush = ['hearts', 'stars'].includes(currentColor) ? currentColor : null;
                if (specialBrush) {
                    currentColor = specialBrush === 'hearts' ? '#FF4136' : '#FFDC00';
                }
            }
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Line width slider functionality
    const lineWidthSlider = document.getElementById('lineWidth');
    const widthValueSvg = document.getElementById('widthValueSvg');
    
    lineWidthSlider.addEventListener('input', (e) => {
        currentWidth = parseInt(e.target.value);
        widthValueSvg.textContent = currentWidth;
    });

    // Segment count slider functionality
    const segmentSlider = document.getElementById('segmentCount');
    const segmentValueSvg = document.getElementById('segmentValueSvg');

    segmentSlider.addEventListener('input', (e) => {
        numSegments = parseInt(e.target.value);
        segmentValueSvg.textContent = numSegments;
        lastPoints = new Array(numSegments).fill(null);
    });

    // Mirror segments checkbox functionality
    const mirrorCheckbox = document.getElementById('mirrorSegments');
    
    mirrorCheckbox.addEventListener('change', (e) => {
        mirrorSegments = e.target.checked;
        lastPoints = new Array(numSegments).fill(null);
    });

    // Dark mode checkbox functionality
    const darkModeCheckbox = document.getElementById('darkMode');
    
    darkModeCheckbox.addEventListener('change', (e) => {
        isDarkMode = e.target.checked;
        updateDisplay();
    });

    // Clear canvas button functionality
    const clearButton = document.getElementById('clearCanvas');
    
    clearButton.addEventListener('click', () => {
        clearCanvas();
        lastPoints = new Array(numSegments).fill(null);
    });

    // Set initial active color
    colorButtons[0].classList.add('active');

    // Store last points for each segment
    let lastPoints = new Array(numSegments).fill(null);

    // Get event point helper function
    function getEventPoint(e) {
        let clientX, clientY;
        
        if (e.touches) {
            if (e.touches.length !== 1) return null;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const rect = canvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    // Drawing functionality
    function startDrawing(e) {
        const point = getEventPoint(e);
        if (!point) return;
        
        isDrawing = true;
        lastPoints = new Array(numSegments).fill(null);
        if (isRandomMode) {
            applyRandomOption();
        }
        draw(e);
    }

    function stopDrawing() {
        isDrawing = false;
        lastPoints = new Array(numSegments).fill(null);
    }

    function draw(e) {
        if (!isDrawing) return;

        const point = getEventPoint(e);
        if (!point) return;
        
        drawMirroredPoint(point.x, point.y);
    }

    // Touch event handlers
    let lastTouchTime = 0;
    const TOUCH_THROTTLE = 16; // About 60fps

    function handleTouchStart(e) {
        e.preventDefault();
        startDrawing(e);
    }

    function handleTouchMove(e) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastTouchTime < TOUCH_THROTTLE) return;
        lastTouchTime = now;
        
        draw(e);
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        stopDrawing();
    }

    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    // Prevent drawing when interacting with controls
    const controlPanel = document.querySelector('.control-panel');
    controlPanel.addEventListener('touchstart', e => e.stopPropagation());
    controlPanel.addEventListener('touchmove', e => e.stopPropagation());
});
