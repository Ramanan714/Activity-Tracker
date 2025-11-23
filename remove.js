// Activity Tracker - Remove Items Page
class RemoveItemsManager {
    constructor() {
        this.activities = this.loadFromLocalStorage();
        this.currentTheme = this.loadTheme();
        this.currentView = null;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.populateCategoryFilter();
    }

    // Data Management
    loadFromLocalStorage() {
        const data = localStorage.getItem('activityTracker');
        return data ? JSON.parse(data) : { categories: {}, activities: [] };
    }

    saveToLocalStorage() {
        localStorage.setItem('activityTracker', JSON.stringify(this.activities));
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('activityTrackerTheme');
        if (savedTheme === 'system') {
            return this.getSystemTheme();
        }
        return savedTheme || 'system';
    }

    getSystemTheme() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Theme Management
    applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        
        if (theme === 'system') {
            const systemTheme = this.getSystemTheme();
            document.body.classList.add(`${systemTheme}-theme`);
        } else {
            document.body.classList.add(`${theme}-theme`);
        }
        
        this.currentTheme = theme;
    }

    // Event Listeners
    setupEventListeners() {
        // Remove options
        document.getElementById('removeItemBtn').addEventListener('click', () => {
            this.showRemoveItemSection();
        });

        document.getElementById('removeCategoryBtn').addEventListener('click', () => {
            this.showRemoveCategorySection();
        });

        // Search and filter
        document.getElementById('itemSearch').addEventListener('input', () => {
            this.renderItemsList();
        });

        document.getElementById('itemCategoryFilter').addEventListener('change', () => {
            this.renderItemsList();
        });
    }

    // View Management
    showRemoveItemSection() {
        this.hideAllSections();
        document.getElementById('removeItemSection').classList.remove('hidden');
        this.currentView = 'items';
        this.renderItemsList();
    }

    showRemoveCategorySection() {
        this.hideAllSections();
        document.getElementById('removeCategorySection').classList.remove('hidden');
        this.currentView = 'categories';
        this.renderCategoriesList();
    }

    hideAllSections() {
        document.getElementById('removeItemSection').classList.add('hidden');
        document.getElementById('removeCategorySection').classList.add('hidden');
    }

    // Category Filter
    populateCategoryFilter() {
        const filter = document.getElementById('itemCategoryFilter');
        filter.innerHTML = '<option value="">All Categories</option>';
        
        Object.values(this.activities.categories).forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            filter.appendChild(option);
        });
    }

    // Items Management
    renderItemsList() {
        const container = document.getElementById('itemsList');
        const searchTerm = document.getElementById('itemSearch').value.toLowerCase();
        const categoryFilter = document.getElementById('itemCategoryFilter').value;
        
        let filteredItems = this.activities.activities;
        
        // Apply search filter
        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply category filter
        if (categoryFilter) {
            filteredItems = filteredItems.filter(item => item.category === categoryFilter);
        }
        
        container.innerHTML = '';
        
        if (filteredItems.length === 0) {
            container.innerHTML = '<div class="no-items">No items found matching your criteria.</div>';
            return;
        }
        
        filteredItems.forEach(item => {
            const card = this.createItemCard(item);
            container.appendChild(card);
        });
    }

    createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'item-card danger';
        card.dataset.id = item.id;
        
        card.innerHTML = `
            ${item.isFavorite ? '<div class="favorite-icon">★</div>' : ''}
            <div class="item-header">
                <div>
                    <h3 class="item-title">${this.escapeHtml(item.title)}</h3>
                    <span class="item-category">${this.escapeHtml(item.category)}</span>
                </div>
            </div>
            <p class="item-description">${this.escapeHtml(item.description)}</p>
            <div class="item-progress">
                Progress: ${this.escapeHtml(item.progress)}
            </div>
            <div class="item-meta">
                <span>Added: ${this.formatDate(item.createdAt)}</span>
                <span>Updated: ${this.formatDate(item.updatedAt)}</span>
            </div>
            <button class="remove-item-btn" onclick="removeManager.removeItem('${item.id}')">
                Remove
            </button>
        `;
        
        return card;
    }

    removeItem(itemId) {
        const itemIndex = this.activities.activities.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            const itemElement = document.querySelector(`[data-id="${itemId}"]`);
            if (itemElement) {
                itemElement.classList.add('removing');
                setTimeout(() => {
                    this.activities.activities.splice(itemIndex, 1);
                    this.saveToLocalStorage();
                    this.renderItemsList();
                    this.showSuccessMessage('Item removed successfully!');
                }, 500);
            }
        }
    }

    // Categories Management
    renderCategoriesList() {
        const container = document.getElementById('categoriesRemoveList');
        const categories = Object.values(this.activities.categories);
        
        container.innerHTML = '';
        
        if (categories.length === 0) {
            container.innerHTML = '<div class="no-categories">No categories found.</div>';
            return;
        }
        
        categories.forEach(category => {
            const card = this.createCategoryCard(category);
            container.appendChild(card);
        });
    }

    createCategoryCard(category) {
        const card = document.createElement('div');
        card.className = 'category-card';
        
        // Get items in this category
        const categoryItems = this.activities.activities.filter(item => item.category === category.name);
        
        card.innerHTML = `
            <div class="category-header">
                <div class="category-name">${this.escapeHtml(category.name)}</div>
                <div class="category-count">${categoryItems.length} item${categoryItems.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="category-items">
                ${categoryItems.length > 0 ? 
                    categoryItems.map(item => `
                        <div class="category-item">
                            <span class="item-title-small">${this.escapeHtml(item.title)}</span>
                            <span class="item-progress-small">${this.escapeHtml(item.progress)}</span>
                        </div>
                    `).join('') : 
                    '<div class="no-items">No items in this category</div>'
                }
            </div>
            <button class="remove-category-btn" onclick="removeManager.removeCategory('${category.name}')">
                Remove Category & All Items
            </button>
        `;
        
        return card;
    }

    removeCategory(categoryName) {
        if (confirm(`Are you sure you want to remove the category "${categoryName}" and all ${this.activities.activities.filter(item => item.category === categoryName).length} items in it? This action cannot be undone.`)) {
            // Remove all activities in this category
            this.activities.activities = this.activities.activities.filter(
                activity => activity.category !== categoryName
            );
            
            // Remove the category
            delete this.activities.categories[categoryName];
            
            this.saveToLocalStorage();
            this.renderCategoriesList();
            this.populateCategoryFilter();
            this.showSuccessMessage(`Category "${categoryName}" and all its items removed successfully!`);
        }
    }

    // Utility Methods
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    showSuccessMessage(message) {
        // Remove existing message
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = message;
        successMsg.style.position = 'fixed';
        successMsg.style.top = '20px';
        successMsg.style.right = '20px';
        successMsg.style.background = 'var(--primary-color)';
        successMsg.style.color = 'white';
        successMsg.style.padding = '1rem 2rem';
        successMsg.style.borderRadius = 'var(--border-radius)';
        successMsg.style.boxShadow = 'var(--shadow-hover)';
        successMsg.style.zIndex = '1000';
        successMsg.style.animation = 'fadeIn 0.3s ease';
        
        document.body.appendChild(successMsg);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            successMsg.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                successMsg.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
const removeManager = new RemoveItemsManager();