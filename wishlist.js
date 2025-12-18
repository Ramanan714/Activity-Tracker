// wishlist.js - Complete Wishlist Management with New Design

class WishlistPage {
    constructor() {
        this.storage = storage;
        this.wishlistItems = [];
        this.categories = ['anime', 'manga', 'manwha']; // Fixed categories
        this.currentEditId = null;
        this.confirmCallback = null;
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.currentCategoryFilter = 'all';
        this.init();
    }

    // Initialize wishlist page
    init() {
        console.log('Initializing Wishlist Page...');
        this.loadWishlist();
        this.loadUserData();
        this.initEventListeners();
        this.updateStats();
        this.setupModals();
        this.setupAnimations();
        this.setupCategories();
        this.setupAutoCaps();
    }

    // Load user data for greeting
    loadUserData() {
        const data = this.storage.getData();
        const user = data.user || (data.profile ? {
            name: data.profile.name || 'User',
            photo: data.profile.image || ''
        } : { name: 'User', photo: '' });
        this.displayUserGreeting(user);
    }

    // Display user greeting
    displayUserGreeting(user) {
        const greetingSection = document.getElementById('wishlistGreeting');
        if (!greetingSection) return;

        const fallbackImage = `<div class="greeting-image-fallback">
            <i class="fas fa-user"></i>
        </div>`;

        greetingSection.innerHTML = `
            <div class="greeting-content">
                <div class="greeting-image">
                    ${user.photo ? `<img src="${user.photo}" alt="${user.name}" onerror="this.style.display='none'; this.parentNode.querySelector('.greeting-image-fallback').style.display='flex';">` : fallbackImage}
                </div>
                <div class="greeting-text">
                    <h2>Welcome back, ${user.name}!</h2>
                    <p>Track your anime, manga, and manwha wishes here. What would you like to add to your collection today?</p>
                </div>
            </div>
        `;
    }

    // Load wishlist from storage
    loadWishlist() {
        this.wishlistItems = this.getWishlistFromStorage();
        this.displayWishlist(this.wishlistItems);
        this.updateEmptyState();
    }

    // Get wishlist from storage
    getWishlistFromStorage() {
        const data = this.storage.getData();
        return data.wishlist || [];
    }

    // Save wishlist to storage
    saveWishlistToStorage(items) {
        const data = this.storage.getData();
        data.wishlist = items;
        this.storage.setData(data);
        this.wishlistItems = items;
        this.updateStats();
    }

    // Setup categories in selects - FIXED VERSION
    setupCategories() {
        // Get all unique categories from wishlist items
        const uniqueCategories = [...new Set(this.wishlistItems.map(item => item.category))];
        
        // Combine with default categories, remove duplicates
        const allCategories = [...new Set([...this.categories, ...uniqueCategories])];
        
        const categorySelect = document.getElementById('wishlistCategory');
        const filterCategorySelect = document.getElementById('filterCategory');
        
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Select Category</option>' +
                allCategories.map(cat => 
                    `<option value="${cat}">${this.getCategoryLabel(cat)}</option>`
                ).join('');
        }
        
        if (filterCategorySelect) {
            filterCategorySelect.innerHTML = '<option value="all">All Categories</option>' +
                allCategories.map(cat => 
                    `<option value="${cat}">${this.getCategoryLabel(cat)}</option>`
                ).join('');
        }
    }

    // Setup auto caps for forms
    setupAutoCaps() {
        setTimeout(() => {
            // Auto-capitalize input fields
            const autoCapsFields = ['wishlistName', 'wishlistDescription', 'newCategoryInput'];
            autoCapsFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', (e) => {
                        const input = e.target;
                        const value = input.value;
                        
                        // Only auto-capitalize first letter of each sentence
                        if (value.length > 0) {
                            const sentences = value.split('. ');
                            const capitalizedSentences = sentences.map(sentence => {
                                if (sentence.length > 0) {
                                    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
                                }
                                return sentence;
                            });
                            const newValue = capitalizedSentences.join('. ');
                            
                            if (newValue !== value) {
                                const cursorPos = input.selectionStart;
                                input.value = newValue;
                                input.setSelectionRange(cursorPos, cursorPos);
                            }
                        }
                    });
                }
            });
        }, 100);
    }

    // Display wishlist items
    displayWishlist(items) {
        const wishlistGrid = document.getElementById('wishlistItemsGrid');
        if (!wishlistGrid) return;

        // Clear grid
        wishlistGrid.innerHTML = '';

        if (items.length === 0) {
            this.updateEmptyState();
            return;
        }

        // Add each item with animation
        items.forEach((item, index) => {
            const itemCard = this.createWishlistCard(item, index);
            wishlistGrid.appendChild(itemCard);
        });
    }

    // Create wishlist card element
    createWishlistCard(item, index) {
        const card = document.createElement('div');
        card.className = `wishlist-item-card priority-${item.priority || 'medium'}`;
        card.dataset.id = item.id;
        card.style.animationDelay = `${index * 0.1}s`;
        
        const date = item.date ? new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : 'No date set';

        card.innerHTML = `
            <div class="wishlist-item-header">
                <div class="wishlist-item-info">
                    <h3 class="wishlist-item-title">${item.name}</h3>
                    <span class="wishlist-item-category">
                        <i class="fas fa-tag"></i>
                        ${this.getCategoryLabel(item.category)}
                    </span>
                </div>
            </div>
            
            ${item.description ? `<p class="wishlist-item-description">${item.description}</p>` : ''}
            
            <div class="wishlist-item-footer">
                <div class="wishlist-item-meta">
                    <span class="wishlist-item-priority ${item.priority || 'medium'}">
                        <i class="fas fa-${this.getPriorityIcon(item.priority)}"></i>
                        ${this.getPriorityLabel(item.priority)}
                    </span>
                    <span class="wishlist-item-date">
                        <i class="far fa-calendar"></i>
                        ${date}
                    </span>
                </div>
                <div class="wishlist-item-actions">
                    <button class="wishlist-action-btn edit" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        this.setupCardEventListeners(card);
        return card;
    }

    // Setup event listeners for card buttons
    setupCardEventListeners(card) {
        const editBtn = card.querySelector('.wishlist-action-btn.edit');

        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.getAttribute('data-id');
                this.editWishlistItem(itemId);
            });
        }
    }

    // Initialize event listeners
    initEventListeners() {
        // Add wishlist buttons
        const addBtn = document.getElementById('addWishlistBtn');
        const addItemBtn = document.getElementById('addItemBtn');
        const addFirstBtn = document.getElementById('addFirstWishlist');
        const removeBtn = document.getElementById('removeWishlistBtn');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddModal());
        }
        
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.openAddModal());
        }
        
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => this.openAddModal());
        }

        // Remove button - NAVIGATE TO REMOVE PAGE
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                window.location.href = 'wishlistremove.html';
            });
        }

        // Filter and sort controls
        const filterCategory = document.getElementById('filterCategory');
        const sortWishlist = document.getElementById('sortWishlist');
        const searchInput = document.getElementById('wishlistSearch');

        if (filterCategory) {
            filterCategory.addEventListener('change', (e) => {
                this.currentCategoryFilter = e.target.value;
                this.applyFilters();
            });
        }

        if (sortWishlist) {
            sortWishlist.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFilters();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchWishlist(e.target.value);
            });
        }

        // Stats cards click events
        const statsCards = document.querySelectorAll('.wishlist-stats .stat-card');
        statsCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.filterByStats(filter);
                this.showStatsPopup(filter);
            });
        });

        // Add category button
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.toggleNewCategoryInput());
        }

        // New category input
        const newCategoryInput = document.getElementById('newCategoryInput');
        if (newCategoryInput) {
            newCategoryInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addNewCategory();
                }
            });
        }

        // Priority selector
        const priorityOptions = document.querySelectorAll('.priority-option');
        priorityOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectPriority(e.currentTarget.dataset.priority);
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
                this.closeStatsPopup();
            }
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            const wishlistModal = document.getElementById('wishlistModal');
            const confirmModal = document.getElementById('confirmModalPremium');
            const statsPopup = document.getElementById('statsPopup');

            if (wishlistModal && wishlistModal.classList.contains('active')) {
                if (!e.target.closest('.wishlist-modal-content') && 
                    !e.target.closest('#addWishlistBtn') &&
                    !e.target.closest('#addItemBtn') &&
                    !e.target.closest('#addFirstWishlist') &&
                    !e.target.closest('.edit')) {
                    this.closeWishlistModal();
                }
            }

            if (confirmModal && confirmModal.classList.contains('active')) {
                if (!e.target.closest('.confirm-modal-content')) {
                    this.closeConfirmationModal();
                }
            }

            if (statsPopup && statsPopup.classList.contains('active')) {
                if (!e.target.closest('.stats-popup-content')) {
                    this.closeStatsPopup();
                }
            }
        });
    }

    // Setup modal event listeners
    setupModals() {
        // Wishlist modal
        const closeWishlistModal = document.getElementById('closeWishlistModal');
        const closeWishlistForm = document.getElementById('closeWishlistForm');
        const resetWishlistForm = document.getElementById('resetWishlistForm');
        const wishlistForm = document.getElementById('wishlistForm');

        if (closeWishlistModal) {
            closeWishlistModal.addEventListener('click', () => this.closeWishlistModal());
        }

        if (closeWishlistForm) {
            closeWishlistForm.addEventListener('click', () => this.closeWishlistModal());
        }

        if (resetWishlistForm) {
            resetWishlistForm.addEventListener('click', () => this.resetWishlistForm());
        }

        if (wishlistForm) {
            wishlistForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveWishlistItem();
            });
        }

        // Confirmation modal (kept for other confirmations if needed)
        const confirmCancel = document.getElementById('confirmModalCancel');
        const confirmConfirm = document.getElementById('confirmModalConfirm');

        if (confirmCancel) {
            confirmCancel.addEventListener('click', () => this.closeConfirmationModal());
        }

        if (confirmConfirm) {
            confirmConfirm.addEventListener('click', () => {
                if (this.confirmCallback) {
                    this.confirmCallback();
                }
                this.closeConfirmationModal();
            });
        }
    }

    // Setup animations
    setupAnimations() {
        const statsCards = document.querySelectorAll('.wishlist-stats .stat-card');
        statsCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

       // Update stats counters
    updateStats() {
        const items = this.wishlistItems;
        
        console.log('Wishlist items for stats:', items); // ADD THIS LINE
        console.log('Categories found:', items.map(item => item.category)); // ADD THIS LINE
        
        const totalCount = document.getElementById('totalItemsCount');
        const categoriesCount = document.getElementById('categoriesCount');
        const highPriorityCount = document.getElementById('highPriorityCount');
        const mediumPriorityCount = document.getElementById('mediumPriorityCount');
        const lowPriorityCount = document.getElementById('lowPriorityCount');

        if (totalCount) totalCount.textContent = items.length;
        
        // Count unique categories
        const uniqueCategories = new Set(items.map(item => item.category));
        console.log('Unique categories:', Array.from(uniqueCategories)); // ADD THIS LINE
        console.log('Categories count:', uniqueCategories.size); // ADD THIS LINE
        
        if (categoriesCount) {
            categoriesCount.textContent = uniqueCategories.size;
            console.log('Set categories count to:', uniqueCategories.size); // ADD THIS LINE
        }
        
        if (highPriorityCount) highPriorityCount.textContent = items.filter(item => 
            item.priority === 'high'
        ).length;
        
        if (mediumPriorityCount) mediumPriorityCount.textContent = items.filter(item => 
            item.priority === 'medium'
        ).length;
        
        if (lowPriorityCount) lowPriorityCount.textContent = items.filter(item => 
            item.priority === 'low'
        ).length;
    }
    // Filter by stats card click
    filterByStats(filter) {
        this.currentFilter = filter;
        
        // Highlight active card
        const statsCards = document.querySelectorAll('.wishlist-stats .stat-card');
        statsCards.forEach(card => {
            card.classList.remove('active');
            if (card.dataset.filter === filter) {
                card.classList.add('active');
            }
        });
        
        this.applyFilters();
    }

    // Show stats popup
    showStatsPopup(filter) {
        let filteredItems = [...this.wishlistItems];
        let title = 'All Items';
        let icon = 'gift';

        // Filter items based on selected stat
        switch (filter) {
            case 'all':
                title = 'All Items';
                icon = 'gift';
                break;
            case 'category':
                filteredItems = this.wishlistItems; // Show all for categories count
                title = 'All Categories Items';
                icon = 'layer-group';
                break;
            case 'high':
                filteredItems = filteredItems.filter(item => item.priority === 'high');
                title = 'High Priority Items';
                icon = 'fire';
                break;
            case 'medium':
                filteredItems = filteredItems.filter(item => item.priority === 'medium');
                title = 'Medium Priority Items';
                icon = 'flag';
                break;
            case 'low':
                filteredItems = filteredItems.filter(item => item.priority === 'low');
                title = 'Low Priority Items';
                icon = 'leaf';
                break;
        }

        // Create or get stats popup
        let statsPopup = document.getElementById('statsPopup');
        if (!statsPopup) {
            statsPopup = document.createElement('div');
            statsPopup.id = 'statsPopup';
            statsPopup.className = 'stats-popup';
            statsPopup.innerHTML = `
                <div class="stats-popup-overlay"></div>
                <div class="stats-popup-content">
                    <div class="stats-popup-header">
                        <h3><i class="fas fa-${icon}"></i> ${title}</h3>
                        <button class="close-stats-popup" id="closeStatsPopup">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="stats-popup-body" id="statsPopupContent">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
            `;
            document.body.appendChild(statsPopup);
            
            // Add close event
            const closeBtn = statsPopup.querySelector('#closeStatsPopup');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeStatsPopup());
            }
        }

        // Load content
        const popupContent = statsPopup.querySelector('#statsPopupContent');
        if (popupContent) {
            if (filteredItems.length === 0) {
                popupContent.innerHTML = `
                    <div class="empty-stats-popup">
                        <i class="fas fa-${icon}"></i>
                        <h4>No Items Found</h4>
                        <p>There are no items matching this filter.</p>
                    </div>
                `;
            } else {
                popupContent.innerHTML = `
                    <div class="stats-items-grid">
                        ${filteredItems.map((item, index) => this.getStatsPopupItemHTML(item, index)).join('')}
                    </div>
                `;
            }
        }

        // Show popup
        statsPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Get stats popup item HTML
    getStatsPopupItemHTML(item, index) {
        const date = item.date ? new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : 'No date set';

        return `
            <div class="stats-item-card" style="animation-delay: ${index * 0.1}s">
                <div class="stats-item-header">
                    <h4 class="stats-item-title">${item.name}</h4>
                    <span class="stats-item-category">
                        <i class="fas fa-tag"></i>
                        ${this.getCategoryLabel(item.category)}
                    </span>
                </div>
                ${item.description ? `<p class="stats-item-description">${item.description}</p>` : ''}
                <div class="stats-item-footer">
                    <span class="stats-item-priority ${item.priority || 'medium'}">
                        <i class="fas fa-${this.getPriorityIcon(item.priority)}"></i>
                        ${this.getPriorityLabel(item.priority)}
                    </span>
                    <span class="stats-item-date">
                        <i class="far fa-calendar"></i>
                        ${date}
                    </span>
                </div>
            </div>
        `;
    }

    // Close stats popup
    closeStatsPopup() {
        const statsPopup = document.getElementById('statsPopup');
        if (statsPopup) {
            statsPopup.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Apply all filters and sorting
    applyFilters() {
        let filteredItems = [...this.wishlistItems];
        
        // Apply category filter
        if (this.currentCategoryFilter !== 'all') {
            filteredItems = filteredItems.filter(item => 
                item.category === this.currentCategoryFilter
            );
        }
        
        // Apply stats filter
        switch (this.currentFilter) {
            case 'all':
                // Show all items
                break;
            case 'category':
                // Already filtered by category
                break;
            case 'high':
                filteredItems = filteredItems.filter(item => item.priority === 'high');
                break;
            case 'medium':
                filteredItems = filteredItems.filter(item => item.priority === 'medium');
                break;
            case 'low':
                filteredItems = filteredItems.filter(item => item.priority === 'low');
                break;
        }
        
        // Apply sorting
        filteredItems = this.sortItems(filteredItems, this.currentSort);
        
        this.displayWishlist(filteredItems);
    }

    // Sort items
    sortItems(items, sortBy) {
        const sortedItems = [...items];
        
        switch (sortBy) {
            case 'date-desc':
                sortedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'date-asc':
                sortedItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'name-asc':
                sortedItems.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sortedItems.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'priority':
                const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
                sortedItems.sort((a, b) => 
                    (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
                );
                break;
        }
        
        return sortedItems;
    }

    // Search wishlist
    searchWishlist(query) {
        if (!query.trim()) {
            this.applyFilters();
            return;
        }

        const searchTerm = query.toLowerCase();
        const filteredItems = this.wishlistItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm)
        );
        
        this.displayWishlist(filteredItems);
    }

    // Update empty state
    updateEmptyState() {
        const wishlistGrid = document.getElementById('wishlistItemsGrid');
        const emptyWishlist = document.getElementById('emptyWishlist');
        
        if (this.wishlistItems.length === 0 && wishlistGrid && !emptyWishlist) {
            wishlistGrid.innerHTML = `
                <div class="empty-wishlist" id="emptyWishlist">
                    <i class="fas fa-gift"></i>
                    <h3>Your Wishlist is Empty</h3>
                    <p>Start adding items you want to track!</p>
                    <button class="add-first-btn premium-btn" id="addFirstWishlist">
                        <i class="fas fa-plus-circle"></i>
                        <span>Add First Item</span>
                    </button>
                </div>
            `;
            
            // Re-attach event listener
            const newAddFirstBtn = document.getElementById('addFirstWishlist');
            if (newAddFirstBtn) {
                newAddFirstBtn.addEventListener('click', () => this.openAddModal());
            }
        } else if (this.wishlistItems.length > 0) {
            if (emptyWishlist) {
                emptyWishlist.remove();
            }
        }
    }

    // Open add modal
    openAddModal() {
        this.currentEditId = null;
        
        const modal = document.getElementById('wishlistModal');
        const title = document.getElementById('wishlistModalTitle');
        const saveBtn = document.getElementById('saveWishlist');
        
        if (modal && title && saveBtn) {
            title.innerHTML = '<i class="fas fa-gift"></i> Add to Wishlist';
            saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Save Item</span>';
            
            // Reset form
            this.resetWishlistForm();
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on first input
            setTimeout(() => {
                const nameInput = document.getElementById('wishlistName');
                if (nameInput) {
                    nameInput.focus();
                    // Auto-capitalize first letter
                    nameInput.value = nameInput.value.charAt(0).toUpperCase() + nameInput.value.slice(1);
                }
            }, 100);
        }
    }

    // Open edit modal
    editWishlistItem(itemId) {
        this.currentEditId = itemId;
        
        const item = this.wishlistItems.find(item => item.id === itemId);
        if (!item) return;

        const modal = document.getElementById('wishlistModal');
        const title = document.getElementById('wishlistModalTitle');
        const saveBtn = document.getElementById('saveWishlist');
        
        if (modal && title && saveBtn) {
            title.innerHTML = '<i class="fas fa-gift"></i> Edit Wishlist Item';
            saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Update Item</span>';
            
            // Fill form with item data
            this.fillWishlistForm(item);
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on first input
            setTimeout(() => {
                const nameInput = document.getElementById('wishlistName');
                if (nameInput) {
                    nameInput.focus();
                    // Auto-capitalize first letter
                    nameInput.value = nameInput.value.charAt(0).toUpperCase() + nameInput.value.slice(1);
                }
            }, 100);
        }
    }

    // Fill form with item data - FIXED CATEGORY ISSUE
    fillWishlistForm(item) {
        const nameInput = document.getElementById('wishlistName');
        const descriptionInput = document.getElementById('wishlistDescription');
        const categorySelect = document.getElementById('wishlistCategory');
        const dateInput = document.getElementById('wishlistDate');
        const itemIdInput = document.getElementById('wishlistId');

        if (nameInput) nameInput.value = item.name || '';
        if (descriptionInput) descriptionInput.value = item.description || '';
        if (dateInput) dateInput.value = item.date ? item.date.split('T')[0] : '';
        if (itemIdInput) itemIdInput.value = item.id || '';
        
        // FIXED: Set category - this will work now because setupCategories includes all categories
        if (categorySelect) {
            // First, ensure the category exists in the select
            const categoryExists = Array.from(categorySelect.options).some(option => option.value === item.category);
            if (!categoryExists && item.category) {
                // Add the category if it doesn't exist
                const option = document.createElement('option');
                option.value = item.category;
                option.textContent = this.getCategoryLabel(item.category);
                categorySelect.appendChild(option);
            }
            categorySelect.value = item.category || '';
        }
        
        // Set priority
        this.selectPriority(item.priority || 'medium');
    }

    // Reset form
    resetWishlistForm() {
        const nameInput = document.getElementById('wishlistName');
        const descriptionInput = document.getElementById('wishlistDescription');
        const categorySelect = document.getElementById('wishlistCategory');
        const dateInput = document.getElementById('wishlistDate');
        const newCategoryInput = document.getElementById('newCategoryInput');
        const itemIdInput = document.getElementById('wishlistId');

        if (nameInput) nameInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        if (categorySelect) categorySelect.value = '';
        if (dateInput) dateInput.value = '';
        if (newCategoryInput) {
            newCategoryInput.style.display = 'none';
            newCategoryInput.value = '';
        }
        if (itemIdInput) itemIdInput.value = '';
        
        // Reset priority to medium
        this.selectPriority('medium');
    }

    // Toggle new category input
    toggleNewCategoryInput() {
        const newCategoryInput = document.getElementById('newCategoryInput');
        const categorySelect = document.getElementById('wishlistCategory');
        
        if (newCategoryInput && categorySelect) {
            if (newCategoryInput.style.display === 'none') {
                newCategoryInput.style.display = 'block';
                newCategoryInput.focus();
                categorySelect.disabled = true;
                // Auto-capitalize first letter
                newCategoryInput.value = newCategoryInput.value.charAt(0).toUpperCase() + newCategoryInput.value.slice(1);
            } else {
                newCategoryInput.style.display = 'none';
                categorySelect.disabled = false;
            }
        }
    }

    // Add new category - FIXED VERSION
    addNewCategory() {
        const newCategoryInput = document.getElementById('newCategoryInput');
        const categorySelect = document.getElementById('wishlistCategory');
        
        if (!newCategoryInput || !categorySelect) return;
        
        let categoryName = newCategoryInput.value.trim();
        if (!categoryName) {
            this.showMessage('Please enter a category name', 'error');
            return;
        }
        
        // Capitalize first letter
        categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        const lowerCaseName = categoryName.toLowerCase();
        
        // Add to categories array if not exists
        if (!this.categories.includes(lowerCaseName)) {
            this.categories.push(lowerCaseName);
        }
        
        // Check if option already exists
        let existingOption = null;
        for (let i = 0; i < categorySelect.options.length; i++) {
            if (categorySelect.options[i].value.toLowerCase() === lowerCaseName) {
                existingOption = categorySelect.options[i];
                break;
            }
        }
        
        if (!existingOption) {
            // Add to select
            const option = document.createElement('option');
            option.value = lowerCaseName;
            option.textContent = categoryName;
            categorySelect.appendChild(option);
        }
        
        categorySelect.value = lowerCaseName;
        
        // Reset input
        newCategoryInput.value = '';
        newCategoryInput.style.display = 'none';
        categorySelect.disabled = false;
        
        // Also update filter dropdown
        const filterCategorySelect = document.getElementById('filterCategory');
        if (filterCategorySelect) {
            // Check if exists in filter
            let filterExists = false;
            for (let i = 0; i < filterCategorySelect.options.length; i++) {
                if (filterCategorySelect.options[i].value === lowerCaseName) {
                    filterExists = true;
                    break;
                }
            }
            if (!filterExists) {
                const option = document.createElement('option');
                option.value = lowerCaseName;
                option.textContent = categoryName;
                filterCategorySelect.appendChild(option);
            }
        }
        
        this.showMessage('Category added successfully!', 'success');
    }

    // Select priority
    selectPriority(priority) {
        const priorityOptions = document.querySelectorAll('.priority-option');
        const priorityInput = document.getElementById('wishlistPriority');
        
        priorityOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.priority === priority) {
                option.classList.add('active');
            }
        });
        
        if (priorityInput) {
            priorityInput.value = priority;
        }
    }

    // Save wishlist item - FIXED CATEGORY SAVING
    saveWishlistItem() {
        const nameInput = document.getElementById('wishlistName');
        const descriptionInput = document.getElementById('wishlistDescription');
        const categorySelect = document.getElementById('wishlistCategory');
        const newCategoryInput = document.getElementById('newCategoryInput');
        const dateInput = document.getElementById('wishlistDate');
        const priorityInput = document.getElementById('wishlistPriority');
        const itemIdInput = document.getElementById('wishlistId');
        const saveBtn = document.getElementById('saveWishlist');

        if (!nameInput || !nameInput.value.trim()) {
            this.showMessage('Please enter item name', 'error');
            nameInput?.focus();
            return;
        }

        // Capitalize name
        let itemName = nameInput.value.trim();
        if (itemName.length > 0) {
            itemName = itemName.charAt(0).toUpperCase() + itemName.slice(1);
        }

        // Capitalize description
        let itemDescription = descriptionInput?.value.trim() || '';
        if (itemDescription.length > 0) {
            itemDescription = itemDescription.charAt(0).toUpperCase() + itemDescription.slice(1);
        }

        // Determine category - FIXED LOGIC
        let category = '';
        if (newCategoryInput && newCategoryInput.style.display === 'block') {
            category = newCategoryInput.value.trim().toLowerCase();
            if (!category) {
                this.showMessage('Please enter a category name', 'error');
                newCategoryInput.focus();
                return;
            }
            
            // Add new category to list
            if (!this.categories.includes(category)) {
                this.categories.push(category);
                this.setupCategories(); // Refresh category lists
            }
        } else if (categorySelect && categorySelect.value) {
            category = categorySelect.value;
        } else {
            this.showMessage('Please select or create a category', 'error');
            return;
        }

        const itemData = {
            id: this.currentEditId || (Date.now().toString() + Math.random().toString(36).substr(2, 9)),
            name: itemName,
            description: itemDescription,
            category: category,
            priority: priorityInput?.value || 'medium',
            date: dateInput?.value || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Show loading state
        if (saveBtn) {
            const originalHTML = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';
            saveBtn.disabled = true;
            saveBtn.classList.add('loading');
        }

        // Save with animation delay
        setTimeout(() => {
            try {
                let items = [...this.wishlistItems];
                
                if (this.currentEditId) {
                    // Update existing item
                    const index = items.findIndex(item => item.id === this.currentEditId);
                    if (index !== -1) {
                        items[index] = itemData;
                        this.showMessage('Wishlist item updated successfully!', 'success');
                    }
                } else {
                    // Add new item
                    items.push(itemData);
                    this.showMessage('Item added to wishlist!', 'success');
                }
                
                // Save to storage
                this.saveWishlistToStorage(items);
                
                // Force update stats immediately
                this.updateStats();
                
                // Reload categories to include new ones
                this.setupCategories();
                
                // Reload wishlist
                this.loadWishlist();
                
                // Close modal
                this.closeWishlistModal();

            } catch (error) {
                console.error('Save wishlist error:', error);
                this.showMessage('Failed to save item', 'error');
            } finally {
                // Restore button state
                if (saveBtn) {
                    saveBtn.innerHTML = this.currentEditId ? 
                        '<i class="fas fa-save"></i><span>Update Item</span>' : 
                        '<i class="fas fa-save"></i><span>Save Item</span>';
                    saveBtn.disabled = false;
                    saveBtn.classList.remove('loading');
                }
            }
        }, 800);
    }

    // Close modals
    closeModals() {
        this.closeWishlistModal();
        this.closeConfirmationModal();
        this.closeStatsPopup();
    }

    closeWishlistModal() {
        const modal = document.getElementById('wishlistModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            this.currentEditId = null;
            this.resetWishlistForm();
        }
    }

    closeConfirmationModal() {
        const modal = document.getElementById('confirmModalPremium');
        if (modal) {
            modal.classList.remove('active');
            this.confirmCallback = null;
        }
    }

    // Show confirmation modal (kept for potential future use)
    showConfirmationModal(title, message, confirmCallback) {
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

    getPriorityIcon(priority) {
        const icons = {
            'low': 'leaf',
            'medium': 'flag',
            'high': 'fire'
        };
        return icons[priority] || 'flag';
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

// Initialize wishlist page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WishlistPage();
});