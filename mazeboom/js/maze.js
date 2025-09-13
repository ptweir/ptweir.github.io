class MazeGame {
    constructor(canvas, difficulty = 1) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.path = [];
        this.maze = null;
        this.cellSize = 30;
        this.wallThickness = 4;
        this.startPos = null;
        this.endPos = null;
        this.solution = [];
        this.playerPath = [];
        this.isComplete = false;
        this.difficulty = difficulty;
        this.lastValidPosition = null;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.generateMaze();
    }
    
    setupCanvas() {
        // Set canvas size based on viewport
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(window.innerWidth - 40, 600);
        const maxHeight = Math.min(window.innerHeight - 300, 400);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        // Adjust maze size based on difficulty level
        const baseCellSize = 35; // Larger cells for easier mazes
        const minCellSize = 20;  // Smaller cells for harder mazes
        
        // Calculate cell size based on difficulty (easier = larger cells)
        this.cellSize = Math.max(minCellSize, baseCellSize - (this.difficulty - 1) * 2);
        
        // Calculate grid size based on canvas size and difficulty
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        
        // Adjust grid size based on difficulty - make first few mazes much easier
        if (this.difficulty <= 5) {
            // Very easy levels: much smaller grids
            if (this.difficulty === 1) {
                this.cols = Math.min(this.cols, 7);  // Very small for first maze
                this.rows = Math.min(this.rows, 7);
            } else if (this.difficulty === 2) {
                this.cols = Math.min(this.cols, 9);  // Still small for second maze
                this.rows = Math.min(this.rows, 7);
            } else if (this.difficulty === 3) {
                this.cols = Math.min(this.cols, 9);  // Slightly bigger
                this.rows = Math.min(this.rows, 9);
            } else {
                // Gradually increase size for levels 4-5
                this.cols = Math.min(this.cols, 9 + (this.difficulty - 3) * 2);
                this.rows = Math.min(this.rows, 9 + (this.difficulty - 3) * 2);
            }
        }
        
        // Make sure we have odd dimensions for proper maze generation
        if (this.cols % 2 === 0) this.cols--;
        if (this.rows % 2 === 0) this.rows--;
        
        // Ensure minimum size
        this.cols = Math.max(this.cols, 7);
        this.rows = Math.max(this.rows, 7);
        
        // Adjust canvas size to fit the grid exactly
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
        
        // Set canvas style for better touch handling
        this.canvas.style.touchAction = 'none';
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }
    
    generateMaze() {
        // Initialize maze grid (true = wall, false = path)
        this.maze = Array(this.rows).fill().map(() => Array(this.cols).fill(true));
        
        // Generate maze using recursive backtracking
        const stack = [];
        const startRow = 1;
        const startCol = 1;
        
        this.maze[startRow][startCol] = false;
        stack.push([startRow, startCol]);
        
        const directions = [
            [-2, 0], [2, 0], [0, -2], [0, 2]
        ];
        
        while (stack.length > 0) {
            const [row, col] = stack[stack.length - 1];
            const neighbors = [];
            
            for (const [dRow, dCol] of directions) {
                const newRow = row + dRow;
                const newCol = col + dCol;
                
                if (newRow >= 1 && newRow < this.rows - 1 && 
                    newCol >= 1 && newCol < this.cols - 1 && 
                    this.maze[newRow][newCol]) {
                    neighbors.push([newRow, newCol]);
                }
            }
            
            if (neighbors.length > 0) {
                const [nextRow, nextCol] = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Remove wall between current cell and chosen neighbor
                const wallRow = row + (nextRow - row) / 2;
                const wallCol = col + (nextCol - col) / 2;
                
                this.maze[nextRow][nextCol] = false;
                this.maze[wallRow][wallCol] = false;
                
                stack.push([nextRow, nextCol]);
            } else {
                stack.pop();
            }
        }
        
        // Set start and end positions
        this.startPos = { row: 1, col: 1 };
        this.endPos = { row: this.rows - 2, col: this.cols - 2 };
        
        // Find solution path
        this.findSolution();
        
        // Reset game state
        this.playerPath = [];
        this.isComplete = false;
        
        this.draw();
    }
    
    findSolution() {
        // Use BFS to find the solution path
        const queue = [[this.startPos.row, this.startPos.col, []]];
        const visited = new Set();
        
        while (queue.length > 0) {
            const [row, col, path] = queue.shift();
            const key = `${row},${col}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            const newPath = [...path, { row, col }];
            
            if (row === this.endPos.row && col === this.endPos.col) {
                this.solution = newPath;
                return;
            }
            
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            
            for (const [dRow, dCol] of directions) {
                const newRow = row + dRow;
                const newCol = col + dCol;
                
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.cols && 
                    !this.maze[newRow][newCol] && 
                    !visited.has(`${newRow},${newCol}`)) {
                    queue.push([newRow, newCol, newPath]);
                }
            }
        }
    }
    
    getCanvasPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    getCellFromPosition(x, y) {
        return {
            col: Math.floor(x / this.cellSize),
            row: Math.floor(y / this.cellSize)
        };
    }
    
    startDrawing(e) {
        if (this.isComplete) return;
        
        const pos = this.getCanvasPosition(e);
        const cell = this.getCellFromPosition(pos.x, pos.y);
        
        console.log('Start drawing at cell:', cell, 'Start pos:', this.startPos);
        
        // Check if starting from the start position or resuming from existing path
        if (cell.row === this.startPos.row && cell.col === this.startPos.col) {
            this.isDrawing = true;
            this.playerPath = [{ row: cell.row, col: cell.col }];
            this.lastValidPosition = { row: cell.row, col: cell.col };
            console.log('Started drawing! Player path:', this.playerPath);
            this.redraw();
        } else if (this.playerPath.length > 0) {
            // Check if resuming from any point in the existing path
            const pathIndex = this.playerPath.findIndex(p => p.row === cell.row && p.col === cell.col);
            if (pathIndex !== -1) {
                this.isDrawing = true;
                // Trim path to the resume point
                this.playerPath = this.playerPath.slice(0, pathIndex + 1);
                this.lastValidPosition = { row: cell.row, col: cell.col };
                console.log('Resumed drawing from existing path at index:', pathIndex);
                this.redraw();
            }
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDrawing || this.isComplete) return;
        
        const pos = this.getCanvasPosition(e);
        const cell = this.getCellFromPosition(pos.x, pos.y);
        
        console.log('Mouse move - isDrawing:', this.isDrawing, 'cell:', cell);
        
        // Check if the cell is valid (within bounds and not a wall)
        if (cell.row >= 0 && cell.row < this.rows && 
            cell.col >= 0 && cell.col < this.cols && 
            !this.maze[cell.row][cell.col]) {
            
            console.log('Cell is valid path');
            
            // Check if this cell is adjacent to the last cell in the path
            const lastCell = this.playerPath[this.playerPath.length - 1];
            const distance = Math.abs(cell.row - lastCell.row) + Math.abs(cell.col - lastCell.col);
            
            console.log('Distance from last cell:', distance, 'Last cell:', lastCell);
            
            if (distance === 1) {
                // Add to path if not already there
                if (!this.playerPath.some(p => p.row === cell.row && p.col === cell.col)) {
                    console.log('Adding cell to path:', cell);
                    this.playerPath.push({ row: cell.row, col: cell.col });
                    this.redraw();
                    
                    // Check if reached the end
                    if (cell.row === this.endPos.row && cell.col === this.endPos.col) {
                        this.completeLevel();
                    }
                }
            }
        } else {
            console.log('Cell is invalid - wall or out of bounds');
        }
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    completeLevel() {
        this.isComplete = true;
        
        // Show success message
        const successMessage = document.getElementById('success-message');
        successMessage.classList.add('show');
        
        setTimeout(() => {
            successMessage.classList.remove('show');
            // Trigger game completion callback
            if (this.onComplete) {
                this.onComplete();
            }
        }, 2000);
    }
    
    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw maze
        this.ctx.fillStyle = '#333';
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.maze[row][col]) {
                    this.ctx.fillRect(
                        col * this.cellSize,
                        row * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
        
        // Draw start position (house emoji)
        this.ctx.font = `${this.cellSize * 0.8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            '🏠',
            (this.startPos.col + 0.5) * this.cellSize,
            (this.startPos.row + 0.5) * this.cellSize
        );
        
        // Draw end position (target emoji)
        this.ctx.fillText(
            '🎯',
            (this.endPos.col + 0.5) * this.cellSize,
            (this.endPos.row + 0.5) * this.cellSize
        );
        
        // Draw player path
        if (this.playerPath.length > 0) {
            this.ctx.strokeStyle = '#FF6B6B';
            this.ctx.lineWidth = 6;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            const firstCell = this.playerPath[0];
            this.ctx.moveTo(
                (firstCell.col + 0.5) * this.cellSize,
                (firstCell.row + 0.5) * this.cellSize
            );
            
            for (let i = 1; i < this.playerPath.length; i++) {
                const cell = this.playerPath[i];
                this.ctx.lineTo(
                    (cell.col + 0.5) * this.cellSize,
                    (cell.row + 0.5) * this.cellSize
                );
            }
            
            this.ctx.stroke();
            
            // Draw current position indicator (for lift-finger capability)
            if (this.playerPath.length > 0) {
                const lastCell = this.playerPath[this.playerPath.length - 1];
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.beginPath();
                this.ctx.arc(
                    (lastCell.col + 0.5) * this.cellSize,
                    (lastCell.row + 0.5) * this.cellSize,
                    8,
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
            }
        }
    }
    
    resetPath() {
        this.playerPath = [];
        this.isComplete = false;
        this.redraw();
    }
    
    newMaze() {
        this.generateMaze();
    }
    
    // Alias for backward compatibility
    draw() {
        this.redraw();
    }
}
