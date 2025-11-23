// Activity Tracker - Add Items Page
class AddItemsManager {
    constructor() {
        this.activities = this.loadFromLocalStorage();
        this.currentTheme = this.loadTheme();
        this.selectedCategory = null;
        this.currentItemsPage = 1;
        this.itemsPerPage = 5;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.populateCategorySelect();
        this.renderExistingCategories();
        this.renderExistingItems();
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
        // Form submission
        document.getElementById('addForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addActivity();
        });

        // New category button
        document.getElementById('newCategoryBtn').addEventListener('click', () => {
            this.toggleNewCategoryForm();
        });

        // Category selection from existing categories
        document.getElementById('categoriesList').addEventListener('click', (e) => {
            if (e.target.classList.contains('category-card')) {
                this.selectExistingCategory(e.target.dataset.category);
            }
        });

        // See more button for items
        document.getElementById('seeMoreBtn').addEventListener('click', () => {
            this.loadMoreItems();
        });
    }

    // Category Management
    addCategory(name) {
        if (!name.trim()) return false;
        
        if (!this.activities.categories[name]) {
            this.activities.categories[name] = {
                name: name,
                createdAt: new Date().toISOString()
            };
            this.saveToLocalStorage();
            this.populateCategorySelect();
            this.renderExistingCategories();
            return true;
        }
        return false;
    }

    // Activity Management
    addActivity() {
        const title = document.getElementById('titleInput').value.trim();
        const description = document.getElementById('descriptionInput').value.trim();
        const progress = document.getElementById('progressInput').value.trim();
        const isFavorite = document.getElementById('favoriteInput').checked;
        
        let category = document.getElementById('categorySelect').value;
        
        // Handle new category
        if (document.getElementById('newCategoryForm').classList.contains('hidden')) {
            if (!category) {
                this.showFormError('categorySelect', 'Please select a category');
                return;
            }
        } else {
            const newCategory = document.getElementById('newCategoryInput').value.trim();
            if (!newCategory) {
                this.showFormError('newCategoryInput', 'Please enter a category name');
                return;
            }
            
            if (!this.addCategory(newCategory)) {
                this.showFormError('newCategoryInput', 'Category already exists');
                return;
            }
            
            category = newCategory;
        }
        
        if (!title) {
            this.showFormError('titleInput', 'Please enter a title');
            return;
        }
        
        if (!progress) {
            this.showFormError('progressInput', 'Please enter progress information');
            return;
        }
        
        const newActivity = {
            id: Date.now().toString(),
            title,
            description,
            category,
            progress,
            isFavorite,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.activities.activities.push(newActivity);
        this.saveToLocalStorage();
        
        // Reset form
        document.getElementById('addForm').reset();
        document.getElementById('newCategoryForm').classList.add('hidden');
        document.getElementById('favoriteInput').checked = false;
        
        // Show success message
        this.showSuccessMessage('Activity added successfully!');
        
        // Update existing categories and items display
        this.renderExistingCategories();
        this.renderExistingItems();
    }

    // UI Rendering
    populateCategorySelect() {
        const select = document.getElementById('categorySelect');
        select.innerHTML = '<option value="">Select Category</option>';
        
        Object.values(this.activities.categories).forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    renderExistingCategories() {
        const container = document.getElementById('categoriesList');
        container.innerHTML = '';
        
        const categories = Object.values(this.activities.categories);
        
        if (categories.length === 0) {
            container.innerHTML = '<div class="no-categories">No categories yet. Create your first category!</div>';
            return;
        }
        
        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = `category-card ${this.selectedCategory === category.name ? 'active' : ''}`;
            categoryCard.dataset.category = category.name;
            
            // Count items in this category
            const itemCount = this.activities.activities.filter(activity => activity.category === category.name).length;
            
            categoryCard.innerHTML = `
                <div class="category-name">${this.escapeHtml(category.name)}</div>
                <div class="category-count">${itemCount} item${itemCount !== 1 ? 's' : ''}</div>
            `;
            
            container.appendChild(categoryCard);
        });
    }

    renderExistingItems() {
        const container = document.getElementById('itemsList');
        const seeMoreBtn = document.getElementById('seeMoreBtn');
        
        // Sort activities by updated date (newest first)
        const sortedActivities = [...this.activities.activities].sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        // Reset to first page
        this.currentItemsPage = 1;
        
        // Calculate items to show
        const startIndex = 0;
        const endIndex = this.itemsPerPage;
        const itemsToShow = sortedActivities.slice(startIndex, endIndex);
        
        container.innerHTML = '';
        
        if (sortedActivities.length === 0) {
            container.innerHTML = '<div class="no-items">No items yet. Add your first activity!</div>';
            seeMoreBtn.classList.add('hidden');
            return;
        }
        
        itemsToShow.forEach(activity => {
            const itemPreview = this.createItemPreview(activity);
            container.appendChild(itemPreview);
        });
        
        // Show/hide see more button
        if (sortedActivities.length > this.itemsPerPage) {
            seeMoreBtn.classList.remove('hidden');
        } else {
            seeMoreBtn.classList.add('hidden');
        }
    }

    createItemPreview(activity) {
        const itemPreview = document.createElement('div');
        itemPreview.className = 'item-preview';
        
        itemPreview.innerHTML = `
            <div class="item-preview-header">
                <div class="item-preview-title">${this.escapeHtml(activity.title)}</div>
                <div class="item-preview-category">${this.escapeHtml(activity.category)}</div>
            </div>
            ${activity.description ? `<div class="item-preview-description">${this.escapeHtml(activity.description)}</div>` : ''}
            <div class="item-preview-progress">Progress: ${this.escapeHtml(activity.progress)}</div>
            <div class="item-preview-meta">
                <span>Updated: ${this.formatDate(activity.updatedAt)}</span>
                <span>
                    ${activity.isFavorite ? '<span class="favorite-indicator">★</span>' : ''}
                </span>
            </div>
        `;
        
        return itemPreview;
    }

    loadMoreItems() {
        const container = document.getElementById('itemsList');
        const seeMoreBtn = document.getElementById('seeMoreBtn');
        
        // Sort activities by updated date (newest first)
        const sortedActivities = [...this.activities.activities].sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        // Calculate items to show
        const startIndex = this.currentItemsPage * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const itemsToShow = sortedActivities.slice(startIndex, endIndex);
        
        // Add new items
        itemsToShow.forEach(activity => {
            const itemPreview = this.createItemPreview(activity);
            container.appendChild(itemPreview);
        });
        
        // Update page counter
        this.currentItemsPage++;
        
        // Hide see more button if no more items
        if (endIndex >= sortedActivities.length) {
            seeMoreBtn.classList.add('hidden');
        }
    }

    // Form Management
    toggleNewCategoryForm() {
        const form = document.getElementById('newCategoryForm');
        form.classList.toggle('hidden');
        
        if (!form.classList.contains('hidden')) {
            document.getElementById('newCategoryInput').focus();
        } else {
            document.getElementById('newCategoryInput').value = '';
        }
    }

    selectExistingCategory(categoryName) {
        this.selectedCategory = categoryName;
        document.getElementById('categorySelect').value = categoryName;
        this.renderExistingCategories();
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

    showFormError(inputId, message) {
        const input = document.getElementById(inputId);
        input.classList.add('error');
        input.focus();
        
        // Remove error class after animation
        setTimeout(() => {
            input.classList.remove('error');
        }, 500);
        
        // Show temporary tooltip
        this.showTooltip(input, message);
    }

    showTooltip(element, message) {
        // Remove existing tooltip
        const existingTooltip = document.querySelector('.tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = message;
        tooltip.style.position = 'absolute';
        tooltip.style.background = 'var(--accent-color)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '0.8rem';
        tooltip.style.zIndex = '1000';
        tooltip.style.top = `${element.offsetTop - 30}px`;
        tooltip.style.left = `${element.offsetLeft}px`;
        
        document.body.appendChild(tooltip);
        
        // Remove tooltip after 3 seconds
        setTimeout(() => {
            tooltip.remove();
        }, 3000);
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
document.addEventListener('DOMContentLoaded', () => {
    new AddItemsManager();
});