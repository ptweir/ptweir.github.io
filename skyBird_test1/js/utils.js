// SkyBird Game - Utility Functions

/**
 * Utility functions for the SkyBird game
 */

// Device detection utilities
const Utils = {
    // Check if device is mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Check if device is iOS
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },

    // Check if device is Android
    isAndroid() {
        return /Android/.test(navigator.userAgent);
    },

    // Get device pixel ratio
    getPixelRatio() {
        return window.devicePixelRatio || 1;
    },

    // Get viewport dimensions
    getViewport() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },

    // Clamp a value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Linear interpolation
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // Random number between min and max
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Distance between two points
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Local storage utilities
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn('Failed to get from localStorage:', e);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn('Failed to save to localStorage:', e);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('Failed to remove from localStorage:', e);
                return false;
            }
        }
    },

    // Audio utilities
    audio: {
        // Create audio context (for later use)
        createContext() {
            try {
                return new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported:', e);
                return null;
            }
        },

        // Preload audio file
        preload(src) {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.addEventListener('canplaythrough', () => resolve(audio));
                audio.addEventListener('error', reject);
                audio.src = src;
                audio.load();
            });
        }
    },

    // Touch/input utilities
    input: {
        // Prevent default touch behaviors
        preventDefaults(element) {
            element.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
            element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            element.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
            element.addEventListener('contextmenu', (e) => e.preventDefault());
        },

        // Get touch/mouse position
        getPointerPosition(event, element) {
            const rect = element.getBoundingClientRect();
            const clientX = event.touches ? event.touches[0].clientX : event.clientX;
            const clientY = event.touches ? event.touches[0].clientY : event.clientY;
            
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }
    },

    // Performance utilities
    performance: {
        // Simple FPS counter
        createFPSCounter() {
            let fps = 0;
            let lastTime = performance.now();
            let frameCount = 0;

            return {
                update() {
                    frameCount++;
                    const currentTime = performance.now();
                    
                    if (currentTime >= lastTime + 1000) {
                        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                        frameCount = 0;
                        lastTime = currentTime;
                    }
                },
                getFPS() {
                    return fps;
                }
            };
        }
    },

    // Animation utilities
    animation: {
        // Request animation frame with fallback
        requestFrame(callback) {
            return (window.requestAnimationFrame || 
                   window.webkitRequestAnimationFrame || 
                   window.mozRequestAnimationFrame || 
                   function(callback) { return setTimeout(callback, 1000 / 60); })(callback);
        },

        // Cancel animation frame with fallback
        cancelFrame(id) {
            return (window.cancelAnimationFrame || 
                   window.webkitCancelAnimationFrame || 
                   window.mozCancelAnimationFrame || 
                   clearTimeout)(id);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
