class Game {
    constructor() {
        this.currentScreen = 'welcome';
        this.mazeGame = null;
        this.foodManager = new FoodManager();
        this.mazeCount = 0;
        this.picnicScenes = [
            'picnic_scene_1_oak_tree_with_basket.png',
            'picnic_scene_2_lakeside_with_basket.png', 
            'picnic_scene_3_flower_meadow_with_basket.png'
        ];
        this.currentPicnicScene = 2; // Default to flower meadow (index 2)
        
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
        
        // Create new maze game with difficulty based on maze count
        this.mazeGame = new MazeGame(canvas, this.mazeCount + 1);
        
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
        // Set the background image for the picnic scene
        const picnicScreen = document.getElementById('picnic-screen');
        picnicScreen.style.backgroundImage = `url('${this.picnicScenes[this.currentPicnicScene]}')`;
        
        const basketContainer = document.getElementById('picnic-basket');
        this.foodManager.displayBasketForPicnic(basketContainer);
        
        // Update heading with summary
        const heading = document.querySelector('#picnic-screen h2');
        
        if (this.foodManager.getBasketCount() === 1) {
            heading.textContent = '🌿 Picnic Time! 🌿';
        } else {
            heading.textContent = '🌿 What a Feast! 🌿';
        }
        
        // Initialize drag and drop functionality
        this.initializeDragAndDrop();
    }
    
    initializeDragAndDrop() {
        const picnicScreen = document.getElementById('picnic-screen');
        const blanketArea = document.getElementById('blanket-area');
        let draggedElement = null;
        let dragOffset = { x: 0, y: 0 };
        let isDragging = false;
        
        // Helper function to get the actual food element (in case we clicked on emoji or name)
        const getFoodElement = (target) => {
            if (target.classList.contains('basket-food') || target.classList.contains('placed-food')) {
                return target;
            }
            // Check if we clicked on a child element (emoji or name)
            const parent = target.closest('.basket-food, .placed-food');
            return parent;
        };
        
        // Handle drag start (mouse and touch)
        const handleDragStart = (e) => {
            const foodElement = getFoodElement(e.target);
            if (!foodElement) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            draggedElement = foodElement;
            isDragging = true;
            foodElement.classList.add('dragging');
            
            const rect = foodElement.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            dragOffset.x = clientX - rect.left;
            dragOffset.y = clientY - rect.top;
            
            blanketArea.classList.add('drop-active');
            
            // Store original position info
            draggedElement.originalParent = draggedElement.parentNode;
            draggedElement.originalPosition = {
                position: draggedElement.style.position,
                left: draggedElement.style.left,
                top: draggedElement.style.top,
                transform: draggedElement.style.transform
            };
        };
        
        // Handle drag move
        const handleDragMove = (e) => {
            if (!draggedElement || !isDragging) return;
            e.preventDefault();
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            draggedElement.style.position = 'fixed';
            draggedElement.style.left = (clientX - dragOffset.x) + 'px';
            draggedElement.style.top = (clientY - dragOffset.y) + 'px';
            draggedElement.style.pointerEvents = 'none';
            draggedElement.style.zIndex = '1000';
        };
        
        // Handle drag end
        const handleDragEnd = (e) => {
            if (!draggedElement || !isDragging) return;
            
            const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
            const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
            
            // Check if dropped on blanket area
            const blanketRect = blanketArea.getBoundingClientRect();
            const isOnBlanket = clientX >= blanketRect.left && 
                               clientX <= blanketRect.right && 
                               clientY >= blanketRect.top && 
                               clientY <= blanketRect.bottom;
            
            if (isOnBlanket) {
                // Convert to placed food
                this.placeFoodOnBlanket(draggedElement, clientX, clientY, blanketRect);
            } else {
                // Return to original position
                this.returnFoodToBasket(draggedElement);
            }
            
            // Clean up
            draggedElement.classList.remove('dragging');
            draggedElement.style.pointerEvents = 'auto';
            draggedElement.style.zIndex = '';
            blanketArea.classList.remove('drop-active');
            
            isDragging = false;
            draggedElement = null;
        };
        
        // Add event listeners with delegation
        picnicScreen.addEventListener('mousedown', handleDragStart, true);
        picnicScreen.addEventListener('touchstart', handleDragStart, true);
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchend', handleDragEnd);
        
        // Prevent context menu on food items
        picnicScreen.addEventListener('contextmenu', (e) => {
            if (getFoodElement(e.target)) {
                e.preventDefault();
            }
        });
    }
    
    placeFoodOnBlanket(foodElement, clientX, clientY, blanketRect) {
        // Calculate position relative to blanket
        const relativeX = clientX - blanketRect.left;
        const relativeY = clientY - blanketRect.top;
        
        // Convert to percentage for responsive positioning
        const percentX = (relativeX / blanketRect.width) * 100;
        const percentY = (relativeY / blanketRect.height) * 100;
        
        // Create placed food element
        const placedFood = document.createElement('div');
        placedFood.className = 'placed-food';
        placedFood.innerHTML = foodElement.innerHTML;
        placedFood.style.left = percentX + '%';
        placedFood.style.top = percentY + '%';
        placedFood.style.transform = 'translate(-50%, -50%)';
        
        // Add to blanket area
        const blanketArea = document.getElementById('blanket-area');
        blanketArea.appendChild(placedFood);
        
        // Remove from basket
        foodElement.remove();
    }
    
    returnFoodToBasket(foodElement) {
        // Reset position styles
        foodElement.style.position = 'relative';
        foodElement.style.left = 'auto';
        foodElement.style.top = 'auto';
        foodElement.style.transform = 'none';
        
        // If it was a placed food, convert back to basket food
        if (foodElement.classList.contains('placed-food')) {
            foodElement.className = 'basket-food';
            const basket = document.getElementById('picnic-basket');
            basket.appendChild(foodElement);
        }
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
