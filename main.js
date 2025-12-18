// main.js - FINAL CORRECTED VERSION WITH PREMIUM BUTTONS

// Debug: Checking Storage Methods
console.log('=== DEBUG: Checking Storage Methods ===');
console.log('Storage exportData method exists:', typeof storage.exportData === 'function');
console.log('Storage importData method exists:', typeof storage.importData === 'function');
console.log('Storage getItemById method exists:', typeof storage.getItemById === 'function');
console.log('Storage updateItemFull method exists:', typeof storage.updateItemFull === 'function');

// Home Page Logic
class HomePage {
    constructor() {
        // FIRST: Assign storage
        this.storage = storage;
        
        // THEN: Debug logging
        console.log('=== HomePage Constructor ===');
        console.log('Storage instance:', this.storage);
        console.log('Edit Modal exists:', !!document.getElementById('editModal'));
        console.log('Export button exists:', !!document.getElementById('exportBoxBtn'));
        console.log('Import button exists:', !!document.getElementById('importBoxBtn'));
        
        this.init();
    }

    // Initialize home page
    init() {
        console.log('=== Initializing HomePage ===');
        
        // Debug functions
        this.debugFindElements();
        this.testAllFunctions();
        
        // Main initialization
        this.initEventListeners();
        this.addGlobalEventHandlers();
        this.loadCategories();
        this.loadItems();
        this.loadProfileData();
        this.initGreeting();
        
        
    }

    // Debug: Finding Elements
    debugFindElements() {
        console.log('=== Debug: Finding Elements ===');
        
        // Check ALL buttons in the document
        const allButtons = document.querySelectorAll('button');
        console.log('Total buttons found:', allButtons.length);
        
        allButtons.forEach((btn, index) => {
            if (btn.id) {
                console.log(`Button ${index}: ID="${btn.id}", Class="${btn.className}"`);
            }
        });
        
        // Check specifically for settings buttons
        const settingsButtons = document.querySelectorAll('.settings-btn-box');
        console.log('Settings buttons found:', settingsButtons.length);
        settingsButtons.forEach((btn, index) => {
            console.log(`Settings button ${index}: ID="${btn.id}", Text="${btn.textContent?.trim()}"`);
        });
        
        // Check if settings panel exists
        const settingsPanel = document.getElementById('settingsPanel');
        console.log('Settings panel:', settingsPanel ? 'Found' : 'Missing');
        
        if (settingsPanel) {
            console.log('Settings panel found, checking content...');
        }
    }

    // Test All Functions
    testAllFunctions() {
        console.log('=== Testing All Functions ===');
        
        // Test 1: Check storage methods
        console.log('Test 1 - Storage Methods:');
        console.log('- exportData:', typeof this.storage.exportData);
        console.log('- importData:', typeof this.storage.importData);
        console.log('- getItemById:', typeof this.storage.getItemById);
        console.log('- updateItemFull:', typeof this.storage.updateItemFull);
        
        // Test 2: Check DOM elements
        console.log('\nTest 2 - DOM Elements:');
        console.log('- Edit Modal:', document.getElementById('editModal') ? 'Found' : 'Missing');
        console.log('- Export Button:', document.getElementById('exportBoxBtn') ? 'Found' : 'Missing');
        console.log('- Import Button:', document.getElementById('importBoxBtn') ? 'Found' : 'Missing');
        console.log('- Import File Input:', document.getElementById('importFileBox') ? 'Found' : 'Missing');
        
        // Test 3: Sample data check
        console.log('\nTest 3 - Sample Data:');
        const items = this.storage.getItems();
        console.log('- Total items:', items.length);
        if (items.length > 0) {
            console.log('- First item ID:', items[0].id);
            console.log('- First item title:', items[0].title);
        }
    }

    // Test Export Function
    testExportFunction() {
        console.log('=== Testing Export Function ===');
        
        // Create a test button in the UI
        const testBtn = document.createElement('button');
        testBtn.textContent = 'Test Export';
        testBtn.id = 'testExportBtn';
        testBtn.style.position = 'fixed';
        testBtn.style.top = '10px';
        testBtn.style.right = '10px';
        testBtn.style.zIndex = '10000';
        testBtn.style.padding = '10px';
        testBtn.style.backgroundColor = '#4285f4';
        testBtn.style.color = 'white';
        testBtn.style.border = 'none';
        testBtn.style.borderRadius = '5px';
        testBtn.style.cursor = 'pointer';
        
        testBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Test export clicked');
            
            // Test 1: Simple alert test
            alert('Export test starting...');
            
            // Test 2: Direct storage call
            try {
                console.log('Calling storage.exportData()...');
                const success = this.storage.exportData();
                alert('Export ' + (success ? 'succeeded' : 'failed'));
            } catch (error) {
                alert('Export error: ' + error.message);
            }
        });
        
        document.body.appendChild(testBtn);
    }

    // Initialize event listeners
    initEventListeners() {
        console.log('=== Setting up Event Listeners ===');
        
        // Menu button
        const menuBtn = document.getElementById('menuBtn');
        const menuPanel = document.getElementById('menuPanel');
        const closeMenu = document.getElementById('closeMenu');
        const overlay = document.getElementById('overlay');

        if (menuBtn && menuPanel) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menuPanel.classList.add('active');
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeMenu) {
            closeMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                if (menuPanel) menuPanel.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsPanel = document.getElementById('settingsPanel');
        const closeSettings = document.getElementById('closeSettings');

        console.log('Settings button:', settingsBtn);
        console.log('Settings panel:', settingsPanel);
        console.log('Close settings button:', closeSettings);

        if (settingsBtn && settingsPanel) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Settings button clicked!');
                settingsPanel.classList.add('active');
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        } else {
            console.error('Settings button or panel missing!');
        }

        if (closeSettings) {
            closeSettings.addEventListener('click', (e) => {
                e.stopPropagation();
                if (settingsPanel) settingsPanel.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Overlay click
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                e.stopPropagation();
                if (menuPanel) menuPanel.classList.remove('active');
                if (settingsPanel) settingsPanel.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Export button - FIXED VERSION
        const exportBoxBtn = document.getElementById('exportBoxBtn');
        if (exportBoxBtn) {
            console.log('Setting up export button listener');
            exportBoxBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Export button clicked!');
                
                // Visual feedback
                const originalHTML = exportBoxBtn.innerHTML;
                exportBoxBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
                exportBoxBtn.disabled = true;
                
                setTimeout(() => {
                    try {
                        console.log('Calling storage.exportData()...');
                        const success = this.storage.exportData();
                        console.log('Export result:', success);
                        
                        if (success) {
                            this.showMessage('success', 'Data exported successfully! File should download automatically.');
                        } else {
                            this.showMessage('error', 'Failed to export data');
                        }
                    } catch (error) {
                        console.error('Export error:', error);
                        this.showMessage('error', 'Export failed: ' + error.message);
                    } finally {
                        // Restore button
                        exportBoxBtn.innerHTML = originalHTML;
                        exportBoxBtn.disabled = false;
                    }
                }, 100);
            });
        } else {
            console.error('Export button not found!');
        }

        // Import button - FIXED VERSION
        const importBoxBtn = document.getElementById('importBoxBtn');
        const importFileBox = document.getElementById('importFileBox');
        
        if (importBoxBtn && importFileBox) {
            console.log('Setting up import button listener');
            importBoxBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Import button clicked!');
                importFileBox.click();
            });

            importFileBox.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log('File selected:', file.name);
                    
                    // Show loading state
                    const originalHTML = importBoxBtn.innerHTML;
                    importBoxBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
                    importBoxBtn.disabled = true;
                    
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        try {
                            console.log('File read successfully, size:', e.target.result.length);
                            
                            // Ask for confirmation
                            const confirmImport = confirm(
                                '⚠️ IMPORTANT\n\n' +
                                'This will replace ALL your current data with the imported data.\n\n' +
                                'Current data will be permanently lost.\n\n' +
                                'Do you want to continue?'
                            );
                            
                            if (!confirmImport) {
                                console.log('Import cancelled by user');
                                importBoxBtn.innerHTML = originalHTML;
                                importBoxBtn.disabled = false;
                                e.target.value = '';
                                return;
                            }
                            
                            // Perform import
                            console.log('Calling storage.importData()...');
                            const success = this.storage.importData(e.target.result);
                            
                            if (success) {
                                this.showMessage('success', 'Data imported successfully! Reloading page...');
                                setTimeout(() => {
                                    location.reload();
                                }, 1500);
                            } else {
                                this.showMessage('error', 'Failed to import data');
                            }
                        } catch (error) {
                            console.error('Import error:', error);
                            this.showMessage('error', 'Import failed: ' + error.message);
                        } finally {
                            // Reset button and file input
                            importBoxBtn.innerHTML = originalHTML;
                            importBoxBtn.disabled = false;
                            e.target.value = '';
                        }
                    };
                    
                    reader.onerror = () => {
                        console.error('File reading failed');
                        this.showMessage('error', 'Failed to read file');
                        importBoxBtn.innerHTML = originalHTML;
                        importBoxBtn.disabled = false;
                        e.target.value = '';
                    };
                    
                    reader.readAsText(file);
                }
            });
        } else {
            console.error('Import button or file input not found!');
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.loadItems(e.target.value);
            });
        }

        // View all button
        const viewAllBtn = document.getElementById('viewAllBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.loadItems('all');
            });
        }

        // Edit modal
        const closeEditModal = document.getElementById('closeEditModal');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const editModal = document.getElementById('editModal');
        const editForm = document.getElementById('editItemForm');

        console.log('Edit modal elements:');
        console.log('- closeEditModal:', !!closeEditModal);
        console.log('- cancelEditBtn:', !!cancelEditBtn);
        console.log('- editModal:', !!editModal);
        console.log('- editForm:', !!editForm);

        if (closeEditModal) {
            closeEditModal.addEventListener('click', (e) => {
                e.stopPropagation();
                if (editModal) editModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Add click animation for premium button
                if (cancelEditBtn.classList.contains('premium-btn')) {
                    cancelEditBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        cancelEditBtn.style.transform = '';
                    }, 150);
                }
                
                if (editModal) {
                    editModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Edit form submitted!');
                this.handleEditFormSubmit();
            });
        }

        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    editModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        // Prevent clicks inside panels from closing them
        if (menuPanel) {
            menuPanel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        if (settingsPanel) {
            settingsPanel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        const editModalContent = document.querySelector('.edit-modal-content');
        if (editModalContent) {
            editModalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Add ripple effect to buttons
        this.addRippleEffect();
    }

    // Load categories
    loadCategories() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) return;

        const categories = this.storage.getCategories();
        const items = this.storage.getItems();
        
        categoriesContainer.innerHTML = '';

        categories.forEach(category => {
            const categoryItems = items.filter(item => item.category === category);
            
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card ripple';
            categoryCard.innerHTML = `
                <h3>${category}</h3>
                <p>${categoryItems.length} items</p>
            `;
            
            categoryCard.addEventListener('click', () => {
                this.loadItems('newest', category);
            });
            
            categoriesContainer.appendChild(categoryCard);
        });
    }

    // Load items with optional sorting and filtering
    loadItems(sortBy = 'newest', filterCategory = null) {
        const itemsContainer = document.getElementById('itemsContainer');
        if (!itemsContainer) return;

        let items = filterCategory 
            ? this.storage.getItems(filterCategory)
            : this.storage.getItems();

        items = this.storage.sortItems(items, sortBy);

        itemsContainer.innerHTML = '';

        if (items.length === 0) {
            itemsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No items yet</h3>
                    <p>Add your first item to get started!</p>
                    <button onclick="location.href='add.html'" class="add-first-btn">
                        Add First Item
                    </button>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const itemCard = this.createItemCard(item);
            itemsContainer.appendChild(itemCard);
        });
    }

    // Create item card element with debug logging
    createItemCard(item) {
        console.log(`Creating item card for: "${item.title}" (ID: ${item.id})`);
        
        const card = document.createElement('div');
        card.className = `item-card ${item.isCompleted ? 'completed' : ''}`;
        card.dataset.id = item.id;
        
        card.innerHTML = `
            <div class="item-header">
                <div>
                    <h3 class="item-title">${item.title}</h3>
                    <span class="item-category">${item.category}</span>
                </div>
                <div class="item-status">
                    ${item.isFavorite ? '<i class="fas fa-star star-icon"></i>' : ''}
                </div>
            </div>
            
            ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
            
            <div class="item-footer">
                ${item.progress ? `<span class="item-progress">${item.progress}</span>` : ''}
                <div class="item-actions">
                    <button class="action-icon edit-btn" title="Edit Item" data-item-id="${item.id}">
                        <span class="action-emoji">✏️</span>
                    </button>
                    <button class="action-icon favorite-btn" title="${item.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}" data-item-id="${item.id}">
                        <span class="action-emoji">${item.isFavorite ? '⭐' : '☆'}</span>
                    </button>
                    <button class="action-icon complete-btn" title="${item.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}" data-item-id="${item.id}">
                        <span class="action-emoji">${item.isCompleted ? '↶' : '✅'}</span>
                    </button>
                </div>
            </div>
        `;

        // Debug: Check all buttons were created
        const editBtn = card.querySelector('.edit-btn');
        const favoriteBtn = card.querySelector('.favorite-btn');
        const completeBtn = card.querySelector('.complete-btn');
        
        console.log(`  Buttons created: Edit=${!!editBtn}, Favorite=${!!favoriteBtn}, Complete=${!!completeBtn}`);
        
        // Add event listeners
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                console.log(`Edit button clicked for item: ${item.id} - "${item.title}"`);
                e.stopPropagation();
                e.preventDefault();
                
                // Test if handleEditItem exists
                if (typeof this.handleEditItem === 'function') {
                    console.log('Calling handleEditItem...');
                    this.handleEditItem(item.id);
                } else {
                    console.error('handleEditItem method not found!');
                    alert('Edit feature not available');
                }
            });
        }
        
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                console.log(`Favorite button clicked for item: ${item.id}`);
                e.stopPropagation();
                e.preventDefault();
                this.handleToggleFavorite(item.id);
            });
        }
        
        if (completeBtn) {
            completeBtn.addEventListener('click', (e) => {
                console.log(`Complete button clicked for item: ${item.id}`);
                e.stopPropagation();
                e.preventDefault();
                this.handleToggleComplete(item.id);
            });
        }
        
        return card;
    }

    // Handle search
    handleSearch(query) {
        const itemsContainer = document.getElementById('itemsContainer');
        if (!itemsContainer) return;

        if (!query.trim()) {
            this.loadItems();
            return;
        }

        const results = this.storage.searchItems(query);
        
        if (results.length === 0) {
            itemsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try a different search term</p>
                </div>
            `;
            return;
        }

        itemsContainer.innerHTML = '';
        results.forEach(item => {
            const itemCard = this.createItemCard(item);
            itemsContainer.appendChild(itemCard);
        });
    }

    // Handle edit item - opens modal
    handleEditItem(itemId) {
        console.log(`handleEditItem called for ID: ${itemId}`);
        
        // Get the item
        const item = this.storage.getItemById(itemId);
        console.log('Item found:', item);
        
        if (!item) {
            console.error('Item not found:', itemId);
            alert('Item not found!');
            return;
        }

        const editModal = document.getElementById('editModal');
        if (!editModal) {
            console.error('Edit modal not found!');
            alert('Edit feature not available');
            return;
        }

        console.log('Populating edit form...');
        // Populate form with item data
        this.populateEditForm(item);

        // Show modal
        console.log('Showing edit modal...');
        editModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Populate edit form with item data
    populateEditForm(item) {
        const editCategorySelect = document.getElementById('editCategorySelect');
        const editNewCategory = document.getElementById('editNewCategory');
        const editItemTitle = document.getElementById('editItemTitle');
        const editItemDescription = document.getElementById('editItemDescription');
        const editItemProgress = document.getElementById('editItemProgress');
        const editItemFavorite = document.getElementById('editItemFavorite');
        const editItemCompleted = document.getElementById('editItemCompleted');
        const editItemId = document.getElementById('editItemId');

        if (!editCategorySelect || !editItemTitle || !editItemId) return;

        // Load categories
        const categories = this.storage.getCategories();
        editCategorySelect.innerHTML = '<option value="">Select or create category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            editCategorySelect.appendChild(option);
        });

        // Set current values
        editCategorySelect.value = item.category;
        editItemTitle.value = item.title;
        editItemDescription.value = item.description || '';
        editItemProgress.value = item.progress || '';
        editItemFavorite.checked = item.isFavorite || false;
        editItemCompleted.checked = item.isCompleted || false;
        editItemId.value = item.id;

        // Reset new category input
        if (editNewCategory) {
            editNewCategory.value = '';
            editNewCategory.disabled = true;
        }
    }

    // Handle edit form submission WITH PREMIUM BUTTON ANIMATIONS
    handleEditFormSubmit() {
        const editCategorySelect = document.getElementById('editCategorySelect');
        const editNewCategory = document.getElementById('editNewCategory');
        const editItemTitle = document.getElementById('editItemTitle');
        const editItemProgress = document.getElementById('editItemProgress');
        const editItemFavorite = document.getElementById('editItemFavorite');
        const editItemCompleted = document.getElementById('editItemCompleted');
        const editItemId = document.getElementById('editItemId');
        const saveBtn = document.querySelector('.save-btn');
        const cancelBtn = document.querySelector('.cancel-btn');

        if (!editCategorySelect || !editItemTitle || !editItemId || !saveBtn) return;

        // Determine category
        let category;
        if (editNewCategory && editNewCategory.value.trim()) {
            category = editNewCategory.value;
        } else if (editCategorySelect.value) {
            category = editCategorySelect.value;
        } else {
            alert('Please select or create a category');
            return;
        }

        // Validate title
        if (!editItemTitle.value.trim()) {
            alert('Please enter a title');
            editItemTitle.focus();
            return;
        }

        // Add loading state to save button (premium animation)
        const originalSaveText = saveBtn.innerHTML;
        if (saveBtn.classList.contains('premium-btn')) {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';
            saveBtn.classList.add('loading');
            saveBtn.disabled = true;
            
            if (cancelBtn) {
                cancelBtn.disabled = true;
            }
        }

        // Prepare update data
        const updateData = {
            category: category,
            title: editItemTitle.value,
            description: document.getElementById('editItemDescription')?.value || '',
            progress: editItemProgress?.value || '',
            isFavorite: editItemFavorite?.checked || false,
            isCompleted: editItemCompleted?.checked || false
        };

        // Update item with delay for animation
        setTimeout(() => {
            try {
                const success = this.storage.updateItemFull(editItemId.value, updateData);
                
                if (success) {
                    // Success animation for premium button
                    if (saveBtn.classList.contains('premium-btn')) {
                        saveBtn.innerHTML = '<i class="fas fa-check"></i><span>Saved!</span>';
                        saveBtn.style.background = 'linear-gradient(135deg, #2e7d32, #1b5e20)';
                        
                        setTimeout(() => {
                            // Close modal
                            const editModal = document.getElementById('editModal');
                            if (editModal) {
                                editModal.classList.remove('active');
                                document.body.style.overflow = '';
                            }
                            
                            // Show success message
                            this.showMessage('success', '✓ Item updated successfully!');
                            
                            // Reload items and categories
                            this.loadItems();
                            this.loadCategories();
                            
                            // Reset button
                            saveBtn.innerHTML = originalSaveText;
                            saveBtn.style.background = '';
                            saveBtn.classList.remove('loading');
                            saveBtn.disabled = false;
                            
                            if (cancelBtn) {
                                cancelBtn.disabled = false;
                            }
                        }, 800);
                    } else {
                        // Fallback for non-premium button
                        const editModal = document.getElementById('editModal');
                        if (editModal) {
                            editModal.classList.remove('active');
                            document.body.style.overflow = '';
                        }
                        
                        this.showMessage('success', 'Item updated successfully!');
                        this.loadItems();
                        this.loadCategories();
                    }
                } else {
                    // Error state for premium button
                    if (saveBtn.classList.contains('premium-btn')) {
                        saveBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Failed!</span>';
                        saveBtn.style.background = 'linear-gradient(135deg, #ea4335, #c62828)';
                        
                        setTimeout(() => {
                            saveBtn.innerHTML = originalSaveText;
                            saveBtn.style.background = '';
                            saveBtn.classList.remove('loading');
                            saveBtn.disabled = false;
                            
                            if (cancelBtn) {
                                cancelBtn.disabled = false;
                            }
                            
                            this.showMessage('error', 'Failed to update item');
                        }, 1500);
                    } else {
                        // Fallback for non-premium button
                        this.showMessage('error', 'Failed to update item');
                        if (saveBtn) {
                            saveBtn.disabled = false;
                        }
                        if (cancelBtn) {
                            cancelBtn.disabled = false;
                        }
                    }
                }
            } catch (error) {
                console.error('Update error:', error);
                
                // Error state for premium button
                if (saveBtn.classList.contains('premium-btn')) {
                    saveBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Error!</span>';
                    saveBtn.style.background = 'linear-gradient(135deg, #ea4335, #c62828)';
                    
                    setTimeout(() => {
                        saveBtn.innerHTML = originalSaveText;
                        saveBtn.style.background = '';
                        saveBtn.classList.remove('loading');
                        saveBtn.disabled = false;
                        
                        if (cancelBtn) {
                            cancelBtn.disabled = false;
                        }
                        
                        this.showMessage('error', 'An error occurred while saving');
                    }, 1500);
                } else {
                    // Fallback for non-premium button
                    this.showMessage('error', 'An error occurred while saving');
                    if (saveBtn) {
                        saveBtn.disabled = false;
                    }
                    if (cancelBtn) {
                        cancelBtn.disabled = false;
                    }
                }
            }
        }, 800); // Animation delay
    }

    // Handle toggle favorite
    handleToggleFavorite(itemId) {
        const item = this.storage.getItemById(itemId);
        if (!item) return;

        this.storage.updateItem(itemId, { isFavorite: !item.isFavorite });
        this.loadItems();
    }

    // Handle toggle complete
    handleToggleComplete(itemId) {
        const item = this.storage.getItemById(itemId);
        if (!item) return;

        this.storage.updateItem(itemId, { isCompleted: !item.isCompleted });
        this.loadItems();
    }

    // Handle data import (fallback)
    async handleImport(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const confirmImport = confirm('This will replace all your current data. Continue?');
            if (!confirmImport) return;

            const success = this.storage.importData(e.target.result);
            if (success) {
                alert('Data imported successfully!');
                location.reload();
            } else {
                alert('Failed to import data. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    }

    // Load profile data for menu
    loadProfileData() {
        const profile = this.storage.getProfile();
        const menuProfileImg = document.getElementById('menuProfileImg');
        const menuUserName = document.getElementById('menuUserName');

        if (profile) {
            if (menuProfileImg && profile.image) {
                menuProfileImg.src = profile.image;
                menuProfileImg.alt = profile.name;
            }
            if (menuUserName) {
                menuUserName.textContent = profile.name || profile.username || 'User';
            }
        }
    }

    // Initialize greeting section
    initGreeting() {
        this.updateGreeting();
        this.updateDateTime();
        
        // Update time every minute
        setInterval(() => {
            this.updateDateTime();
        }, 60000);
    }

    // Update greeting based on profile
    updateGreeting() {
        const profile = this.storage.getProfile();
        const greetingMessage = document.getElementById('greetingMessage');
        const greetingProfileImg = document.getElementById('greetingProfileImg');
        const profileFallback = document.getElementById('profileFallback');

        if (!greetingMessage) return;

        const now = new Date();
        const hour = now.getHours();
        let greeting = 'Hello';

        // Determine time-based greeting
        if (hour >= 5 && hour < 12) {
            greeting = 'Good Morning';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon';
        } else if (hour >= 17 && hour < 22) {
            greeting = 'Good Evening';
        } else {
            greeting = 'Good Night';
        }

        // Set greeting with profile name or default
        const userName = profile ? profile.name || profile.username || 'User' : 'User';
        greetingMessage.textContent = `${greeting}, ${userName}`;

        // Update profile image
        if (greetingProfileImg && profileFallback) {
            if (profile && profile.image) {
                greetingProfileImg.src = profile.image;
                greetingProfileImg.style.display = 'block';
                profileFallback.style.display = 'none';
            } else {
                greetingProfileImg.style.display = 'none';
                profileFallback.style.display = 'flex';
            }
        }
    }

        // Update date and time
    updateDateTime() {
        const now = new Date();
        const dateElement = document.getElementById('currentDate');
        const timeElement = document.getElementById('currentTime');

        if (dateElement) {
            const options = { weekday: 'long', day: 'numeric', month: 'short' };
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }

        if (timeElement) {
            // Convert to 12-hour format
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            // Convert 24-hour to 12-hour format
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            
            timeElement.textContent = `${hours}:${minutes} ${ampm}`;
        }
    }

    // Add global click handler for escape key and outside clicks
    addGlobalEventHandlers() {
        // Close panels on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllPanels();
            }
        });

        // Close panels when clicking outside
        document.addEventListener('click', (e) => {
            const menuPanel = document.getElementById('menuPanel');
            const settingsPanel = document.getElementById('settingsPanel');
            const editModal = document.getElementById('editModal');
            const overlay = document.getElementById('overlay');

            // Check if click is outside active panels
            if (menuPanel && menuPanel.classList.contains('active')) {
                if (!menuPanel.contains(e.target) && e.target.id !== 'menuBtn') {
                    this.closeAllPanels();
                }
            }

            if (settingsPanel && settingsPanel.classList.contains('active')) {
                if (!settingsPanel.contains(e.target) && e.target.id !== 'settingsBtn') {
                    this.closeAllPanels();
                }
            }

            if (editModal && editModal.classList.contains('active')) {
                if (!editModal.contains(e.target)) {
                    editModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // Close all panels
    closeAllPanels() {
        const menuPanel = document.getElementById('menuPanel');
        const settingsPanel = document.getElementById('settingsPanel');
        const editModal = document.getElementById('editModal');
        const overlay = document.getElementById('overlay');

        if (menuPanel) menuPanel.classList.remove('active');
        if (settingsPanel) settingsPanel.classList.remove('active');
        if (editModal) editModal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        
        document.body.style.overflow = '';
    }

    // Show message
    showMessage(type, text) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = text;
        
        document.body.appendChild(messageDiv);
        
        // Animate in
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // Add ripple effect to buttons
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

    // Initialize sample data for testing
    initializeSampleData() {
        const items = this.storage.getItems();
        if (items.length === 0) {
            // Add sample items for testing
            const sampleItems = [
                {
                    category: 'Anime',
                    title: 'Attack on Titan',
                    description: 'Final season part 3',
                    progress: 'Episode 5/12',
                    isFavorite: true,
                    isCompleted: false
                },
                {
                    category: 'Manga',
                    title: 'One Piece',
                    description: 'The great pirate adventure',
                    progress: 'Chapter 1085',
                    isFavorite: false,
                    isCompleted: false
                },
                {
                    category: 'Workouts',
                    title: 'Morning Run',
                    description: '5K morning run',
                    progress: '30min',
                    isFavorite: true,
                    isCompleted: true
                },
                {
                    category: 'Manhwa',
                    title: 'Solo Leveling',
                    description: 'The hunter becomes the hunted',
                    progress: 'Chapter 120',
                    isFavorite: false,
                    isCompleted: false
                }
            ];

            sampleItems.forEach(item => {
                this.storage.addItem(item);
            });
            
            console.log('Sample data initialized');
        }
    }

    // Optional: Add subtle sound effects for premium feel
    addButtonSounds() {
        // Create audio context for subtle button sounds
        const playButtonSound = (frequency = 800, duration = 0.1) => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                // Sound not supported or user blocked audio
                console.log('Audio not available');
            }
        };
        
        // Add sound to premium buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.premium-btn')) {
                if (e.target.closest('.save-btn')) {
                    playButtonSound(1000, 0.15); // Higher pitch for save
                } else if (e.target.closest('.cancel-btn')) {
                    playButtonSound(600, 0.1); // Lower pitch for cancel
                }
            }
        });
    }

}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating HomePage...');
    new HomePage();
});