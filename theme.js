// Update theme.js - Complete rewrite for global theme
class ThemeManager {
    constructor() {
        this.themeKey = 'activity_tracker_theme';
        this.init();
    }

    // Initialize theme
    init() {
        const savedTheme = localStorage.getItem(this.themeKey) || 'system';
        this.applyTheme(savedTheme);
        
        // Update theme select if exists
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = savedTheme;
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    }

    // Apply theme globally
    applyTheme(theme) {
        localStorage.setItem(this.themeKey, theme);
        
        // Apply theme to all pages
        if (theme === 'system') {
            this.applySystemTheme();
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        // Watch for system theme changes if in system mode
        if (theme === 'system') {
            this.watchSystemTheme();
        }
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
    }

    // Apply system theme
    applySystemTheme() {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    // Get current theme
    getTheme() {
        return localStorage.getItem(this.themeKey) || 'system';
    }

    // Watch for system theme changes
    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            if (this.getTheme() === 'system') {
                this.applySystemTheme();
            }
        };
        
        // Remove existing listener if any
        if (this.systemThemeListener) {
            mediaQuery.removeEventListener('change', this.systemThemeListener);
        }
        
        this.systemThemeListener = handleChange;
        mediaQuery.addEventListener('change', this.systemThemeListener);
    }

    // Force theme on page load
    forceThemeOnLoad() {
        const theme = this.getTheme();
        if (theme === 'system') {
            this.applySystemTheme();
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }
}

// Create global instance
const themeManager = new ThemeManager();

// Force theme on page load for all pages
themeManager.forceThemeOnLoad();

// Also watch for system theme changes on all pages
themeManager.watchSystemTheme();