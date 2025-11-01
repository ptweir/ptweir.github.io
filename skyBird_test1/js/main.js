// SkyBird Game - Main Application Entry Point

/**
 * Main application controller
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
        console.log('SkyBird Game initializing...');
        
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
        this.elements.gameOverScreen = document.getElementById('gameOverScreen');
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
        
        // Score elements
        this.elements.currentScore = document.getElementById('currentScore');
        this.elements.finalScore = document.getElementById('finalScore');
        this.elements.highScore = document.getElementById('highScore');
        
        // Touch controls
        this.elements.tapArea = document.getElementById('tapArea');
        this.elements.tapHint = document.querySelector('.tap-hint');
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
        
        // Game over buttons
        this.elements.playAgainBtn?.addEventListener('click', () => this.playAgain());
        this.elements.mainMenuBtn?.addEventListener('click', () => this.goHome());
        
        // Touch controls for game
        if (this.elements.tapArea) {
            const touchEvents = ['touchstart', 'mousedown'];
            touchEvents.forEach(event => {
                this.elements.tapArea.addEventListener(event, (e) => {
                    e.preventDefault();
                    if (this.game && this.game.getState() === 'playing') {
                        this.hideTapHint();
                    }
                }, { passive: false });
            });
        }
        
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
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }
    
    startLoading() {
        console.log('Starting loading sequence...');
        
        // Simulate loading time for assets
        setTimeout(() => {
            this.finishLoading();
        }, 2000);
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
        this.updateHighScore();
    }
    
    showInstructions() {
        this.showScreen('instructions');
    }
    
    showGameScreen() {
        this.showScreen('game');
        this.showTapHint();
    }
    
    showPauseScreen() {
        this.showScreen('pause');
    }
    
    showGameOverScreen() {
        this.showScreen('gameOver');
        this.updateFinalScore();
    }
    
    // Game control methods
    startGame() {
        console.log('Starting game...');
        this.showGameScreen();
        
        if (this.game) {
            this.game.resetGame();
            this.game.start();
            this.startScoreUpdater();
        }
    }
    
    pauseGame() {
        console.log('Pausing game...');
        if (this.game) {
            this.game.pause();
        }
        this.showPauseScreen();
        this.stopScoreUpdater();
    }
    
    resumeGame() {
        console.log('Resuming game...');
        this.showGameScreen();
        if (this.game) {
            this.game.resume();
        }
        this.startScoreUpdater();
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
        this.stopScoreUpdater();
        this.showStartScreen();
    }
    
    // UI helper methods
    updateScore() {
        if (this.game && this.elements.currentScore) {
            this.elements.currentScore.textContent = this.game.getScore();
        }
    }
    
    updateFinalScore() {
        if (this.game) {
            const score = this.game.getScore();
            const highScore = this.game.getHighScore();
            
            if (this.elements.finalScore) {
                this.elements.finalScore.textContent = score;
            }
            
            if (this.elements.highScore) {
                this.elements.highScore.textContent = highScore;
            }
        }
    }
    
    updateHighScore() {
        if (this.game && this.elements.highScore) {
            this.elements.highScore.textContent = this.game.getHighScore();
        }
    }
    
    startScoreUpdater() {
        this.stopScoreUpdater();
        this.scoreUpdateInterval = setInterval(() => {
            this.updateScore();
            
            // Check if game is over
            if (this.game && this.game.getState() === 'gameOver') {
                this.stopScoreUpdater();
                setTimeout(() => {
                    this.showGameOverScreen();
                }, 1000); // Delay to show the crash
            }
        }, 100);
    }
    
    stopScoreUpdater() {
        if (this.scoreUpdateInterval) {
            clearInterval(this.scoreUpdateInterval);
            this.scoreUpdateInterval = null;
        }
    }
    
    showTapHint() {
        if (this.elements.tapHint) {
            this.elements.tapHint.style.opacity = '0.7';
        }
    }
    
    hideTapHint() {
        if (this.elements.tapHint) {
            this.elements.tapHint.style.opacity = '0';
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
