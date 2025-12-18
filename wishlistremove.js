// wishlistremove.js - Wishlist Remove Page with Premium Features

class WishlistRemovePage {
    constructor() {
        this.storage = storage;
        this.confirmCallback = null;
        this.init();
    }

    // Initialize remove page
    init() {
        this.createPremiumModal();
        this.initEventListeners();
        this.loadCategories();
    }

    // Initialize event listeners
    initEventListeners() {
        // Category removal
        const categoryRemoveSelect = document.getElementById('categoryRemoveSelect');
        const removeCategoryBtn = document.getElementById('removeCategoryBtn');

        if (removeCategoryBtn) {
            removeCategoryBtn.addEventListener('click', () => {
                const category = categoryRemoveSelect.value;
                if (!category) {
                    this.showMessage('Please select a category to remove', 'error');
                    return;
                }
                
                this.showPremiumConfirmation(
                    'Remove Category',
                    `Are you sure you want to remove the category "${category}" and ALL its wishlist items? This action cannot be undone.`,
                    () => this.handleRemoveCategory(category)
                );
            });
        }

        // Item removal
        const categoryForItemSelect = document.getElementById('categoryForItemSelect');
        const itemRemoveSelect = document.getElementById('itemRemoveSelect');
        const removeItemBtn = document.getElementById('removeItemBtn');

        if (categoryForItemSelect) {
            categoryForItemSelect.addEventListener('change', (e) => {
                const category = e.target.value;
                this.loadItemsForCategory(category);
                
                if (itemRemoveSelect) {
                    itemRemoveSelect.disabled = !category;
                }
            });
        }

        if (itemRemoveSelect) {
            itemRemoveSelect.addEventListener('change', (e) => {
                if (removeItemBtn) {
                    removeItemBtn.disabled = !e.target.value;
                }
            });
        }

        if (removeItemBtn) {
            removeItemBtn.addEventListener('click', () => {
                const itemId = itemRemoveSelect.value;
                const itemName = itemRemoveSelect.options[itemRemoveSelect.selectedIndex]?.textContent || 'item';
                
                if (!itemId) {
                    this.showMessage('Please select an item to remove', 'error');
                    return;
                }

                this.showPremiumConfirmation(
                    'Remove Item',
                    `Are you sure you want to remove "${itemName}"? This action cannot be undone.`,
                    () => this.handleRemoveItem(itemId, itemName)
                );
            });
        }

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeConfirmationModal();
            }
        });
    }

    // Create premium confirmation modal
    createPremiumModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('confirmModalPremium');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="confirm-modal-premium" id="confirmModalPremium">
                <div class="confirm-modal-content">
                    <div class="confirm-modal-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3 id="confirmModalTitle">Confirm Action</h3>
                    </div>
                    <div class="confirm-modal-body">
                        <p id="confirmModalMessage">Are you sure you want to proceed?</p>
                        <div class="confirm-modal-actions">
                            <button class="confirm-modal-btn cancel" id="confirmModalCancel">
                                <i class="fas fa-times"></i>
                                <span>Cancel</span>
                            </button>
                            <button class="confirm-modal-btn confirm" id="confirmModalConfirm">
                                <i class="fas fa-check"></i>
                                <span>Confirm</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners to modal buttons
        const modal = document.getElementById('confirmModalPremium');
        const cancelBtn = document.getElementById('confirmModalCancel');
        const confirmBtn = document.getElementById('confirmModalConfirm');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeConfirmationModal();
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.confirmCallback) {
                    this.confirmCallback();
                }
                this.closeConfirmationModal();
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeConfirmationModal();
                }
            });
        }
    }

    // Show premium confirmation modal
    showPremiumConfirmation(title, message, confirmCallback) {
        const modal = document.getElementById('confirmModalPremium');
        const titleElement = document.getElementById('confirmModalTitle');
        const messageElement = document.getElementById('confirmModalMessage');

        if (modal && titleElement && messageElement) {
            titleElement.textContent = title;
            messageElement.textContent = message;
            this.confirmCallback = confirmCallback;
            modal.classList.add('active');
        }
    }

    // Close confirmation modal
    closeConfirmationModal() {
        const modal = document.getElementById('confirmModalPremium');
        if (modal) {
            modal.classList.remove('active');
            this.confirmCallback = null;
        }
    }

    // Load categories from wishlist items
    loadCategories() {
        const data = this.storage.getData();
        const wishlistItems = data.wishlist || [];
        
        // Get unique categories
        const uniqueCategories = [...new Set(wishlistItems.map(item => item.category))];
        
        // Load into category removal select
        const categoryRemoveSelect = document.getElementById('categoryRemoveSelect');
        if (categoryRemoveSelect) {
            this.populateSelect(categoryRemoveSelect, uniqueCategories, 'Select category to remove');
        }

        // Load into category for item select
        const categoryForItemSelect = document.getElementById('categoryForItemSelect');
        if (categoryForItemSelect) {
            this.populateSelect(categoryForItemSelect, uniqueCategories, 'Select category first');
        }
    }

    // Load items for selected category
    loadItemsForCategory(category) {
        const itemRemoveSelect = document.getElementById('itemRemoveSelect');
        const removeItemBtn = document.getElementById('removeItemBtn');
        
        if (!itemRemoveSelect || !removeItemBtn) return;

        // Clear current items
        itemRemoveSelect.innerHTML = '<option value="">Select item to remove</option>';
        itemRemoveSelect.disabled = !category;
        removeItemBtn.disabled = true;

        if (!category) return;

        const data = this.storage.getData();
        const wishlistItems = data.wishlist || [];
        const items = wishlistItems.filter(item => item.category === category);
        
        if (items.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No items in this category';
            option.disabled = true;
            itemRemoveSelect.appendChild(option);
            return;
        }

        // Add items to select
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (${this.getPriorityLabel(item.priority)})`;
            itemRemoveSelect.appendChild(option);
        });

        itemRemoveSelect.disabled = false;
    }

    // Handle category removal
    handleRemoveCategory(category) {
        const removeCategoryBtn = document.getElementById('removeCategoryBtn');
        
        // Show loading state
        if (removeCategoryBtn) {
            removeCategoryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
            removeCategoryBtn.disabled = true;
            removeCategoryBtn.classList.add('loading');
        }

        setTimeout(() => {
            try {
                const data = this.storage.getData();
                const wishlistItems = data.wishlist || [];
                
                // Remove items of this category
                const filteredItems = wishlistItems.filter(item => item.category !== category);
                
                // Save to storage
                data.wishlist = filteredItems;
                this.storage.setData(data);
                
                // Show success message
                this.showMessage(`Category "${category}" and all its items have been removed!`, 'success');
                
                // Reload categories and reset form
                this.loadCategories();
                this.loadItemsForCategory('');
                
                // Reset category select
                const categoryRemoveSelect = document.getElementById('categoryRemoveSelect');
                if (categoryRemoveSelect) {
                    categoryRemoveSelect.value = '';
                }
                
            } catch (error) {
                console.error('Remove category error:', error);
                this.showMessage('Failed to remove category', 'error');
            } finally {
                // Restore button state
                if (removeCategoryBtn) {
                    removeCategoryBtn.innerHTML = '<i class="fas fa-trash"></i> Remove Category';
                    removeCategoryBtn.disabled = false;
                    removeCategoryBtn.classList.remove('loading');
                }
            }
        }, 800);
    }

    // Handle item removal
    handleRemoveItem(itemId, itemName) {
        const removeItemBtn = document.getElementById('removeItemBtn');
        const itemRemoveSelect = document.getElementById('itemRemoveSelect');
        const categoryForItemSelect = document.getElementById('categoryForItemSelect');
        
        // Show loading state
        if (removeItemBtn) {
            removeItemBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
            removeItemBtn.disabled = true;
            removeItemBtn.classList.add('loading');
        }

        setTimeout(() => {
            try {
                const data = this.storage.getData();
                const wishlistItems = data.wishlist || [];
                
                // Remove item
                const filteredItems = wishlistItems.filter(item => item.id !== itemId);
                
                // Save to storage
                data.wishlist = filteredItems;
                this.storage.setData(data);
                
                // Show success message
                this.showMessage(`"${itemName}" has been removed!`, 'success');
                
                // Reload items for current category
                if (categoryForItemSelect && categoryForItemSelect.value) {
                    this.loadItemsForCategory(categoryForItemSelect.value);
                }
                
                // Reset item select if no items left
                if (itemRemoveSelect && itemRemoveSelect.options.length <= 1) {
                    itemRemoveSelect.innerHTML = '<option value="">No more items in this category</option>';
                    if (removeItemBtn) {
                        removeItemBtn.disabled = true;
                    }
                }
                
            } catch (error) {
                console.error('Remove item error:', error);
                this.showMessage('Failed to remove item', 'error');
            } finally {
                // Restore button state
                if (removeItemBtn) {
                    removeItemBtn.innerHTML = '<i class="fas fa-trash"></i> Remove Item';
                    removeItemBtn.disabled = false;
                    removeItemBtn.classList.remove('loading');
                }
            }
        }, 800);
    }

    // Populate select element with options
    populateSelect(selectElement, options, placeholder) {
        if (!selectElement) return;

        // Clear existing options except the first one
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }

        // Add options
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = this.getCategoryLabel(option);
            selectElement.appendChild(opt);
        });

        // Update placeholder
        if (selectElement.options[0]) {
            selectElement.options[0].textContent = placeholder;
        }
    }

    // Helper functions
    getCategoryLabel(category) {
        const categories = {
            'anime': 'Anime',
            'manga': 'Manga',
            'manwha': 'Manwha',
            'other': 'Other'
        };
        return categories[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    getPriorityLabel(priority) {
        const labels = {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High'
        };
        return labels[priority] || 'Medium';
    }

    // Show message
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.premium-message');
        existingMessages.forEach(msg => msg.remove());

        // Define colors based on type
        const colors = {
            'success': 'linear-gradient(135deg, #34a853, #2e7d32)',
            'error': 'linear-gradient(135deg, #ea4335, #c62828)',
            'info': 'linear-gradient(135deg, #4285f4, #5c6bc0)',
            'warning': 'linear-gradient(135deg, #ffd700, #ff9800)'
        };

        // Define icons based on type
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'info': 'info-circle',
            'warning': 'exclamation-triangle'
        };

        const messageDiv = document.createElement('div');
        messageDiv.className = `premium-message ${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-30px);
            padding: 16px 24px;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 400px;
            width: 90%;
            border: 2px solid rgba(255, 255, 255, 0.2);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        messageDiv.innerHTML = `
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            <div class="premium-message-content">
                <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                <p>${message}</p>
            </div>
            <button class="close-premium-message">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(messageDiv);

        // Animate in
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        // Add close button event listener
        const closeBtn = messageDiv.querySelector('.close-premium-message');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateX(-50%) translateY(-20px)';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            });
        }

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
}

// Initialize remove page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WishlistRemovePage();
});