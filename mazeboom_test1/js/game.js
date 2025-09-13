class Game {
    constructor() {
        this.currentScreen = 'welcome';
        this.mazeGame = null;
        this.foodManager = new FoodManager();
        this.mazeCount = 0;
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Initialize event listeners
        this.setupEventListeners();
        
        // Show welcome screen
        this.showScreen('welcome');
    }
    
    setupEventListeners() {
        // Welcome screen
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Maze screen controls
        document.getElementById('reset-maze-btn').addEventListener('click', () => {
            if (this.mazeGame) {
                this.mazeGame.resetPath();
            }
        });
        
        document.getElementById('new-maze-btn').addEventListener('click', () => {
            if (this.mazeGame) {
                this.mazeGame.newMaze();
            }
        });
        
        // Food screen controls
        document.getElementById('continue-adventure-btn').addEventListener('click', () => {
            this.continueAdventure();
        });
        
        document.getElementById('finish-adventure-btn').addEventListener('click', () => {
            this.finishAdventure();
        });
        
        // Picnic screen controls
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.mazeGame && this.currentScreen === 'maze') {
                // Recreate maze with new dimensions
                setTimeout(() => {
                    this.mazeGame.setupCanvas();
                    this.mazeGame.generateMaze();
                }, 100);
            }
        });
    }
    
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.currentScreen = screenName;
        
        // Screen-specific initialization
        if (screenName === 'maze') {
            this.initializeMaze();
        } else if (screenName === 'food') {
            this.initializeFoodSelection();
        } else if (screenName === 'picnic') {
            this.initializePicnic();
        }
    }
    
    startGame() {
        this.mazeCount = 0;
        this.foodManager.clearBasket();
        this.showScreen('maze');
    }
    
    initializeMaze() {
        const canvas = document.getElementById('maze-canvas');
        
        // Create new maze game
        this.mazeGame = new MazeGame(canvas);
        
        // Set completion callback
        this.mazeGame.onComplete = () => {
            setTimeout(() => {
                this.showScreen('food');
            }, 2500);
        };
        
        // Update maze counter
        this.mazeCount++;
        document.getElementById('maze-number').textContent = this.mazeCount;
        
        // Update basket counter
        this.updateBasketCounter();
    }
    
    initializeFoodSelection() {
        const foodGrid = document.getElementById('food-grid');
        this.foodManager.displayFoodSelection(foodGrid);
        
        // Update button states
        const continueBtn = document.getElementById('continue-adventure-btn');
        const finishBtn = document.getElementById('finish-adventure-btn');
        
        continueBtn.disabled = true;
        finishBtn.disabled = true;
        
        // Show different text based on basket contents
        const heading = document.querySelector('#food-screen h2');
        if (this.foodManager.getBasketCount() === 0) {
            heading.textContent = '🎉 Maze Complete! 🎉';
        } else {
            heading.textContent = '🎉 Another Maze Done! 🎉';
        }
    }
    
    continueAdventure() {
        if (this.foodManager.addSelectedFoodToBasket()) {
            this.showScreen('maze');
        }
    }
    
    finishAdventure() {
        if (this.foodManager.addSelectedFoodToBasket()) {
            this.showScreen('picnic');
        }
    }
    
    initializePicnic() {
        const basketContainer = document.getElementById('picnic-basket');
        this.foodManager.displayBasket(basketContainer);
        
        // Update heading with summary
        const heading = document.querySelector('#picnic-screen h2');
        const summary = this.foodManager.getBasketSummary();
        
        if (this.foodManager.getBasketCount() === 1) {
            heading.textContent = '🌿 Picnic Time! 🌿';
        } else {
            heading.textContent = '🌿 What a Feast! 🌿';
        }
        
        // Add summary text
        const existingSummary = document.querySelector('#picnic-screen .basket-summary');
        if (existingSummary) {
            existingSummary.remove();
        }
        
        const summaryElement = document.createElement('p');
        summaryElement.className = 'basket-summary';
        summaryElement.textContent = summary;
        summaryElement.style.cssText = `
            font-size: 1.2rem;
            color: #333;
            margin: 15px 0;
            font-weight: bold;
            text-align: center;
        `;
        
        const picnicContent = document.querySelector('#picnic-screen .content');
        picnicContent.insertBefore(summaryElement, basketContainer);
    }
    
    updateBasketCounter() {
        const basketCount = document.getElementById('basket-count');
        basketCount.textContent = this.foodManager.getBasketCount();
    }
    
    resetGame() {
        this.mazeCount = 0;
        this.foodManager.clearBasket();
        this.mazeGame = null;
        this.showScreen('welcome');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

// Prevent zoom on double tap for mobile
document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    const timeSince = now - (window.lastTouchEnd || 0);
    
    if (timeSince < 300 && timeSince > 0) {
        e.preventDefault();
    }
    
    window.lastTouchEnd = now;
});

// Prevent context menu on long press
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Prevent text selection
document.addEventListener('selectstart', (e) => {
    e.preventDefault();
});
