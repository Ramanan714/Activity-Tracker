// Update add.js - Add premium success message functionality

class AddPage {
    constructor() {
        this.storage = storage;
        this.init();
    }

    // Initialize add page
    init() {
        this.initEventListeners();
        this.loadCategories();
        this.loadRecentItems();
    }

    // Initialize event listeners
    initEventListeners() {
        const form = document.getElementById('addItemForm');
        const categorySelect = document.getElementById('categorySelect');
        const newCategoryInput = document.getElementById('newCategory');

        if (newCategoryInput) {
            newCategoryInput.addEventListener('input', (e) => {
                if (e.target.value.trim()) {
                    categorySelect.disabled = true;
                } else {
                    categorySelect.disabled = false;
                }
            });
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    newCategoryInput.disabled = true;
                } else {
                    newCategoryInput.disabled = false;
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Auto-capitalize first letter of title
        const titleInput = document.getElementById('itemTitle');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (value.length === 1) {
                    e.target.value = value.toUpperCase();
                }
            });
        }

        // Add ripple effect
        this.addRippleEffect();
    }

    // Load categories into select
    loadCategories() {
        const categorySelect = document.getElementById('categorySelect');
        if (!categorySelect) return;

        const categories = this.storage.getCategories();
        
        // Clear existing options except the first one
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }

        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // Load recent items
    loadRecentItems() {
        const recentItemsContainer = document.getElementById('recentItems');
        if (!recentItemsContainer) return;

        const recentItems = this.storage.getItems().slice(0, 5); // Get 5 most recent
        
        if (recentItems.length === 0) {
            recentItemsContainer.innerHTML = `
                <div class="empty-recent">
                    <i class="fas fa-inbox"></i>
                    <h4>No items yet</h4>
                    <p>Add your first item to see it here!</p>
                </div>
            `;
            return;
        }

        recentItemsContainer.innerHTML = '';
        recentItems.forEach(item => {
            const itemElement = this.createRecentItemElement(item);
            recentItemsContainer.appendChild(itemElement);
        });
    }

    // Create recent item element
    createRecentItemElement(item) {
        const div = document.createElement('div');
        div.className = 'recent-item';
        
        div.innerHTML = `
            <div class="recent-item-header">
                <span class="recent-item-title">${item.title}</span>
                <span class="recent-item-category">${item.category}</span>
            </div>
            ${item.description ? `<p class="recent-item-description">${item.description}</p>` : ''}
            ${item.progress ? `<span class="recent-item-progress">${item.progress}</span>` : ''}
            <div class="recent-item-meta">
                <small>Added: ${new Date(item.dateAdded).toLocaleDateString()}</small>
                ${item.isFavorite ? '<i class="fas fa-star"></i>' : ''}
                ${item.isCompleted ? '<i class="fas fa-check-circle" style="color: #34a853;"></i>' : ''}
            </div>
        `;
        
        return div;
    }

    // Handle form submission WITH PREMIUM SUCCESS MESSAGE
    handleSubmit() {
        // Get form values
        const categorySelect = document.getElementById('categorySelect');
        const newCategoryInput = document.getElementById('newCategory');
        const titleInput = document.getElementById('itemTitle');
        const descriptionInput = document.getElementById('itemDescription');
        const progressInput = document.getElementById('itemProgress');
        const favoriteInput = document.getElementById('itemFavorite');
        const completedInput = document.getElementById('itemCompleted');
        const submitBtn = document.querySelector('.submit-btn');

        // Determine category
        let category;
        if (newCategoryInput.value.trim()) {
            category = newCategoryInput.value;
        } else if (categorySelect.value) {
            category = categorySelect.value;
        } else {
            this.showErrorMessage('Please select or create a category');
            return;
        }

        // Validate title
        if (!titleInput.value.trim()) {
            this.showErrorMessage('Please enter a title');
            titleInput.focus();
            return;
        }

        // Prepare item data
        const itemData = {
            category: category,
            title: titleInput.value,
            description: descriptionInput.value,
            progress: progressInput.value,
            isFavorite: favoriteInput.checked,
            isCompleted: completedInput.checked
        };

        // Show loading state on submit button
        if (submitBtn) {
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }

        // Save item with delay for animation
        setTimeout(() => {
            try {
                // Save item
                const newItem = this.storage.addItem(itemData);
                
                // Show premium success message
                this.showPremiumSuccessMessage('Item added successfully!', 'Your item has been saved and is ready to view.');
                
                // Reset form
                this.resetForm();
                
                // Reload recent items
                this.loadRecentItems();
                
                // Animate the new item
                this.animateNewItem(newItem);
                
            } catch (error) {
                console.error('Save error:', error);
                this.showErrorMessage('Failed to save item. Please try again.');
            } finally {
                // Restore submit button
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Item';
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
            }
        }, 800); // Animation delay
    }

    // Show premium success message
    showPremiumSuccessMessage(title, message) {
        // Remove existing success messages
        const existingMessages = document.querySelectorAll('.success-message-premium');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message-premium';
        messageDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div class="success-message-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="close-success" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateX(-50%) translateY(-20px)';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Show error message
    showErrorMessage(text) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message error-message';
        messageDiv.textContent = text;
        
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.backgroundColor = 'rgba(234, 67, 53, 0.95)';
        messageDiv.style.color = 'white';
        messageDiv.style.padding = '12px 24px';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.zIndex = '10000';
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.3s';
        messageDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        
        document.body.appendChild(messageDiv);
        
        // Show
        setTimeout(() => {
            messageDiv.style.opacity = '1';
        }, 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('addItemForm');
        if (form) {
            form.reset();
            
            // Re-enable all inputs
            const categorySelect = document.getElementById('categorySelect');
            const newCategoryInput = document.getElementById('newCategory');
            
            if (categorySelect) categorySelect.disabled = false;
            if (newCategoryInput) newCategoryInput.disabled = false;
            
            // Focus on title input
            const titleInput = document.getElementById('itemTitle');
            if (titleInput) titleInput.focus();
        }
    }

    // Animate new item
    animateNewItem(item) {
        const recentItemsContainer = document.getElementById('recentItems');
        if (!recentItemsContainer) return;

        const itemElement = this.createRecentItemElement(item);
        itemElement.style.opacity = '0';
        itemElement.style.transform = 'translateY(-20px)';
        
        // If empty state exists, remove it
        const emptyState = recentItemsContainer.querySelector('.empty-recent');
        if (emptyState) {
            emptyState.style.opacity = '0';
            setTimeout(() => {
                if (emptyState.parentNode) {
                    emptyState.parentNode.removeChild(emptyState);
                }
            }, 300);
        }
        
        recentItemsContainer.insertBefore(itemElement, recentItemsContainer.firstChild);
        
        // Animate
        setTimeout(() => {
            itemElement.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            itemElement.style.opacity = '1';
            itemElement.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove old items if more than 5
        setTimeout(() => {
            const recentItems = recentItemsContainer.querySelectorAll('.recent-item');
            if (recentItems.length > 5) {
                for (let i = 5; i < recentItems.length; i++) {
                    recentItems[i].style.transition = 'all 0.3s ease-out';
                    recentItems[i].style.opacity = '0';
                    recentItems[i].style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        if (recentItems[i].parentNode) {
                            recentItems[i].parentNode.removeChild(recentItems[i]);
                        }
                    }, 300);
                }
            }
        }, 100);
    }

    // Add ripple effect
    addRippleEffect() {
        const buttons = document.querySelectorAll('.ripple');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const x = e.clientX - e.target.getBoundingClientRect().left;
                const y = e.clientY - e.target.getBoundingClientRect().top;
                
                const ripple = document.createElement('span');
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple-effect');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// Initialize add page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AddPage();
});