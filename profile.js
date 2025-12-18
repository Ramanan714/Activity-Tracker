// profile.js - COMPLETE FIXED VERSION with Wishlist Nav and Workout Fixes

class ProfilePage {
    constructor() {
        this.storage = storage;
        this.cropper = null;
        this.selectedQuickCheck = null;
        this.currentWorkoutEditId = null;
        this.confirmCallback = null; // Add this for confirmation modal
        this.init();
    }

    // Initialize profile page
    init() {
        console.log('Initializing Profile Page...');
        this.createModals();
        this.loadProfileContent();
        this.initEventListeners();
        this.initAnimations();
        
        // Setup crop modal event listeners immediately
        this.setupCropModal();
        
        // FIX: Add workout modal to DOM if it doesn't exist
        this.ensureWorkoutModalExists();
    }

    // Add this method to ensure workout modal exists in DOM
    ensureWorkoutModalExists() {
        if (!document.getElementById('workoutModal')) {
            const modalHTML = this.getWorkoutModalHTML();
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            console.log('Workout modal added to DOM');
        }
    }

    // Add this method to get the workout modal HTML
    getWorkoutModalHTML() {
        return `
            <!-- Workout Modal -->
            <div class="workout-modal" id="workoutModal">
                <div class="workout-modal-content">
                    <div class="workout-modal-header">
                        <h3 id="workoutModalTitle"><i class="fas fa-dumbbell"></i> Add Workout</h3>
                        <button class="close-workout-modal" id="closeWorkoutModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="workout-modal-body">
                        <form id="workoutForm" class="workout-form">
                            <div class="form-group">
                                <label for="workoutName">Workout/Exercise Name *</label>
                                <input type="text" id="workoutName" class="form-input" 
                                       required 
                                       placeholder="e.g., Bench Press, Running, Yoga">
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="workoutSets">Sets (Optional)</label>
                                    <input type="number" id="workoutSets" class="form-input" 
                                           placeholder="e.g., 3">
                                </div>
                                <div class="form-group">
                                    <label for="workoutReps">Reps/Time (Optional)</label>
                                    <input type="text" id="workoutReps" class="form-input" 
                                           placeholder="e.g., 10 reps or 30 mins">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="workoutBest">All Time Best (Optional)</label>
                                <input type="text" id="workoutBest" class="form-input" 
                                       placeholder="e.g., 100kg or 5km">
                            </div>
                            
                            <input type="hidden" id="workoutId">
                            
                            <div class="workout-form-actions">
                                <button type="button" class="workout-form-btn reset" id="resetWorkoutForm">
                                    <i class="fas fa-undo"></i>
                                    <span>Reset</span>
                                </button>
                                <button type="button" class="workout-form-btn close" id="closeWorkoutForm">
                                    <i class="fas fa-times"></i>
                                    <span>Close</span>
                                </button>
                                <button type="submit" class="workout-form-btn save" id="saveWorkoutBtn">
                                    <i class="fas fa-save"></i>
                                    <span>Save</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    // Load profile content dynamically
    loadProfileContent() {
        const profileContainer = document.getElementById('profileContainer');
        if (!profileContainer) return;

        const profile = this.storage.getProfile();
        const stats = this.storage.getStats();
        const workouts = this.getWorkouts();
        const wishlistCount = this.getWishlistCount();
        
        profileContainer.innerHTML = this.getProfileHTML(profile, stats, workouts, wishlistCount);
        
        // Setup all functionality
        this.setupProfileForm();
        this.setupAvatarUpload();
        this.setupQuickCheckButtons();
        this.setupQuickActions();
        this.setupWorkoutTracker();
        
        // Load profile image correctly AFTER DOM is rendered
        setTimeout(() => {
            this.loadProfileImage();
            this.loadWorkoutHistory();
            this.updateWishlistCount();
        }, 100);
    }

    // Add this method to get wishlist count
    getWishlistCount() {
        const data = this.storage.getData();
        return (data.wishlist || []).length;
    }

    // Add this method to update wishlist count display
    updateWishlistCount() {
        const wishlistCountElement = document.getElementById('wishlistCount');
        if (wishlistCountElement) {
            const count = this.getWishlistCount();
            wishlistCountElement.textContent = count;
            wishlistCountElement.style.display = count > 0 ? 'block' : 'none';
        }
    }

    loadProfileImage() {
        const profile = this.storage.getProfile();
        console.log('Loading profile data:', profile);
        
        if (profile && profile.image) {
            console.log('Profile has image:', profile.image.substring(0, 50) + '...');
            
            const profileAvatar = document.getElementById('profileAvatar');
            const profileFallback = document.querySelector('.profile-image-fallback');
            
            if (profileAvatar && profileFallback) {
                // Create a new image object to test loading
                const testImage = new Image();
                testImage.onload = () => {
                    console.log('Profile image loaded successfully');
                    profileAvatar.src = profile.image;
                    profileAvatar.style.display = 'block';
                    profileFallback.style.display = 'none';
                    
                    // Force reflow to ensure display
                    profileAvatar.style.opacity = '0';
                    setTimeout(() => {
                        profileAvatar.style.opacity = '1';
                        profileAvatar.style.transition = 'opacity 0.3s ease';
                    }, 10);
                };
                
                testImage.onerror = () => {
                    console.error('Profile image failed to load, using fallback');
                    profileAvatar.style.display = 'none';
                    profileFallback.style.display = 'flex';
                };
                
                testImage.src = profile.image;
            }
        } else {
            console.log('No profile image found, showing fallback');
            const profileAvatar = document.getElementById('profileAvatar');
            const profileFallback = document.querySelector('.profile-image-fallback');
            
            if (profileAvatar && profileFallback) {
                profileAvatar.style.display = 'none';
                profileFallback.style.display = 'flex';
            }
        }
    }

    getProfileHTML(profile, stats, workouts, wishlistCount = 0) {
        return `
            <!-- Profile Section -->
            <section class="profile-section">
                <h2><i class="fas fa-user"></i> Profile</h2>
                
                <div class="profile-header">
                    <div class="profile-image-container">
                        <img id="profileAvatar" src="" alt="Profile" class="profile-image" style="display: none;">
                        <div class="profile-image-fallback">
                            <i class="fas fa-user"></i>
                        </div>
                        <button class="edit-image-btn" id="editAvatarBtn" title="Change Profile Picture">
                            <i class="fas fa-camera"></i>
                        </button>
                        <input type="file" id="avatarInput" class="file-input" accept="image/*" style="display: none;">
                    </div>
                    
                    <div class="profile-info">
                        <h3 id="profileName">${profile.name || 'Your Name'}</h3>
                        ${profile.tagline ? `<p class="profile-tagline" id="profileTagline">${profile.tagline}</p>` : ''}
                        <span class="profile-username">@${profile.username || (profile.name ? profile.name.toLowerCase().replace(/\s+/g, '') : 'user')}</span>
                    </div>
                </div>
                
                <form id="profileForm" class="profile-form">
                    <div class="form-group">
                        <label for="userName">Name *</label>
                        <input type="text" id="userName" class="form-input" 
                               value="${profile.name || ''}" 
                               required 
                               placeholder="Enter your name">
                    </div>
                    
                    <div class="form-group">
                        <label for="userTagline">Tagline (Optional)</label>
                        <input type="text" id="userTagline" class="form-input" 
                               value="${profile.tagline || ''}" 
                               placeholder="Add a short tagline about yourself">
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="form-action-btn reset" id="resetProfile">
                            <i class="fas fa-undo"></i>
                            <span>Reset</span>
                        </button>
                        <button type="submit" class="form-action-btn save" id="saveProfile">
                            <i class="fas fa-save"></i>
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </section>
            
            <!-- Quick Check Section -->
            <section class="quickcheck-section">
                <h2><i class="fas fa-chart-pie"></i> Quick Check</h2>
                
                <div class="quickcheck-buttons">
                    <button class="quickcheck-btn" data-type="items">
                        <i class="fas fa-list"></i>
                        <span class="count">${stats.totalItems}</span>
                        <span class="label">Total Items</span>
                    </button>
                    <button class="quickcheck-btn" data-type="categories">
                        <i class="fas fa-layer-group"></i>
                        <span class="count">${stats.totalCategories}</span>
                        <span class="label">Categories</span>
                    </button>
                    <button class="quickcheck-btn" data-type="favorites">
                        <i class="fas fa-star"></i>
                        <span class="count">${stats.totalFavorites}</span>
                        <span class="label">Favorites</span>
                    </button>
                    <button class="quickcheck-btn" data-type="completed">
                        <i class="fas fa-check-circle"></i>
                        <span class="count">${stats.totalCompleted}</span>
                        <span class="label">Completed</span>
                    </button>
                </div>
            </section>
            
            <!-- Wishlist Navigation Section -->
            <section class="quick-actions-section wishlist-nav-section">
                <h2><i class="fas fa-heart"></i> My Wishlist</h2>
                
                <div class="quick-actions-grid">
                    <a href="wishlist.html" class="quick-action-btn wishlist-nav-btn">
                        <i class="fas fa-heart"></i>
                        <span>View Wishlist</span>
                        <div class="wishlist-count" id="wishlistCount" style="display: ${wishlistCount > 0 ? 'block' : 'none'}">${wishlistCount}</div>
                    </a>
                </div>
            </section>
            
            <!-- Quick Actions Section -->
            <section class="quick-actions-section">
                <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
                
                <div class="quick-actions-grid">
                    <a href="add.html" class="quick-action-btn">
                        <i class="fas fa-plus-circle"></i>
                        <span>Add Items</span>
                    </a>
                    <a href="remove.html" class="quick-action-btn">
                        <i class="fas fa-trash-alt"></i>
                        <span>Remove Items</span>
                    </a>
                    <a href="favorites.html" class="quick-action-btn">
                        <i class="fas fa-star"></i>
                        <span>Favorites</span>
                    </a>
                </div>
            </section>
            
            <!-- Workout Tracker Section -->
            <section class="workout-tracker-section">
                <div class="workout-header">
                    <h2><i class="fas fa-dumbbell"></i> Workout Tracker</h2>
                    <button class="add-workout-btn" id="addWorkoutBtn">
                        <i class="fas fa-plus"></i>
                        <span>Add Workout</span>
                    </button>
                </div>
                
                <div class="workout-history">
                    <div class="workout-history-items" id="workoutHistoryItems">
                        ${workouts.length === 0 ? 
                            `<div class="empty-state">
                                <i class="fas fa-dumbbell"></i>
                                <p>No workouts saved yet. Click "Add Workout" to add your first workout!</p>
                            </div>` : 
                            workouts.map(workout => this.getWorkoutItemHTML(workout)).join('')
                        }
                    </div>
                </div>
            </section>
        `;
    }

    getWorkoutItemHTML(workout) {
        const date = new Date(workout.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="workout-item" data-id="${workout.id}" style="animation-delay: ${Math.random() * 300}ms">
                <div class="workout-item-header">
                    <div class="workout-item-name">${workout.name}</div>
                    <div class="workout-item-date">${formattedDate}</div>
                </div>
                
                <div class="workout-item-details">
                    ${workout.sets ? `
                        <div class="workout-detail">
                            <div class="workout-detail-label">Sets</div>
                            <div class="workout-detail-value">${workout.sets}</div>
                        </div>
                    ` : ''}
                    
                    ${workout.reps ? `
                        <div class="workout-detail">
                            <div class="workout-detail-label">Reps/Time</div>
                            <div class="workout-detail-value">${workout.reps}</div>
                        </div>
                    ` : ''}
                    
                    ${workout.best ? `
                        <div class="workout-best">
                            <div class="workout-best-label">All Time Best</div>
                            <div class="workout-best-value">${workout.best}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="workout-item-actions">
                    <button class="workout-action-btn update" data-id="${workout.id}">
                        <i class="fas fa-edit"></i>
                        <span>Update</span>
                    </button>
                    <button class="workout-action-btn delete" data-id="${workout.id}">
                        <i class="fas fa-trash"></i>
                        <span>Remove</span>
                    </button>
                </div>
            </div>
        `;
    }

    createModals() {
        // Modals are in HTML, we'll add event listeners after DOM loads
    }

    initEventListeners() {
        // Global event listeners for closing modals
        document.addEventListener('click', (e) => {
            // Close quick check popup when clicking outside
            const quickcheckPopup = document.getElementById('quickcheckPopup');
            if (quickcheckPopup && quickcheckPopup.classList.contains('active')) {
                if (!e.target.closest('.quickcheck-popup-content') && 
                    !e.target.closest('.quickcheck-btn')) {
                    this.closeQuickCheckPopup();
                }
            }

            // Close crop modal when clicking outside
            const cropModal = document.getElementById('cropModal');
            if (cropModal && cropModal.classList.contains('active')) {
                if (!e.target.closest('.crop-modal-content') && 
                    !e.target.closest('#editAvatarBtn') &&
                    !e.target.closest('#avatarInput')) {
                    this.closeCropModal();
                }
            }

            // Close workout modal when clicking outside
            const workoutModal = document.getElementById('workoutModal');
            if (workoutModal && workoutModal.classList.contains('active')) {
                if (!e.target.closest('.workout-modal-content') && 
                    !e.target.closest('#addWorkoutBtn') &&
                    !e.target.closest('.update')) {
                    this.closeWorkoutModal();
                }
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeQuickCheckPopup();
                this.closeCropModal();
                this.closeWorkoutModal();
                this.closeConfirmationModal();
            }
        });
    }

    initAnimations() {
        // Add staggered animations to sections
        const sections = document.querySelectorAll('.profile-container > *');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
        });
    }

    setupProfileForm() {
        const form = document.getElementById('profileForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        const resetBtn = document.getElementById('resetProfile');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetProfileForm();
            });
        }
    }

    resetProfileForm() {
        const profile = this.storage.getProfile();
        const nameInput = document.getElementById('userName');
        const taglineInput = document.getElementById('userTagline');

        if (nameInput) nameInput.value = profile.name || '';
        if (taglineInput) taglineInput.value = profile.tagline || '';

        this.showPremiumMessage('Form reset to current profile', 'info');
    }

    saveProfile() {
        const nameInput = document.getElementById('userName');
        const taglineInput = document.getElementById('userTagline');
        const saveBtn = document.getElementById('saveProfile');

        if (!nameInput || !nameInput.value.trim()) {
            this.showPremiumMessage('Please enter your name', 'error');
            nameInput?.focus();
            return;
        }

        const profile = this.storage.getProfile();
        const profileData = {
            name: this.capitalizeFirstLetter(nameInput.value.trim()),
            tagline: taglineInput?.value.trim() || '',
            username: nameInput.value.trim().toLowerCase().replace(/\s+/g, ''),
            image: profile.image || '', // Keep existing image
            updatedAt: new Date().toISOString(),
            joinDate: profile.joinDate || new Date().toISOString()
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
                this.storage.saveProfile(profileData);
                
                // Update displayed profile info
                const profileName = document.getElementById('profileName');
                const profileTagline = document.getElementById('profileTagline');
                const profileUsername = document.querySelector('.profile-username');
                
                if (profileName) profileName.textContent = profileData.name;
                if (profileTagline) {
                    if (profileData.tagline) {
                        profileTagline.textContent = profileData.tagline;
                        profileTagline.style.display = 'block';
                    } else {
                        profileTagline.style.display = 'none';
                    }
                }
                if (profileUsername) {
                    profileUsername.textContent = `@${profileData.username}`;
                }

                // Show success animation
                const profileSection = document.querySelector('.profile-section');
                if (profileSection) {
                    profileSection.classList.add('success-animation');
                    setTimeout(() => {
                        profileSection.classList.remove('success-animation');
                    }, 600);
                }

                this.showPremiumMessage('Profile saved successfully!', 'success');

            } catch (error) {
                console.error('Save profile error:', error);
                this.showPremiumMessage('Failed to save profile', 'error');
            } finally {
                // Restore button state
                if (saveBtn) {
                    saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Save Changes</span>';
                    saveBtn.disabled = false;
                    saveBtn.classList.remove('loading');
                }
            }
        }, 800);
    }

    setupAvatarUpload() {
        setTimeout(() => {
            const editBtn = document.getElementById('editAvatarBtn');
            const avatarInput = document.getElementById('avatarInput');

            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    avatarInput?.click();
                });
            }

            if (avatarInput) {
                avatarInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // Validate file
                    if (!file.type.match('image.*')) {
                        this.showPremiumMessage('Please select an image file (JPEG, PNG, etc.)', 'error');
                        return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                        this.showPremiumMessage('Image must be less than 5MB', 'error');
                        return;
                    }

                    // Read file and open crop modal
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.openCropModal(e.target.result);
                    };
                    reader.onerror = () => {
                        this.showPremiumMessage('Failed to read image file', 'error');
                    };
                    reader.readAsDataURL(file);
                    
                    // Reset file input after selection
                    e.target.value = '';
                });
            }
        }, 100);
    }

    setupCropModal() {
        // Setup crop modal buttons
        setTimeout(() => {
            const closeCropBtn = document.getElementById('closeCropModal');
            const cancelCropBtn = document.getElementById('cancelCrop');
            const applyCropBtn = document.getElementById('applyCrop');
            
            if (closeCropBtn) {
                closeCropBtn.addEventListener('click', () => this.closeCropModal());
            }
            
            if (cancelCropBtn) {
                cancelCropBtn.addEventListener('click', () => this.closeCropModal());
            }
            
            if (applyCropBtn) {
                applyCropBtn.addEventListener('click', () => this.applyCrop());
            }
        }, 100);
    }

    openCropModal(imageSrc) {
        const cropModal = document.getElementById('cropModal');
        const cropImage = document.getElementById('cropImage');

        if (!cropModal || !cropImage) return;

        cropImage.src = imageSrc;
        cropModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Initialize cropper
        setTimeout(() => {
            if (this.cropper) {
                this.cropper.destroy();
            }

            this.cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 0.8,
                responsive: true,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                background: false
            });
        }, 100);
    }

    closeCropModal() {
        const cropModal = document.getElementById('cropModal');
        if (cropModal) {
            cropModal.classList.remove('active');
            document.body.style.overflow = '';

            if (this.cropper) {
                this.cropper.destroy();
                this.cropper = null;
            }

            // Clear file input - THIS IS THE FIX FOR "CHOOSE A FILE" STILL SHOWING
            const avatarInput = document.getElementById('avatarInput');
            if (avatarInput) {
                avatarInput.value = '';
            }
        }
    }

    applyCrop() {
        if (!this.cropper) {
            this.showPremiumMessage('No image to crop', 'error');
            return;
        }

        try {
            // Get cropped image as base64
            const croppedCanvas = this.cropper.getCroppedCanvas({
                width: 400,
                height: 400,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            if (!croppedCanvas) {
                this.showPremiumMessage('Failed to crop image', 'error');
                return;
            }

            const croppedImage = croppedCanvas.toDataURL('image/jpeg', 0.9);
            
            // Update profile image preview IMMEDIATELY
            const profileAvatar = document.getElementById('profileAvatar');
            const profileFallback = document.querySelector('.profile-image-fallback');
            
            if (profileAvatar && profileFallback) {
                console.log('Updating profile image preview');
                
                // Create a new image element to ensure it loads
                const newImage = new Image();
                newImage.onload = () => {
                    console.log('New profile image loaded successfully');
                    profileAvatar.src = croppedImage;
                    profileAvatar.style.display = 'block';
                    profileFallback.style.display = 'none';
                    
                    // Force a reflow and transition
                    profileAvatar.style.opacity = '0';
                    profileAvatar.style.transform = 'scale(0.9)';
                    
                    setTimeout(() => {
                        profileAvatar.style.transition = 'all 0.3s ease';
                        profileAvatar.style.opacity = '1';
                        profileAvatar.style.transform = 'scale(1)';
                    }, 10);
                };
                
                newImage.onerror = () => {
                    console.error('Failed to load new profile image');
                    this.showPremiumMessage('Failed to load profile image', 'error');
                };
                
                newImage.src = croppedImage;
            }

            // Update profile in storage
            const profile = this.storage.getProfile();
            if (profile) {
                profile.image = croppedImage;
                this.storage.saveProfile(profile);
                console.log('Profile image saved to storage');
            }

            // Show success message
            this.showPremiumMessage('Profile picture updated successfully!', 'success');

            // Close crop modal
            this.closeCropModal();

        } catch (error) {
            console.error('Crop error:', error);
            this.showPremiumMessage('Failed to crop image', 'error');
        }
    }

    setupQuickCheckButtons() {
        setTimeout(() => {
            const quickCheckBtns = document.querySelectorAll('.quickcheck-btn');
            quickCheckBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const type = btn.dataset.type;
                    this.handleQuickCheck(type);
                });

                // Add hover animations
                btn.addEventListener('mouseenter', () => {
                    if (!btn.classList.contains('active') && !btn.disabled) {
                        btn.style.transform = 'translateY(-6px)';
                    }
                });

                btn.addEventListener('mouseleave', () => {
                    if (!btn.classList.contains('active') && !btn.disabled) {
                        btn.style.transform = 'translateY(0)';
                    }
                });
            });
        }, 100);
    }

    handleQuickCheck(type) {
        // Disable all quick check buttons
        const quickCheckBtns = document.querySelectorAll('.quickcheck-btn');
        quickCheckBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.style.transform = 'translateY(0)';
        });

        // Activate selected button
        const selectedBtn = document.querySelector(`.quickcheck-btn[data-type="${type}"]`);
        if (selectedBtn) {
            selectedBtn.disabled = false;
            selectedBtn.classList.add('active');
            selectedBtn.style.opacity = '1';
            selectedBtn.style.cursor = 'default';
            selectedBtn.style.transform = 'translateY(-4px)';
        }

        this.selectedQuickCheck = type;
        
        // Load and show data
        setTimeout(() => {
            this.loadQuickCheckData(type);
            this.showQuickCheckPopup(type);
        }, 300);
    }

    loadQuickCheckData(type) {
        let data = [];
        let title = '';

        switch (type) {
            case 'items':
                data = this.storage.getItems();
                title = 'All Items';
                break;
            case 'categories':
                const categories = this.storage.getCategories();
                data = categories.map(category => ({
                    title: category,
                    description: `${this.storage.getItems(category).length} items`
                }));
                title = 'All Categories';
                break;
            case 'favorites':
                data = this.storage.getFavorites();
                title = 'Favorite Items';
                break;
            case 'completed':
                const allItems = this.storage.getItems();
                data = allItems.filter(item => item.isCompleted);
                title = 'Completed Items';
                break;
        }

        const popupContent = document.getElementById('quickcheckContent');
        const popupTitle = document.getElementById('quickcheckTitle');

        if (popupTitle) {
            popupTitle.innerHTML = `<i class="fas fa-${this.getIconForType(type)}"></i> ${title}`;
        }

        if (popupContent) {
            if (data.length === 0) {
                popupContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-${this.getIconForType(type)}"></i>
                        <h4>No ${type} found</h4>
                        <p>${this.getEmptyMessageForType(type)}</p>
                    </div>
                `;
            } else {
                popupContent.innerHTML = `
                    <div class="quickcheck-items">
                        ${data.map((item, index) => this.getQuickCheckItemHTML(item, type, index)).join('')}
                    </div>
                `;
            }
        }
    }

    getQuickCheckItemHTML(item, type, index) {
        if (type === 'categories') {
            return `
                <div class="quickcheck-item" style="animation-delay: ${index * 50}ms">
                    <div class="quickcheck-item-header">
                        <div class="quickcheck-item-title">${item.title}</div>
                    </div>
                    <div class="quickcheck-item-description">${item.description}</div>
                </div>
            `;
        }

        return `
            <div class="quickcheck-item" style="animation-delay: ${index * 50}ms">
                <div class="quickcheck-item-header">
                    <div class="quickcheck-item-title">${item.title}</div>
                    <span class="quickcheck-item-category">${item.category}</span>
                </div>
                ${item.description ? `<div class="quickcheck-item-description">${item.description}</div>` : ''}
                <div class="quickcheck-item-meta">
                    ${item.progress ? `<span class="quickcheck-item-progress">${item.progress}</span>` : ''}
                    <div class="quickcheck-item-status">
                        ${item.isFavorite ? '<i class="fas fa-star"></i>' : ''}
                        ${item.isCompleted ? '<i class="fas fa-check-circle"></i>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getIconForType(type) {
        const icons = {
            'items': 'list',
            'categories': 'layer-group',
            'favorites': 'star',
            'completed': 'check-circle'
        };
        return icons[type] || 'list';
    }

    getEmptyMessageForType(type) {
        const messages = {
            'items': 'No items have been added yet.',
            'categories': 'No categories have been created yet.',
            'favorites': 'No items have been marked as favorites.',
            'completed': 'No items have been marked as completed.'
        };
        return messages[type] || 'No data available.';
    }

    showQuickCheckPopup(type) {
        const popup = document.getElementById('quickcheckPopup');
        if (popup) {
            popup.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // FIX: Setup close button event listener
            const closeBtn = document.getElementById('closeQuickcheckPopup');
            if (closeBtn) {
                // Remove existing listeners to avoid duplicates
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                
                // Add new listener
                newCloseBtn.addEventListener('click', () => {
                    this.closeQuickCheckPopup();
                });
            }
        }
    }

    closeQuickCheckPopup() {
        const popup = document.getElementById('quickcheckPopup');
        if (popup) {
            popup.classList.remove('active');
            document.body.style.overflow = '';

            // Re-enable all quick check buttons
            const quickCheckBtns = document.querySelectorAll('.quickcheck-btn');
            quickCheckBtns.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('active');
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.style.transform = 'translateY(0)';
            });

            this.selectedQuickCheck = null;
        }
    }

    setupQuickActions() {
        setTimeout(() => {
            const quickActionBtns = document.querySelectorAll('.quick-action-btn');
            quickActionBtns.forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-6px)';
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0)';
                });

                btn.addEventListener('mousedown', () => {
                    btn.style.transform = 'translateY(-3px) scale(0.98)';
                });

                btn.addEventListener('mouseup', () => {
                    btn.style.transform = 'translateY(-6px)';
                });
            });
        }, 100);
    }

    setupWorkoutTracker() {
        setTimeout(() => {
            console.log('Setting up workout tracker...');
            
            // FIX: Add Workout Button with proper event delegation
            document.addEventListener('click', (e) => {
                if (e.target.closest('#addWorkoutBtn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Add Workout button clicked');
                    this.openAddWorkoutModal();
                }
            });

            // Setup workout modal event listeners
            this.setupWorkoutModal();

            // Setup workout item button event listeners
            this.setupWorkoutItemButtons();
        }, 500);
    }

    setupWorkoutModal() {
        setTimeout(() => {
            console.log('Setting up workout modal listeners...');
            
            // Use event delegation for modal buttons
            document.addEventListener('click', (e) => {
                // Close workout modal
                if (e.target.closest('#closeWorkoutModal') || e.target.closest('#closeWorkoutForm')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeWorkoutModal();
                }
                
                // Reset workout form
                if (e.target.closest('#resetWorkoutForm')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.resetWorkoutForm();
                }
            });
            
            // Submit form handler
            const workoutForm = document.getElementById('workoutForm');
            if (workoutForm) {
                workoutForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.saveOrUpdateWorkout();
                });
            }
        }, 100);
    }

        setupWorkoutItemButtons() {
        // Delegate event handling for dynamic workout items
        setTimeout(() => {
            console.log('Setting up workout item buttons...');
            
            // Handle Update button clicks
            document.addEventListener('click', (e) => {
                const updateBtn = e.target.closest('.workout-action-btn.update');
                if (updateBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const workoutId = updateBtn.getAttribute('data-id');
                    console.log('Update button clicked for workout:', workoutId);
                    if (workoutId) {
                        this.openUpdateWorkoutModal(workoutId);
                    }
                }
            });

            // FIXED: Handle Delete button clicks with better event delegation
            document.addEventListener('click', (e) => {
                // Check if click is on delete button or its child elements
                const deleteBtn = e.target.closest('.workout-action-btn.delete');
                if (deleteBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const workoutId = deleteBtn.getAttribute('data-id');
                    console.log('Delete button clicked for workout:', workoutId);
                    if (workoutId) {
                        // Get the workout item to confirm it exists
                        const workoutItem = document.querySelector(`.workout-item[data-id="${workoutId}"]`);
                        if (workoutItem) {
                            console.log('Workout item found, proceeding with delete');
                            this.deleteWorkout(workoutId);
                        } else {
                            console.error('Workout item not found for ID:', workoutId);
                            this.showPremiumMessage('Workout not found', 'error');
                        }
                    }
                }
            });
        }, 300);
    }

    openAddWorkoutModal() {
        this.currentWorkoutEditId = null;
        
        const modal = document.getElementById('workoutModal');
        const title = document.getElementById('workoutModalTitle');
        const saveBtn = document.getElementById('saveWorkoutBtn');
        
        if (modal && title && saveBtn) {
            title.innerHTML = '<i class="fas fa-dumbbell"></i> Add Workout';
            saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Save</span>';
            
            // Reset form
            this.resetWorkoutForm();
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on first input
            setTimeout(() => {
                const nameInput = document.getElementById('workoutName');
                if (nameInput) nameInput.focus();
            }, 100);
        }
    }

    openUpdateWorkoutModal(workoutId) {
        this.currentWorkoutEditId = workoutId;
        
        const workouts = this.getWorkouts();
        const workout = workouts.find(w => w.id === workoutId);
        
        if (!workout) {
            this.showPremiumMessage('Workout not found', 'error');
            return;
        }

        const modal = document.getElementById('workoutModal');
        const title = document.getElementById('workoutModalTitle');
        const saveBtn = document.getElementById('saveWorkoutBtn');
        const nameInput = document.getElementById('workoutName');
        const setsInput = document.getElementById('workoutSets');
        const repsInput = document.getElementById('workoutReps');
        const bestInput = document.getElementById('workoutBest');
        
        if (modal && title && saveBtn && nameInput && setsInput && repsInput && bestInput) {
            title.innerHTML = '<i class="fas fa-dumbbell"></i> Update Workout';
            saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Update</span>';
            
            // Fill form with workout data
            nameInput.value = workout.name;
            setsInput.value = workout.sets || '';
            repsInput.value = workout.reps || '';
            bestInput.value = workout.best || '';
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on first input
            setTimeout(() => {
                nameInput.focus();
            }, 100);
        }
    }

    closeWorkoutModal() {
        const modal = document.getElementById('workoutModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            this.currentWorkoutEditId = null;
        }
    }

    resetWorkoutForm() {
        const nameInput = document.getElementById('workoutName');
        const setsInput = document.getElementById('workoutSets');
        const repsInput = document.getElementById('workoutReps');
        const bestInput = document.getElementById('workoutBest');
        
        if (nameInput) nameInput.value = '';
        if (setsInput) setsInput.value = '';
        if (repsInput) repsInput.value = '';
        if (bestInput) bestInput.value = '';
    }

    saveOrUpdateWorkout() {
        const nameInput = document.getElementById('workoutName');
        const setsInput = document.getElementById('workoutSets');
        const repsInput = document.getElementById('workoutReps');
        const bestInput = document.getElementById('workoutBest');
        const saveBtn = document.getElementById('saveWorkoutBtn');

        if (!nameInput || !nameInput.value.trim()) {
            this.showPremiumMessage('Please enter workout/exercise name', 'error');
            nameInput?.focus();
            return;
        }

        const workoutData = {
            id: this.currentWorkoutEditId || (Date.now().toString() + Math.random().toString(36).substr(2, 9)),
            name: nameInput.value.trim(),
            sets: setsInput?.value.trim() || '',
            reps: repsInput?.value.trim() || '',
            best: bestInput?.value.trim() || '',
            date: new Date().toISOString()
        };

        // Show loading state
        if (saveBtn) {
            const originalHTML = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';
            saveBtn.disabled = true;
        }

        // Save/Update with animation delay
        setTimeout(() => {
            try {
                if (this.currentWorkoutEditId) {
                    // Update existing workout
                    const success = this.updateWorkoutInStorage(workoutData);
                    if (success) {
                        this.showPremiumMessage('Workout updated successfully!', 'success');
                    } else {
                        throw new Error('Failed to update workout');
                    }
                } else {
                    // Save new workout
                    this.saveWorkoutToStorage(workoutData);
                    this.showPremiumMessage('Workout saved successfully!', 'success');
                }
                
                // Close modal
                this.closeWorkoutModal();
                
                // Reload workout history
                this.loadWorkoutHistory();

            } catch (error) {
                console.error('Save/Update workout error:', error);
                this.showPremiumMessage('Failed to save workout', 'error');
            } finally {
                // Restore button state
                if (saveBtn) {
                    saveBtn.innerHTML = this.currentWorkoutEditId ? 
                        '<i class="fas fa-save"></i><span>Update</span>' : 
                        '<i class="fas fa-save"></i><span>Save</span>';
                    saveBtn.disabled = false;
                }
            }
        }, 800);
    }

            deleteWorkout(workoutId) {
        console.log('Attempting to delete workout:', workoutId);
        
        // Simple confirmation using browser's confirm dialog
        if (confirm('Are you sure you want to remove this workout?')) {
            this.performDeleteWorkout(workoutId);
        }
    }

        performDeleteWorkout(workoutId) {
        console.log('Performing delete for workout:', workoutId);
        
        try {
            const success = this.deleteWorkoutFromStorage(workoutId);
            
            if (!success) {
                throw new Error('Failed to delete workout from storage');
            }
            
            // Find and remove workout item with animation
            const workoutItem = document.querySelector(`.workout-item[data-id="${workoutId}"]`);
            if (workoutItem) {
                console.log('Removing workout item from DOM');
                workoutItem.style.transition = 'all 0.3s ease';
                workoutItem.style.transform = 'translateY(-20px)';
                workoutItem.style.opacity = '0';
                
                setTimeout(() => {
                    if (workoutItem.parentNode) {
                        workoutItem.parentNode.removeChild(workoutItem);
                        
                        // Check if any workouts left
                        const remainingItems = document.querySelectorAll('.workout-item');
                        const workoutHistoryItems = document.getElementById('workoutHistoryItems');
                        
                        if (remainingItems.length === 0 && workoutHistoryItems) {
                            console.log('No workouts left, showing empty state');
                            workoutHistoryItems.innerHTML = `
                                <div class="empty-state">
                                    <i class="fas fa-dumbbell"></i>
                                    <p>No workouts saved yet. Click "Add Workout" to add your first workout!</p>
                                </div>
                            `;
                        }
                        
                        this.showPremiumMessage('Workout removed successfully', 'success');
                    }
                }, 300);
            } else {
                // If DOM element not found, reload the list
                console.log('Workout item not found in DOM, reloading workout history');
                this.loadWorkoutHistory();
                this.showPremiumMessage('Workout removed successfully', 'success');
            }
            
        } catch (error) {
            console.error('Delete workout error:', error);
            this.showPremiumMessage('Failed to remove workout: ' + error.message, 'error');
        }
    }

    loadWorkoutHistory() {
        const workoutHistoryItems = document.getElementById('workoutHistoryItems');
        if (!workoutHistoryItems) return;

        const workouts = this.getWorkouts();
        
        if (workouts.length === 0) {
            workoutHistoryItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-dumbbell"></i>
                    <p>No workouts saved yet. Click "Add Workout" to add your first workout!</p>
                </div>
            `;
            return;
        }

        workoutHistoryItems.innerHTML = workouts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(workout => this.getWorkoutItemHTML(workout))
            .join('');
    }

    // Storage methods for workouts
    getWorkouts() {
        const data = this.storage.getData();
        return data.workouts || [];
    }

    saveWorkoutToStorage(workoutData) {
        const data = this.storage.getData();
        if (!data.workouts) data.workouts = [];
        data.workouts.push(workoutData);
        this.storage.setData(data);
        return true;
    }

    updateWorkoutInStorage(workoutData) {
        const data = this.storage.getData();
        if (!data.workouts) data.workouts = [];
        
        const index = data.workouts.findIndex(w => w.id === workoutData.id);
        if (index !== -1) {
            data.workouts[index] = workoutData;
            this.storage.setData(data);
            return true;
        }
        return false;
    }

        deleteWorkoutFromStorage(workoutId) {
        console.log('Deleting workout from storage:', workoutId);
        
        try {
            const data = this.storage.getData();
            if (!data.workouts) {
                data.workouts = [];
            }
            
            const initialLength = data.workouts.length;
            console.log('Initial workouts count:', initialLength);
            
            // Filter out the workout to delete
            data.workouts = data.workouts.filter(w => {
                if (w.id === workoutId) {
                    console.log('Found workout to delete:', w.name);
                    return false;
                }
                return true;
            });
            
            const newLength = data.workouts.length;
            console.log('New workouts count:', newLength);
            
            if (newLength < initialLength) {
                // Workout was removed
                this.storage.setData(data);
                console.log('Workout successfully removed from storage');
                return true;
            } else {
                // Workout was not found
                console.log('Workout not found in storage, nothing to delete');
                return false;
            }
        } catch (error) {
            console.error('Error in deleteWorkoutFromStorage:', error);
            return false;
        }
    }

    // Confirmation Modal Methods
        showConfirmationModal(title, message, confirmCallback) {
        console.log('showConfirmationModal called with:', title, message);
        
        const modal = document.getElementById('confirmModalPremium');
        const titleElement = document.getElementById('confirmModalTitle');
        const messageElement = document.getElementById('confirmModalMessage');
        
        if (modal && titleElement && messageElement) {
            titleElement.textContent = title;
            messageElement.textContent = message;
            this.confirmCallback = confirmCallback;
            modal.classList.add('active');
            console.log('Premium confirmation modal shown');
        } else {
            console.error('Confirmation modal elements not found!');
            // Fallback to browser confirm
            if (confirm(`${title}: ${message}`)) {
                confirmCallback();
            }
        }
    }
    
    closeConfirmationModal() {
        const modal = document.getElementById('confirmModalPremium');
        if (modal) {
            modal.classList.remove('active');
            this.confirmCallback = null;
        }
    }

    showPremiumMessage(message, type = 'info') {
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

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Initialize profile page when DOM is loaded
let profilePage;
document.addEventListener('DOMContentLoaded', () => {
    // Initialize confirmation modal
    const confirmModal = document.getElementById('confirmModalPremium');
    const confirmCancelBtn = document.getElementById('confirmModalCancel');
    const confirmConfirmBtn = document.getElementById('confirmModalConfirm');

    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', () => {
            if (confirmModal) confirmModal.classList.remove('active');
        });
    }

    if (confirmConfirmBtn) {
        confirmConfirmBtn.addEventListener('click', () => {
            if (profilePage && profilePage.confirmCallback) {
                profilePage.confirmCallback();
            }
            if (confirmModal) confirmModal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                confirmModal.classList.remove('active');
            }
        });
    }

    // Initialize the profile page
    profilePage = new ProfilePage();
    window.profilePage = profilePage; // Make accessible globally
});