// SkyBird Nest Building Game - Main Application Entry Point

/**
 * Main application controller for the nest building puzzle game
 * Handles UI interactions, game initialization, and screen management
 */

class SkyBirdApp {
    constructor() {
        this.game = null;
        this.currentScreen = 'loading';
        this.elements = {};
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        console.log('SkyBird Nest Building Game initializing...');
        
        // Get DOM elements
        this.getElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize game
        this.initGame();
        
        // Start loading sequence
        this.startLoading();
    }
    
    getElements() {
        // Screens
        this.elements.loadingScreen = document.getElementById('loadingScreen');
        this.elements.startScreen = document.getElementById('startScreen');
        this.elements.gameScreen = document.getElementById('gameScreen');
        this.elements.pauseScreen = document.getElementById('pauseScreen');
        this.elements.completedScreen = document.getElementById('completedScreen');
        this.elements.instructionsScreen = document.getElementById('instructionsScreen');
        
        // Canvas and game container
        this.elements.gameCanvas = document.getElementById('gameCanvas');
        this.elements.gameContainer = document.getElementById('gameContainer');
        this.elements.uiOverlay = document.getElementById('uiOverlay');
        
        // Buttons
        this.elements.playBtn = document.getElementById('playBtn');
        this.elements.instructionsBtn = document.getElementById('instructionsBtn');
        this.elements.pauseBtn = document.getElementById('pauseBtn');
        this.elements.resumeBtn = document.getElementById('resumeBtn');
        this.elements.restartBtn = document.getElementById('restartBtn');
        this.elements.homeBtn = document.getElementById('homeBtn');
        this.elements.playAgainBtn = document.getElementById('playAgainBtn');
        this.elements.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.elements.backBtn = document.getElementById('backBtn');
        
        // Progress elements
        this.elements.progressText = document.getElementById('progressText');
        
        // Touch controls (not needed for nest building, but keep for compatibility)
        this.elements.tapArea = document.getElementById('tapArea');
        this.elements.gameHint = document.querySelector('.game-hint');
    }
    
    setupEventListeners() {
        // Menu buttons
        this.elements.playBtn?.addEventListener('click', () => this.startGame());
        this.elements.instructionsBtn?.addEventListener('click', () => this.showInstructions());
        this.elements.backBtn?.addEventListener('click', () => this.showStartScreen());
        
        // Game control buttons
        this.elements.pauseBtn?.addEventListener('click', () => this.pauseGame());
        this.elements.resumeBtn?.addEventListener('click', () => this.resumeGame());
        this.elements.restartBtn?.addEventListener('click', () => this.restartGame());
        this.elements.homeBtn?.addEventListener('click', () => this.goHome());
        
        // Completion screen buttons
        this.elements.playAgainBtn?.addEventListener('click', () => this.playAgain());
        this.elements.mainMenuBtn?.addEventListener('click', () => this.goHome());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'Escape':
                    if (this.currentScreen === 'game') {
                        this.pauseGame();
                    }
                    break;
                case 'Enter':
                    if (this.currentScreen === 'start') {
                        this.startGame();
                    }
                    break;
            }
        });
        
        // Handle visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.game && this.game.getState() === 'playing') {
                this.pauseGame();
            }
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.game) {
                    this.game.setupCanvas();
                }
            }, 100);
        });
    }
    
    initGame() {
        try {
            this.game = new SkyBirdGame(this.elements.gameCanvas);
            
            // Set up completion callback
            this.game.setCompletionCallback(() => {
                this.onNestCompleted();
            });
            
            console.log('Nest building game initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }
    
    startLoading() {
        console.log('Starting loading sequence...');
        
        // Simulate loading time for assets (shorter for simple game)
        setTimeout(() => {
            this.finishLoading();
        }, 1500);
    }
    
    finishLoading() {
        console.log('Loading complete');
        this.hideLoadingScreen();
        this.showStartScreen();
    }
    
    // Screen management
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.elements).forEach(element => {
            if (element && element.classList && element.classList.contains('screen')) {
                element.classList.remove('active');
            }
        });
        
        // Show target screen
        const targetScreen = this.elements[screenName + 'Screen'];
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }
    }
    
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
        }
    }
    
    showStartScreen() {
        this.showScreen('start');
    }
    
    showInstructions() {
        this.showScreen('instructions');
    }
    
    showGameScreen() {
        this.showScreen('game');
        this.showGameHint();
    }
    
    showPauseScreen() {
        this.showScreen('pause');
    }
    
    showCompletedScreen() {
        this.showScreen('completed');
    }
    
    // Game control methods
    startGame() {
        console.log('Starting nest building game...');
        this.showGameScreen();
        
        if (this.game) {
            this.game.reset();
            this.game.start();
            this.startProgressUpdater();
        }
    }
    
    pauseGame() {
        console.log('Pausing game...');
        if (this.game) {
            this.game.pause();
        }
        this.showPauseScreen();
        this.stopProgressUpdater();
    }
    
    resumeGame() {
        console.log('Resuming game...');
        this.showGameScreen();
        if (this.game) {
            this.game.resume();
        }
        this.startProgressUpdater();
    }
    
    restartGame() {
        console.log('Restarting game...');
        this.startGame();
    }
    
    playAgain() {
        console.log('Playing again...');
        this.startGame();
    }
    
    goHome() {
        console.log('Going to main menu...');
        if (this.game) {
            this.game.pause();
        }
        this.stopProgressUpdater();
        this.showStartScreen();
    }
    
    onNestCompleted() {
        console.log('Nest building completed!');
        this.stopProgressUpdater();
        
        // Show completion screen after a delay
        setTimeout(() => {
            this.showCompletedScreen();
        }, 2500);
    }
    
    // UI helper methods
    updateProgress() {
        if (this.game && this.elements.progressText) {
            const progress = this.game.getProgress();
            this.elements.progressText.textContent = `Building Progress: ${Math.round(progress)}%`;
        }
    }
    
    startProgressUpdater() {
        this.stopProgressUpdater();
        this.progressUpdateInterval = setInterval(() => {
            this.updateProgress();
            
            // Check if game is completed
            if (this.game && this.game.getState() === 'completed') {
                this.stopProgressUpdater();
            }
        }, 100);
    }
    
    stopProgressUpdater() {
        if (this.progressUpdateInterval) {
            clearInterval(this.progressUpdateInterval);
            this.progressUpdateInterval = null;
        }
    }
    
    showGameHint() {
        if (this.elements.gameHint) {
            this.elements.gameHint.style.opacity = '0.8';
            this.elements.gameHint.textContent = 'Drag sticks to build the nest!';
            
            // Hide hint after a few seconds
            setTimeout(() => {
                this.hideGameHint();
            }, 4000);
        }
    }
    
    hideGameHint() {
        if (this.elements.gameHint) {
            this.elements.gameHint.style.opacity = '0';
        }
    }
    
    showError(message) {
        console.error(message);
        alert(message); // Simple error display for now
    }
    
    // Public API for debugging
    getGame() {
        return this.game;
    }
    
    getCurrentScreen() {
        return this.currentScreen;
    }
}

// Initialize the application
const skyBirdApp = new SkyBirdApp();

// Make it available globally for debugging
window.SkyBirdApp = skyBirdApp;
