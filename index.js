// Activity Tracker - Main Page
class ActivityTracker {
    constructor() {
        this.activities = this.loadFromLocalStorage();
        this.currentTheme = this.loadTheme();
        this.selectedCategory = 'all';
        this.editingItemId = null;
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.setupThemeToggle();
        this.renderCategories();
        this.renderActivities();
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
        return savedTheme || 'light';
    }

    saveTheme(theme) {
        localStorage.setItem('activityTrackerTheme', theme);
    }

    // Theme Management
    applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        this.currentTheme = theme;
        this.saveTheme(theme);
        
        // Update theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.checked = theme === 'dark';
        }
        
        // Update theme label
        const themeLabel = document.querySelector('.theme-label');
        if (themeLabel) {
            themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.checked = this.currentTheme === 'dark';
            themeToggle.addEventListener('change', (e) => {
                const newTheme = e.target.checked ? 'dark' : 'light';
                this.applyTheme(newTheme);
            });
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchActivities();
        });

        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.searchActivities();
            } else if (e.key === 'Escape') {
                this.hideSearchSuggestions();
            }
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length > 0) {
                this.showSearchSuggestions(searchInput.value);
            }
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                this.hideSearchSuggestions();
            }
        });

        // Sort functionality
        document.getElementById('sortSelect').addEventListener('change', () => {
            this.renderActivities();
        });

        // Category selection
        document.getElementById('categoryList').addEventListener('click', (e) => {
            if (e.target.classList.contains('category-item')) {
                this.selectCategory(e.target.dataset.category);
            }
        });

        // Edit form submission
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateActivity();
        });

        // New category button in edit modal
        document.getElementById('editNewCategoryBtn').addEventListener('click', () => {
            this.toggleNewCategoryForm();
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Modal background close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    // Search Suggestions
    handleSearchInput(query) {
        const searchInput = document.getElementById('searchInput');
        
        // Add searching class for animation
        searchInput.classList.add('searching');
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Set new timeout for suggestions
        this.searchTimeout = setTimeout(() => {
            if (query.length > 0) {
                this.showSearchSuggestions(query);
            } else {
                this.hideSearchSuggestions();
            }
            searchInput.classList.remove('searching');
        }, 300);
    }

    showSearchSuggestions(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        const searchInput = document.getElementById('searchInput');
        
        // Get matching activities
        const matchingActivities = this.activities.activities.filter(activity => 
            activity.title.toLowerCase().includes(query.toLowerCase()) || 
            activity.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Limit to 5 suggestions
        
        suggestionsContainer.innerHTML = '';
        
        if (matchingActivities.length === 0) {
            suggestionsContainer.innerHTML = '<div class="no-suggestions">No matching items found</div>';
        } else {
            matchingActivities.forEach(activity => {
                const suggestion = document.createElement('div');
                suggestion.className = 'search-suggestion';
                suggestion.innerHTML = `
                    <span class="suggestion-title">${this.escapeHtml(activity.title)}</span>
                    <span class="suggestion-category">${this.escapeHtml(activity.category)}</span>
                `;
                
                suggestion.addEventListener('click', () => {
                    searchInput.value = activity.title;
                    this.hideSearchSuggestions();
                    this.searchActivities();
                });
                
                suggestionsContainer.appendChild(suggestion);
            });
        }
        
        suggestionsContainer.classList.remove('hidden');
    }

    hideSearchSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        suggestionsContainer.classList.add('hidden');
    }

    searchActivities() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        this.hideSearchSuggestions();
        
        if (!query) {
            this.renderActivities();
            return;
        }
        
        const filteredActivities = this.activities.activities.filter(activity => 
            activity.title.toLowerCase().includes(query) || 
            activity.category.toLowerCase().includes(query) ||
            activity.description.toLowerCase().includes(query)
        );
        
        const container = document.getElementById('itemsContainer');
        container.innerHTML = '';
        
        if (filteredActivities.length === 0) {
            container.innerHTML = '<p class="no-activities">No activities match your search.</p>';
            return;
        }
        
        filteredActivities.forEach(activity => {
            const card = this.createActivityCard(activity);
            container.appendChild(card);
        });
    }

    // UI Rendering
    renderCategories() {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = '';
        
        // Add "All" category
        const allItem = document.createElement('li');
        allItem.className = `category-item ${this.selectedCategory === 'all' ? 'active' : ''}`;
        allItem.textContent = 'All Categories';
        allItem.dataset.category = 'all';
        categoryList.appendChild(allItem);
        
        // Add each category
        Object.values(this.activities.categories).forEach(category => {
            const item = document.createElement('li');
            item.className = `category-item ${this.selectedCategory === category.name ? 'active' : ''}`;
            item.textContent = category.name;
            item.dataset.category = category.name;
            categoryList.appendChild(item);
        });
    }

    renderActivities() {
        const container = document.getElementById('itemsContainer');
        const sortBy = document.getElementById('sortSelect').value;
        
        // Filter activities by selected category
        let activitiesToShow = this.activities.activities;
        if (this.selectedCategory !== 'all') {
            activitiesToShow = activitiesToShow.filter(activity => activity.category === this.selectedCategory);
        }
        
        // Sort activities
        activitiesToShow = this.sortActivities(activitiesToShow, sortBy);
        
        // Render activities
        container.innerHTML = '';
        
        if (activitiesToShow.length === 0) {
            container.innerHTML = '<p class="no-activities">No activities found. Add some activities to get started!</p>';
            return;
        }
        
        activitiesToShow.forEach(activity => {
            const card = this.createActivityCard(activity);
            container.appendChild(card);
        });
    }

    createActivityCard(activity) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.id = activity.id;
        
        // Create favorite star button
        const favoriteStar = document.createElement('button');
        favoriteStar.className = `favorite-star ${activity.isFavorite ? 'favorite' : ''}`;
        favoriteStar.innerHTML = '★';
        favoriteStar.title = activity.isFavorite ? 'Remove from favorites' : 'Add to favorites';
        favoriteStar.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(activity.id);
        });
        
        // Create edit button
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.innerHTML = '✏️';
        editButton.title = 'Edit this activity';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showEditModal(activity.id);
        });
        
        card.innerHTML = `
            <div class="item-header">
                <div>
                    <h3 class="item-title">${this.escapeHtml(activity.title)}</h3>
                    <span class="item-category">${this.escapeHtml(activity.category)}</span>
                </div>
            </div>
            <p class="item-description">${this.escapeHtml(activity.description)}</p>
            <div class="item-progress">
                Progress: ${this.escapeHtml(activity.progress)}
            </div>
            <div class="item-meta">
                <span>Added: ${this.formatDate(activity.createdAt)}</span>
                <span>Updated: ${this.formatDate(activity.updatedAt)}</span>
            </div>
        `;
        
        card.appendChild(favoriteStar);
        card.appendChild(editButton);
        return card;
    }

    // Favorite Management
    toggleFavorite(itemId) {
        const activityIndex = this.activities.activities.findIndex(activity => activity.id === itemId);
        if (activityIndex !== -1) {
            this.activities.activities[activityIndex].isFavorite = !this.activities.activities[activityIndex].isFavorite;
            this.activities.activities[activityIndex].updatedAt = new Date().toISOString();
            
            this.saveToLocalStorage();
            this.renderActivities();
            
            const activity = this.activities.activities[activityIndex];
            const message = activity.isFavorite ? 'Added to favorites!' : 'Removed from favorites!';
            this.showSuccessMessage(message);
        }
    }

    // Edit Modal Management
    showEditModal(itemId) {
        this.editingItemId = itemId;
        const activity = this.activities.activities.find(a => a.id === itemId);
        
        if (activity) {
            document.getElementById('editItemId').value = activity.id;
            document.getElementById('editTitleInput').value = activity.title;
            document.getElementById('editDescriptionInput').value = activity.description;
            document.getElementById('editProgressInput').value = activity.progress;
            document.getElementById('editFavoriteInput').checked = activity.isFavorite;
            
            this.populateCategorySelect();
            document.getElementById('editCategorySelect').value = activity.category;
            
            this.showModal('editModal');
        }
    }

    populateCategorySelect() {
        const select = document.getElementById('editCategorySelect');
        select.innerHTML = '<option value="">Select Category</option>';
        
        Object.values(this.activities.categories).forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    toggleNewCategoryForm() {
        const form = document.getElementById('editNewCategoryForm');
        form.classList.toggle('hidden');
        
        if (!form.classList.contains('hidden')) {
            document.getElementById('editNewCategoryInput').focus();
        } else {
            document.getElementById('editNewCategoryInput').value = '';
        }
    }

    updateActivity() {
        const itemId = document.getElementById('editItemId').value;
        const title = document.getElementById('editTitleInput').value.trim();
        const description = document.getElementById('editDescriptionInput').value.trim();
        const progress = document.getElementById('editProgressInput').value.trim();
        const isFavorite = document.getElementById('editFavoriteInput').checked;
        
        let category = document.getElementById('editCategorySelect').value;
        
        // Handle new category
        if (document.getElementById('editNewCategoryForm').classList.contains('hidden')) {
            if (!category) {
                this.showFormError('editCategorySelect', 'Please select a category');
                return;
            }
        } else {
            const newCategory = document.getElementById('editNewCategoryInput').value.trim();
            if (!newCategory) {
                this.showFormError('editNewCategoryInput', 'Please enter a category name');
                return;
            }
            
            if (!this.addCategory(newCategory)) {
                this.showFormError('editNewCategoryInput', 'Category already exists');
                return;
            }
            
            category = newCategory;
        }
        
        if (!title) {
            this.showFormError('editTitleInput', 'Please enter a title');
            return;
        }
        
        if (!progress) {
            this.showFormError('editProgressInput', 'Please enter progress information');
            return;
        }
        
        const activityIndex = this.activities.activities.findIndex(a => a.id === itemId);
        if (activityIndex !== -1) {
            // Preserve original creation date, only update updatedAt
            this.activities.activities[activityIndex] = {
                ...this.activities.activities[activityIndex],
                title,
                description,
                category,
                progress,
                isFavorite,
                updatedAt: new Date().toISOString()
            };
            
            this.saveToLocalStorage();
            this.closeModal(document.getElementById('editModal'));
            this.renderActivities();
            this.showSuccessMessage('Activity updated successfully!');
        }
    }

    addCategory(name) {
        if (!name.trim()) return false;
        
        if (!this.activities.categories[name]) {
            this.activities.categories[name] = {
                name: name,
                createdAt: new Date().toISOString()
            };
            this.saveToLocalStorage();
            this.renderCategories();
            this.populateCategorySelect();
            return true;
        }
        return false;
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.classList.add('closing');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('closing');
            document.body.style.overflow = 'auto';
            this.resetForms();
        }, 300);
    }

    resetForms() {
        document.getElementById('editForm').reset();
        document.getElementById('editNewCategoryForm').classList.add('hidden');
        this.editingItemId = null;
    }

    sortActivities(activities, sortBy) {
        switch (sortBy) {
            case 'favorites':
                return [...activities].sort((a, b) => {
                    if (a.isFavorite && !b.isFavorite) return -1;
                    if (!a.isFavorite && b.isFavorite) return 1;
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });
            case 'alphabetical':
                return [...activities].sort((a, b) => a.title.localeCompare(b.title));
            case 'date':
            default:
                return [...activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    }

    // Category Selection
    selectCategory(category) {
        this.selectedCategory = category;
        this.renderCategories();
        this.renderActivities();
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
    new ActivityTracker();
});