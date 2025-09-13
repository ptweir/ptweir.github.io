class FoodManager {
    constructor() {
        this.foods = [
            { emoji: '🍎', name: 'Apple' },
            { emoji: '🍌', name: 'Banana' },
            { emoji: '🍇', name: 'Grapes' },
            { emoji: '🍓', name: 'Strawberry' },
            { emoji: '🥕', name: 'Carrot' },
            { emoji: '🥪', name: 'Sandwich' },
            { emoji: '🍪', name: 'Cookie' },
            { emoji: '🧀', name: 'Cheese' },
            { emoji: '🥨', name: 'Pretzel' },
            { emoji: '🍊', name: 'Orange' },
            { emoji: '🥒', name: 'Pickle' },
            { emoji: '🍒', name: 'Cherries' },
            { emoji: '🥖', name: 'Bread' },
            { emoji: '🍯', name: 'Honey' },
            { emoji: '🥜', name: 'Nuts' },
            { emoji: '🍑', name: 'Peach' },
            { emoji: '🍈', name: 'Melon' },
            { emoji: '🥝', name: 'Kiwi' }
        ];
        
        this.basket = [];
        this.selectedFood = null;
        this.usedFoods = new Set();
    }
    
    getRandomFoods(count = 6) {
        // Get foods that haven't been used yet
        const availableFoods = this.foods.filter(food => !this.usedFoods.has(food.name));
        
        // If we've used all foods, reset the used foods set
        if (availableFoods.length < count) {
            this.usedFoods.clear();
            return this.getRandomFoods(count);
        }
        
        // Shuffle and return the requested number of foods
        const shuffled = [...availableFoods].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    displayFoodSelection(container) {
        const foods = this.getRandomFoods(6);
        container.innerHTML = '';
        
        foods.forEach(food => {
            const foodElement = document.createElement('div');
            foodElement.className = 'food-item';
            foodElement.innerHTML = `
                <span class="food-emoji">${food.emoji}</span>
                <span class="food-name">${food.name}</span>
            `;
            
            foodElement.addEventListener('click', () => {
                // Remove previous selection
                container.querySelectorAll('.food-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Select this food
                foodElement.classList.add('selected');
                this.selectedFood = food;
                
                // Enable continue button
                const continueBtn = document.getElementById('continue-adventure-btn');
                const finishBtn = document.getElementById('finish-adventure-btn');
                continueBtn.disabled = false;
                finishBtn.disabled = false;
            });
            
            container.appendChild(foodElement);
        });
        
        // Reset selection
        this.selectedFood = null;
        const continueBtn = document.getElementById('continue-adventure-btn');
        const finishBtn = document.getElementById('finish-adventure-btn');
        if (continueBtn) continueBtn.disabled = true;
        if (finishBtn) finishBtn.disabled = true;
    }
    
    addSelectedFoodToBasket() {
        if (this.selectedFood) {
            this.basket.push(this.selectedFood);
            this.usedFoods.add(this.selectedFood.name);
            this.selectedFood = null;
            return true;
        }
        return false;
    }
    
    displayBasket(container) {
        container.innerHTML = '';
        
        if (this.basket.length === 0) {
            container.innerHTML = '<p style="color: #666; font-style: italic;">Your basket is empty!</p>';
            return;
        }
        
        this.basket.forEach((food, index) => {
            const foodElement = document.createElement('div');
            foodElement.className = 'basket-food';
            foodElement.innerHTML = `
                <span class="food-emoji">${food.emoji}</span>
                <span class="food-name">${food.name}</span>
            `;
            
            // Add a slight delay for animation
            setTimeout(() => {
                container.appendChild(foodElement);
            }, index * 100);
        });
    }
    
    displayBasketForPicnic(container) {
        container.innerHTML = '';
        
        if (this.basket.length === 0) {
            container.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; padding: 20px;">Your basket is empty!</p>';
            return;
        }
        
        this.basket.forEach((food, index) => {
            const foodElement = document.createElement('div');
            foodElement.className = 'basket-food';
            foodElement.innerHTML = `
                <span class="food-emoji">${food.emoji}</span>
                <span class="food-name">${food.name}</span>
            `;
            
            // Add a slight delay for animation
            setTimeout(() => {
                container.appendChild(foodElement);
            }, index * 100);
        });
    }
    
    getBasketCount() {
        return this.basket.length;
    }
    
    clearBasket() {
        this.basket = [];
        this.usedFoods.clear();
        this.selectedFood = null;
    }
    
    getBasketSummary() {
        if (this.basket.length === 0) {
            return "No foods collected yet!";
        }
        
        const foodNames = this.basket.map(food => food.name);
        if (foodNames.length === 1) {
            return `You collected: ${foodNames[0]}`;
        } else if (foodNames.length === 2) {
            return `You collected: ${foodNames[0]} and ${foodNames[1]}`;
        } else {
            const lastFood = foodNames.pop();
            return `You collected: ${foodNames.join(', ')}, and ${lastFood}`;
        }
    }
}
