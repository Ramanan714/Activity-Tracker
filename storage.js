// Data Storage Management
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'activity_tracker_data';
        this.defaultData = {
            profile: null,
            categories: [],
            items: [],
            settings: {
                theme: 'system'
            }
        };
    }

    // Initialize or get data
    getData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
            this.setData(this.defaultData);
            return this.defaultData;
        }
        return JSON.parse(data);
    }

    // Save data to localStorage
    setData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }

    // Get all categories
    getCategories() {
        const data = this.getData();
        return data.categories || [];
    }

    // Add a new category
    addCategory(categoryName) {
        const data = this.getData();
        const formattedName = this.formatName(categoryName);
        
        // Check if category already exists
        if (!data.categories.includes(formattedName)) {
            data.categories.push(formattedName);
            this.setData(data);
        }
        return formattedName;
    }

    // Remove a category and all its items
    removeCategory(categoryName) {
        const data = this.getData();
        
        // Remove category from categories list
        data.categories = data.categories.filter(cat => cat !== categoryName);
        
        // Remove all items in this category
        data.items = data.items.filter(item => item.category !== categoryName);
        
        this.setData(data);
        return true;
    }

    // Get all items
    getItems(filterCategory = null) {
        const data = this.getData();
        let items = data.items || [];
        
        if (filterCategory) {
            items = items.filter(item => item.category === filterCategory);
        }
        
        return items.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    // Add a new item
    addItem(itemData) {
        const data = this.getData();
        
        const newItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            category: this.formatName(itemData.category),
            title: this.formatName(itemData.title),
            description: itemData.description || '',
            progress: itemData.progress || '',
            isFavorite: itemData.isFavorite || false,
            isCompleted: itemData.isCompleted || false,
            dateAdded: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        // Ensure category exists
        if (!data.categories.includes(newItem.category)) {
            data.categories.push(newItem.category);
        }

        data.items.push(newItem);
        this.setData(data);
        return newItem;
    }

    // Update an item
    updateItem(itemId, updates) {
        const data = this.getData();
        const itemIndex = data.items.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) return false;

        // Update item
        if (updates.title) updates.title = this.formatName(updates.title);
        if (updates.category) updates.category = this.formatName(updates.category);
        
        data.items[itemIndex] = {
            ...data.items[itemIndex],
            ...updates,
            lastUpdated: new Date().toISOString()
        };

        this.setData(data);
        return true;
    }

    // Remove an item
    removeItem(itemId) {
        const data = this.getData();
        const initialLength = data.items.length;
        data.items = data.items.filter(item => item.id !== itemId);
        
        if (data.items.length < initialLength) {
            this.setData(data);
            return true;
        }
        return false;
    }

    // Get favorite items
    getFavorites() {
        const data = this.getData();
        return data.items.filter(item => item.isFavorite);
    }

    // Get profile data
        getProfile() {
        const data = this.getData();
        if (!data.profile) {
            data.profile = { // Create default profile
                name: '',
                username: '',
                tagline: '',
                image: '',
                joinDate: new Date().toISOString()
            };
            this.setData(data);
        }
        return data.profile;
    }

    // Save profile data
    saveProfile(profileData) {
        const data = this.getData();
        data.profile = profileData;
        this.setData(data);
        return true;
    }

    // Get statistics
    getStats() {
        const data = this.getData();
        const items = data.items || [];
        
        return {
            totalItems: items.length,
            totalCategories: data.categories.length,
            totalFavorites: items.filter(item => item.isFavorite).length,
            totalCompleted: items.filter(item => item.isCompleted).length
        };
    }

    // Backup data as JSON
   // In StorageManager class - update exportData method:
exportData() {
    try {
        const data = this.getData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log('Export successful!');
        return true;
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export data. Please try again.');
        return false;
    }
}

    // Update storage.js - Fix importData method

importData(jsonString) {
    try {
        console.log('Importing data...');
        
        // Parse the JSON
        const importedData = JSON.parse(jsonString);
        console.log('Parsed data:', importedData);
        
        // Validate data structure
        if (!importedData || typeof importedData !== 'object') {
            throw new Error('Invalid data format: Not an object');
        }
        
        // Check for required structure but be lenient
        if (!importedData.categories) importedData.categories = [];
        if (!importedData.items) importedData.items = [];
        if (!importedData.settings) importedData.settings = { theme: 'system' };
        if (!importedData.profile) importedData.profile = null;
        
        // Validate arrays
        if (!Array.isArray(importedData.categories)) {
            throw new Error('Invalid data format: categories is not an array');
        }
        if (!Array.isArray(importedData.items)) {
            throw new Error('Invalid data format: items is not an array');
        }
        
        console.log('Data validated successfully');
        
        // Save the data
        this.setData(importedData);
        
        console.log('Import successful!');
        return true;
    } catch (error) {
        console.error('Import failed:', error);
        alert(`Import failed: ${error.message}. Please check the file format.`);
        return false;
    }
}

    // Format name (capitalize first letter)
    formatName(name) {
        if (!name) return '';
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    // Search items
    searchItems(query) {
        const data = this.getData();
        const searchTerm = query.toLowerCase();
        
        return data.items.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.progress.toLowerCase().includes(searchTerm)
        );
    }

    // Sort items
    sortItems(items, sortBy = 'newest') {
        const sortedItems = [...items];
        
        switch (sortBy) {
            case 'favorites':
                return sortedItems.sort((a, b) => {
                    if (a.isFavorite && !b.isFavorite) return -1;
                    if (!a.isFavorite && b.isFavorite) return 1;
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                });
                
            case 'alphabetical':
                return sortedItems.sort((a, b) => a.title.localeCompare(b.title));
                
            case 'oldest':
                return sortedItems.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                
            case 'newest':
            default:
                return sortedItems.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        }
    }
    // (Add these methods after existing methods)

// Get item by ID
getItemById(itemId) {
    const data = this.getData();
    return data.items.find(item => item.id === itemId) || null;
}

// Full item update method
updateItemFull(itemId, itemData) {
    const data = this.getData();
    const itemIndex = data.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return false;

    // Format names
    const formattedTitle = this.formatName(itemData.title);
    const formattedCategory = this.formatName(itemData.category);

    // Update item
    data.items[itemIndex] = {
        ...data.items[itemIndex],
        category: formattedCategory,
        title: formattedTitle,
        description: itemData.description || '',
        progress: itemData.progress || '',
        isFavorite: itemData.isFavorite || false,
        isCompleted: itemData.isCompleted || false,
        lastUpdated: new Date().toISOString()
    };

    // Ensure category exists
    if (!data.categories.includes(formattedCategory)) {
        data.categories.push(formattedCategory);
    }

    this.setData(data);
    return true;
}
// Add to storage.js - After existing methods in StorageManager class

// Check if these methods exist in your storage.js - they should be in the StorageManager class:

// Get workout data
getWorkouts() {
    const data = this.getData();
    return data.workouts || [];
}

// Save workout
saveWorkout(workoutData) {
    const data = this.getData();
    if (!data.workouts) data.workouts = [];
    data.workouts.push(workoutData);
    this.setData(data);
    return true;
}

// Update workout
updateWorkout(workoutId, workoutData) {
    const data = this.getData();
    if (!data.workouts) return false;
    
    const index = data.workouts.findIndex(w => w.id === workoutId);
    if (index !== -1) {
        data.workouts[index] = workoutData;
        this.setData(data);
        return true;
    }
    return false;
}

// Delete workout
deleteWorkout(workoutId) {
    const data = this.getData();
    if (!data.workouts) return false;
    
    const initialLength = data.workouts.length;
    data.workouts = data.workouts.filter(w => w.id !== workoutId);
    
    if (data.workouts.length < initialLength) {
        this.setData(data);
        return true;
    }
    return false;
}
// Add to StorageManager class in storage.js:

// Get wishlist items
getWishlist() {
    const data = this.getData();
    return data.wishlist || [];
}

// Add wishlist item
addWishlistItem(itemData) {
    const data = this.getData();
    if (!data.wishlist) data.wishlist = [];
    
    const newItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    data.wishlist.push(newItem);
    this.setData(data);
    return newItem;
}

// Update wishlist item
updateWishlistItem(itemId, updates) {
    const data = this.getData();
    if (!data.wishlist) return false;
    
    const index = data.wishlist.findIndex(item => item.id === itemId);
    if (index === -1) return false;
    
    data.wishlist[index] = {
        ...data.wishlist[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    this.setData(data);
    return true;
}

// Remove wishlist item
removeWishlistItem(itemId) {
    const data = this.getData();
    if (!data.wishlist) return false;
    
    const initialLength = data.wishlist.length;
    data.wishlist = data.wishlist.filter(item => item.id !== itemId);
    
    if (data.wishlist.length < initialLength) {
        this.setData(data);
        return true;
    }
    return false;
}
}

// Create global instance
const storage = new StorageManager();
