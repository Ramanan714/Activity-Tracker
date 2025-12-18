// Update remove.js - Add premium features

class RemovePage {
    constructor() {
        this.storage = storage;
        this.init();
    }

    // Initialize remove page
    init() {
        this.initEventListeners();
        this.loadCategories();
        this.createPremiumModal(); // Create premium confirmation modal
    }

    // Initialize event listeners
    initEventListeners() {
        // Category removal
        const categoryRemoveSelect = document.getElementById('categoryRemoveSelect');
        const removeCategoryBtn = document.getElementById('removeCategoryBtn');

        if (removeCategoryBtn) {
            // Add premium button class if not already added
            if (!removeCategoryBtn.classList.contains('premium-btn')) {
                removeCategoryBtn.classList.add('premium-btn');
            }
            
            removeCategoryBtn.addEventListener('click', () => {
                const category = categoryRemoveSelect.value;
                if (!category) {
                    this.showErrorMessage('Please select a category to remove');
                    return;
                }
                
                // Show premium confirmation modal
                this.showPremiumConfirmation(
                    'Remove Category',
                    `Are you sure you want to remove the category "${category}" and ALL its items?`,
                    () => this.handleRemoveCategory(category)
                );
            });
        }

        // Item removal - FIXED to enable button when item is selected
        const categoryForItemSelect = document.getElementById('categoryForItemSelect');
        const itemRemoveSelect = document.getElementById('itemRemoveSelect');
        const removeItemBtn = document.getElementById('removeItemBtn');

        if (categoryForItemSelect) {
            categoryForItemSelect.addEventListener('change', (e) => {
                this.loadItemsForCategory(e.target.value);
                
                // Enable item select when category is selected
                if (itemRemoveSelect) {
                    itemRemoveSelect.disabled = !e.target.value;
                }
            });
        }

        if (itemRemoveSelect) {
            itemRemoveSelect.addEventListener('change', (e) => {
                // Enable remove button when item is selected
                if (removeItemBtn) {
                    const isEnabled = !!e.target.value && e.target.value !== '';
                    removeItemBtn.disabled = !isEnabled;
                    
                    // Add/remove premium button styling
                    if (isEnabled) {
                        removeItemBtn.classList.remove('disabled');
                    } else {
                        removeItemBtn.classList.add('disabled');
                    }
                }
            });
        }

        if (removeItemBtn) {
            // Add premium button class if not already added
            if (!removeItemBtn.classList.contains('premium-btn')) {
                removeItemBtn.classList.add('premium-btn');
            }
            
            // Initially disable the button
            removeItemBtn.disabled = true;
            
            removeItemBtn.addEventListener('click', () => {
                const itemId = itemRemoveSelect.value;
                const itemName = itemRemoveSelect.options[itemRemoveSelect.selectedIndex]?.textContent || 'item';
                
                if (!itemId) {
                    this.showErrorMessage('Please select an item to remove');
                    return;
                }

                // Show premium confirmation modal
                this.showPremiumConfirmation(
                    'Remove Item',
                    `Are you sure you want to remove "${itemName}"?`,
                    () => this.handleRemoveItem(itemId, itemName)
                );
            });
        }

        // Add ripple effect
        this.addRippleEffect();
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
                modal.classList.remove('active');
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.confirmCallback) {
                    this.confirmCallback();
                }
                modal.classList.remove('active');
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
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

    // Load categories into selects
    loadCategories() {
        const categories = this.storage.getCategories();
        
        // Load into category removal select
        const categoryRemoveSelect = document.getElementById('categoryRemoveSelect');
        if (categoryRemoveSelect) {
            this.populateSelect(categoryRemoveSelect, categories, 'Select category to remove');
        }

        // Load into category for item select
        const categoryForItemSelect = document.getElementById('categoryForItemSelect');
        if (categoryForItemSelect) {
            this.populateSelect(categoryForItemSelect, categories, 'Select category first');
        }
    }

    // Load items for selected category - FIXED to properly enable remove button
    loadItemsForCategory(category) {
        const itemRemoveSelect = document.getElementById('itemRemoveSelect');
        const removeItemBtn = document.getElementById('removeItemBtn');
        
        if (!itemRemoveSelect || !removeItemBtn) return;

        // Clear current items
        itemRemoveSelect.innerHTML = '<option value="">Select item to remove</option>';
        itemRemoveSelect.disabled = !category;
        
        // Disable and reset remove button
        removeItemBtn.disabled = true;
        removeItemBtn.classList.add('disabled');

        if (!category) return;

        const items = this.storage.getItems(category);
        
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
            option.textContent = `${item.title} ${item.progress ? `(${item.progress})` : ''}`;
            itemRemoveSelect.appendChild(option);
        });

        itemRemoveSelect.disabled = false;
    }

    // Handle category removal with premium success message
    handleRemoveCategory(category) {
        const removeCategoryBtn = document.getElementById('removeCategoryBtn');
        
        // Show loading state
        if (removeCategoryBtn) {
            const originalHTML = removeCategoryBtn.innerHTML;
            removeCategoryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
            removeCategoryBtn.classList.add('loading');
            removeCategoryBtn.disabled = true;
        }

        setTimeout(() => {
            try {
                const success = this.storage.removeCategory(category);
                
                if (success) {
                    // Show premium success message
                    this.showPremiumSuccessMessage(
                        'Category Removed',
                        `Category "${category}" and all its items have been removed successfully.`
                    );
                    
                    // Reload categories and reset form
                    this.loadCategories();
                    this.loadItemsForCategory('');
                    
                    // Reset category select
                    const categoryRemoveSelect = document.getElementById('categoryRemoveSelect');
                    if (categoryRemoveSelect) {
                        categoryRemoveSelect.value = '';
                    }
                } else {
                    this.showErrorMessage('Failed to remove category');
                }
            } catch (error) {
                console.error('Remove category error:', error);
                this.showErrorMessage('An error occurred while removing the category');
            } finally {
                // Restore button state
                if (removeCategoryBtn) {
                    removeCategoryBtn.innerHTML = '<i class="fas fa-trash"></i> Remove Category';
                    removeCategoryBtn.classList.remove('loading');
                    removeCategoryBtn.disabled = false;
                }
            }
        }, 800);
    }

    // Handle item removal with premium success message
    handleRemoveItem(itemId, itemName) {
        const removeItemBtn = document.getElementById('removeItemBtn');
        const itemRemoveSelect = document.getElementById('itemRemoveSelect');
        const categoryForItemSelect = document.getElementById('categoryForItemSelect');
        
        // Show loading state
        if (removeItemBtn) {
            const originalHTML = removeItemBtn.innerHTML;
            removeItemBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
            removeItemBtn.classList.add('loading');
            removeItemBtn.disabled = true;
        }

        setTimeout(() => {
            try {
                const success = this.storage.removeItem(itemId);
                
                if (success) {
                    // Show premium success message
                    this.showPremiumSuccessMessage(
                        'Item Removed',
                        `"${itemName}" has been removed successfully.`
                    );
                    
                    // Reload items for current category
                    if (categoryForItemSelect && categoryForItemSelect.value) {
                        this.loadItemsForCategory(categoryForItemSelect.value);
                    }
                    
                    // Reset item select if no items left
                    if (itemRemoveSelect && itemRemoveSelect.options.length <= 1) {
                        itemRemoveSelect.innerHTML = '<option value="">No more items in this category</option>';
                        if (removeItemBtn) {
                            removeItemBtn.disabled = true;
                            removeItemBtn.classList.add('disabled');
                        }
                    }
                } else {
                    this.showErrorMessage('Failed to remove item');
                }
            } catch (error) {
                console.error('Remove item error:', error);
                this.showErrorMessage('An error occurred while removing the item');
            } finally {
                // Restore button state
                if (removeItemBtn) {
                    removeItemBtn.innerHTML = '<i class="fas fa-trash"></i> Remove Item';
                    removeItemBtn.classList.remove('loading');
                    removeItemBtn.disabled = false;
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
            opt.textContent = option;
            selectElement.appendChild(opt);
        });

        // Update placeholder
        if (selectElement.options[0]) {
            selectElement.options[0].textContent = placeholder;
        }
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

// Initialize remove page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RemovePage();
});