// Update favorites.js - Add premium features

class FavoritesPage {
    constructor() {
        this.storage = storage;
        this.allItems = []; // Store all items for popup
        this.init();
    }

    // Initialize favorites page
    init() {
        this.initEventListeners();
        this.createPremiumModal(); // Create confirmation modal
        this.createFavoritesPopup(); // Create add favorites popup
        this.loadFavorites();
        this.updateStats();
    }

    // Initialize event listeners
    initEventListeners() {
        // Add Items button
        const addItemsBtn = document.getElementById('addItemsBtn');
        if (addItemsBtn) {
            addItemsBtn.addEventListener('click', () => {
                location.href = 'add.html';
            });
        }

        // Add Favorites button
        const addFavoritesBtn = document.getElementById('addFavoritesBtn');
        if (addFavoritesBtn) {
            addFavoritesBtn.addEventListener('click', () => {
                this.openFavoritesPopup();
            });
        }

        // Sort select
        const sortSelect = document.getElementById('favoritesSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.loadFavorites(e.target.value);
            });
        }

        // Add ripple effect
        this.addRippleEffect();
    }

    // Create premium confirmation modal for remove favorite
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
                        <i class="fas fa-star"></i>
                        <h3 id="confirmModalTitle">Remove Favorite</h3>
                    </div>
                    <div class="confirm-modal-body">
                        <p id="confirmModalMessage">Are you sure you want to remove this item from favorites?</p>
                        <div class="confirm-modal-actions">
                            <button class="confirm-modal-btn cancel" id="confirmModalCancel">
                                <i class="fas fa-times"></i>
                                <span>Cancel</span>
                            </button>
                            <button class="confirm-modal-btn confirm" id="confirmModalConfirm">
                                <i class="fas fa-check"></i>
                                <span>Remove</span>
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
                if (this.removeFavoriteCallback) {
                    this.removeFavoriteCallback();
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

    // Create favorites popup for adding favorites
    createFavoritesPopup() {
        // Remove existing popup if any
        const existingPopup = document.getElementById('favoritesPopup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popupHTML = `
            <div class="favorites-popup" id="favoritesPopup">
                <div class="favorites-popup-content">
                    <div class="favorites-popup-header">
                        <h3>
                            <i class="fas fa-star"></i>
                            Add Items to Favorites
                        </h3>
                        <button class="close-popup" id="closePopup">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="favorites-popup-search">
                        <div style="position: relative;">
                            <i class="fas fa-search"></i>
                            <input type="text" id="popupSearch" placeholder="Search items...">
                        </div>
                    </div>
                    <div class="favorites-popup-items">
                        <div class="popup-items-grid" id="popupItemsGrid">
                            <!-- Items will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);

        // Add event listeners to popup
        const popup = document.getElementById('favoritesPopup');
        const closePopup = document.getElementById('closePopup');
        const popupSearch = document.getElementById('popupSearch');

        if (closePopup) {
            closePopup.addEventListener('click', () => {
                popup.classList.remove('active');
            });
        }

        if (popupSearch) {
            popupSearch.addEventListener('input', (e) => {
                this.filterPopupItems(e.target.value);
            });
        }

        // Close popup when clicking outside
        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    popup.classList.remove('active');
                }
            });
        }

        // Close popup on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('active')) {
                popup.classList.remove('active');
            }
        });
    }

    // Open favorites popup
    openFavoritesPopup() {
        const popup = document.getElementById('favoritesPopup');
        const popupSearch = document.getElementById('popupSearch');
        
        if (popup) {
            // Reset search
            if (popupSearch) {
                popupSearch.value = '';
            }
            
            // Load all items into popup
            this.loadAllItems();
            
            // Show popup
            popup.classList.add('active');
        }
    }

    // Load all items for popup
    loadAllItems() {
        this.allItems = this.storage.getItems();
        this.displayPopupItems(this.allItems);
    }

    // Display items in popup
    displayPopupItems(items) {
        const popupItemsGrid = document.getElementById('popupItemsGrid');
        if (!popupItemsGrid) return;

        if (items.length === 0) {
            popupItemsGrid.innerHTML = `
                <div class="popup-empty-state">
                    <i class="fas fa-inbox"></i>
                    <h4>No Items Found</h4>
                    <p>You haven't added any items yet. Add some items first!</p>
                    <button class="header-btn premium-btn" onclick="location.href='add.html'">
                        <i class="fas fa-plus-circle"></i>
                        <span>Add Items</span>
                    </button>
                </div>
            `;
            return;
        }

        popupItemsGrid.innerHTML = '';
        
        // Get current favorites
        const currentFavorites = this.storage.getFavorites();
        const favoriteIds = new Set(currentFavorites.map(fav => fav.id));

        items.forEach(item => {
            const isAlreadyFavorite = favoriteIds.has(item.id);
            
            const itemCard = document.createElement('div');
            itemCard.className = `popup-item-card ${isAlreadyFavorite ? 'already-favorite' : ''}`;
            itemCard.innerHTML = `
                <div class="popup-item-info">
                    <div class="popup-item-title">${item.title}</div>
                    <span class="popup-item-category">${item.category}</span>
                    ${item.description ? `<div class="popup-item-description">${item.description}</div>` : ''}
                    <div class="popup-item-meta">
                        ${item.progress ? `<span>${item.progress}</span>` : ''}
                        <span>Added: ${new Date(item.dateAdded).toLocaleDateString()}</span>
                        ${item.isCompleted ? '<span><i class="fas fa-check-circle"></i> Completed</span>' : ''}
                    </div>
                </div>
                <button class="add-to-favorites-btn" data-item-id="${item.id}" ${isAlreadyFavorite ? 'disabled' : ''}>
                    <i class="fas fa-star"></i>
                    ${isAlreadyFavorite ? 'Already in Favorites' : 'Add to Favorites'}
                </button>
            `;

            // Add event listener to add button
            const addBtn = itemCard.querySelector('.add-to-favorites-btn');
            if (addBtn && !isAlreadyFavorite) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleAddToFavorites(item.id, item.title);
                });
            }

            popupItemsGrid.appendChild(itemCard);
        });
    }

    // Filter items in popup based on search query
    filterPopupItems(query) {
        if (!query.trim()) {
            this.displayPopupItems(this.allItems);
            return;
        }

        const searchTerm = query.toLowerCase();
        const filteredItems = this.allItems.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.progress.toLowerCase().includes(searchTerm)
        );

        this.displayPopupItems(filteredItems);
    }

    // Handle add to favorites from popup
    handleAddToFavorites(itemId, itemTitle) {
        const addBtn = document.querySelector(`.add-to-favorites-btn[data-item-id="${itemId}"]`);
        
        if (!addBtn || addBtn.disabled) return;

        // Show loading state
        const originalHTML = addBtn.innerHTML;
        addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        addBtn.classList.add('loading');
        addBtn.disabled = true;

        setTimeout(() => {
            try {
                const item = this.storage.getItemById(itemId);
                if (!item) {
                    throw new Error('Item not found');
                }

                // Add to favorites
                const success = this.storage.updateItem(itemId, { isFavorite: true });
                
                if (success) {
                    // Show premium success message
                    this.showPremiumSuccessMessage(
                        'Added to Favorites',
                        `"${itemTitle}" has been added to your favorites!`
                    );

                    // Update the button state
                    addBtn.innerHTML = '<i class="fas fa-star"></i> Already in Favorites';
                    addBtn.disabled = true;
                    addBtn.parentElement.classList.add('already-favorite');
                    
                    // Reload favorites on main page
                    this.loadFavorites();
                    this.updateStats();
                } else {
                    throw new Error('Failed to add to favorites');
                }
            } catch (error) {
                console.error('Add to favorites error:', error);
                this.showErrorMessage('Failed to add item to favorites');
                
                // Restore button state
                addBtn.innerHTML = originalHTML;
                addBtn.classList.remove('loading');
                addBtn.disabled = false;
            } finally {
                addBtn.classList.remove('loading');
            }
        }, 800);
    }

    // Load favorites
    loadFavorites(sortBy = 'alphabetical') {
        const favoritesGrid = document.getElementById('favoritesGrid');
        if (!favoritesGrid) return;

        let favorites = this.storage.getFavorites();
        
        // Sort favorites
        favorites = this.sortFavorites(favorites, sortBy);
        
        if (favorites.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="empty-favorites">
                    <i class="fas fa-star"></i>
                    <h3>No Favorites Yet</h3>
                    <p>Start adding favorites from your items!</p>
                    <button class="browse-btn premium-btn" onclick="location.href='index.html'">
                        <i class="fas fa-eye"></i>
                        <span>Browse Items</span>
                    </button>
                </div>
            `;
            return;
        }

        favoritesGrid.innerHTML = '';
        favorites.forEach(item => {
            const favoriteCard = this.createFavoriteCard(item);
            favoritesGrid.appendChild(favoriteCard);
        });

        // Update stats
        this.updateStats();
    }

    // Sort favorites
    sortFavorites(favorites, sortBy) {
        const sorted = [...favorites];
        
        switch (sortBy) {
            case 'alphabetical':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
                
            case 'newest':
                return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                
            case 'category':
                return sorted.sort((a, b) => {
                    const catCompare = a.category.localeCompare(b.category);
                    if (catCompare === 0) {
                        return a.title.localeCompare(b.title);
                    }
                    return catCompare;
                });
                
            default:
                return sorted;
        }
    }

    // Create favorite card
    createFavoriteCard(item) {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.dataset.id = item.id;
        
        card.innerHTML = `
            <div class="favorite-card-header">
                <div>
                    <h3 class="favorite-title">${item.title}</h3>
                    <span class="favorite-category">${item.category}</span>
                </div>
                <i class="fas fa-star star-icon"></i>
            </div>
            
            ${item.description ? `<p class="favorite-description">${item.description}</p>` : ''}
            
            <div class="favorite-meta">
                ${item.progress ? `<span class="favorite-progress">${item.progress}</span>` : ''}
                <span class="favorite-date">${new Date(item.dateAdded).toLocaleDateString()}</span>
            </div>
            
            <div class="favorite-actions">
                <button class="remove-favorite-btn" title="Remove from Favorites" data-item-id="${item.id}">
                    <i class="fas fa-trash-alt"></i> Remove Favorite
                </button>
            </div>
        `;

        // Add event listener to remove favorite button
        const removeBtn = card.querySelector('.remove-favorite-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showPremiumRemoveConfirmation(item.id, item.title);
            });
        }

        return card;
    }

    // Show premium confirmation for removing favorite
    showPremiumRemoveConfirmation(itemId, itemTitle) {
        const modal = document.getElementById('confirmModalPremium');
        const titleElement = document.getElementById('confirmModalTitle');
        const messageElement = document.getElementById('confirmModalMessage');

        if (modal && titleElement && messageElement) {
            titleElement.textContent = 'Remove Favorite';
            messageElement.textContent = `Are you sure you want to remove "${itemTitle}" from favorites?`;
            
            this.removeFavoriteCallback = () => this.handleRemoveFavorite(itemId, itemTitle);
            modal.classList.add('active');
        }
    }

    // Handle remove favorite
    handleRemoveFavorite(itemId, itemTitle) {
        const item = this.storage.getItemById(itemId);
        if (!item) return;

        const removeBtn = document.querySelector(`.remove-favorite-btn[data-item-id="${itemId}"]`);
        
        // Show loading state
        if (removeBtn) {
            const originalHTML = removeBtn.innerHTML;
            removeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
            removeBtn.disabled = true;
        }

        setTimeout(() => {
            try {
                // Update item to remove favorite status
                const success = this.storage.updateItem(itemId, { isFavorite: false });
                
                if (success) {
                    // Show premium success message
                    this.showPremiumSuccessMessage(
                        'Removed from Favorites',
                        `"${itemTitle}" has been removed from favorites.`
                    );
                    
                    // Reload favorites
                    this.loadFavorites();
                    this.updateStats();
                    
                    // Update popup if open
                    const popup = document.getElementById('favoritesPopup');
                    if (popup && popup.classList.contains('active')) {
                        this.loadAllItems();
                    }
                } else {
                    throw new Error('Failed to remove from favorites');
                }
            } catch (error) {
                console.error('Remove favorite error:', error);
                this.showErrorMessage('Failed to remove from favorites');
            } finally {
                // Restore button state
                if (removeBtn) {
                    removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Remove Favorite';
                    removeBtn.disabled = false;
                }
            }
        }, 800);
    }

    // Update statistics
    updateStats() {
        const favorites = this.storage.getFavorites();
        const categories = new Set(favorites.map(item => item.category));
        
        // Update counts
        const favoritesCount = document.getElementById('favoritesCount');
        const categoriesCount = document.getElementById('categoriesCount');
        
        if (favoritesCount) {
            favoritesCount.textContent = favorites.length;
        }
        
        if (categoriesCount) {
            categoriesCount.textContent = categories.size;
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

// Initialize favorites page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FavoritesPage();
});