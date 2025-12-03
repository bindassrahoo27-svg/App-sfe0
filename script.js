// GitHub Data URLs - Replace with your actual GitHub URLs
const DATA_URLS = {
    namaz: 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/namaz.json',
    duas: 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/duas.json'
};

// Global Variables
let appData = {
    namaz: {},
    duas: {},
    settings: {
        theme: 'dark',
        fontSize: 'medium',
        prayerReminders: true,
        duaReminders: false,
        vibration: true,
        sound: false,
        dailyGoal: 100
    },
    tasbeeh: {
        count: 0,
        currentDhikr: null,
        history: []
    },
    favorites: []
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    showLoading(true);
    
    try {
        // Load saved data
        loadSavedData();
        
        // Load remote data
        await loadRemoteData();
        
        // Setup UI
        setupUI();
        
        // Setup event listeners
        setupEventListeners();
        
        // Set default tab
        switchTab('home');
        
        // Update prayer times
        updatePrayerTimes();
        
        // Show daily dua
        showDailyDua();
        
        showLoading(false);
        
        // Show welcome message
        setTimeout(() => {
            showToast('Welcome to Islamic Guide! 🕌');
        }, 1000);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showLoading(false);
        showToast('Error loading data. Using offline mode.', 'error');
    }
}

// Load saved data from localStorage
function loadSavedData() {
    const savedData = localStorage.getItem('islamicGuideData');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        appData = { ...appData, ...parsed };
    }
    
    // Apply saved settings
    applySettings();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('islamicGuideData', JSON.stringify(appData));
}

// Load remote data from GitHub
async function loadRemoteData() {
    try {
        // Load prayer data
        const namazResponse = await fetch(DATA_URLS.namaz);
        appData.namaz = await namazResponse.json();
        
        // Load dua data
        const duasResponse = await fetch(DATA_URLS.duas);
        appData.duas = await duasResponse.json();
        
    } catch (error) {
        console.warn('Using fallback data:', error);
        // Use fallback data if fetch fails
        appData.namaz = getFallbackNamazData();
        appData.duas = getFallbackDuaData();
    }
}

// Setup UI components
function setupUI() {
    // Render prayer types
    renderPrayerTypes();
    
    // Render dua categories
    renderDuaCategories();
    
    // Render tasbeeh counter
    updateTasbeehDisplay();
    
    // Setup theme toggle
    setupThemeToggle();
    
    // Setup sidebar
    setupSidebar();
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', openSidebar);
    
    // Close sidebar
    document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
    
    // Close modal on outside click
    document.getElementById('duaModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Setup vibration toggle
    const vibrationToggle = document.getElementById('vibrationToggle');
    vibrationToggle.checked = appData.settings.vibration;
    vibrationToggle.addEventListener('change', function() {
        appData.settings.vibration = this.checked;
        saveData();
    });
    
    // Setup sound toggle
    const soundToggle = document.getElementById('soundToggle');
    soundToggle.checked = appData.settings.sound;
    soundToggle.addEventListener('change', function() {
        appData.settings.sound = this.checked;
        saveData();
    });
    
    // Setup daily goal input
    const dailyGoal = document.getElementById('dailyGoal');
    dailyGoal.value = appData.settings.dailyGoal;
    dailyGoal.addEventListener('change', function() {
        appData.settings.dailyGoal = parseInt(this.value) || 100;
        saveData();
        updateProgress();
    });
    
    // Setup prayer reminders toggle
    const prayerReminders = document.getElementById('prayerReminders');
    prayerReminders.checked = appData.settings.prayerReminders;
    prayerReminders.addEventListener('change', function() {
        appData.settings.prayerReminders = this.checked;
        saveData();
        if (this.checked) {
            requestNotificationPermission();
        }
    });
    
    // Setup dua reminders toggle
    const duaReminders = document.getElementById('duaReminders');
    duaReminders.checked = appData.settings.duaReminders;
    duaReminders.addEventListener('change', function() {
        appData.settings.duaReminders = this.checked;
        saveData();
    });
    
    // Theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Switch between tabs
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked tab
    const tabButtons = document.querySelectorAll(`.tab[onclick*="${tabName}"]`);
    if (tabButtons.length > 0) {
        tabButtons[0].classList.add('active');
    }
    
    // Special actions for specific tabs
    switch(tabName) {
        case 'namaz':
            renderPrayerSteps();
            break;
        case 'dua':
            renderAllDuas();
            break;
    }
    
    // Close sidebar if open
    closeSidebar();
}

// Render prayer types
function renderPrayerTypes() {
    const container = document.getElementById('prayerTypes');
    if (!appData.namaz.types) return;
    
    let html = '';
    appData.namaz.types.forEach(prayer => {
        html += `
            <div class="prayer-card" onclick="showPrayerGuide('${prayer.id}')">
                <div class="icon">
                    <i class="${prayer.icon || 'fas fa-clock'}"></i>
                </div>
                <h3>${prayer.name}</h3>
                <div class="info">
                    <span><i class="fas fa-clock"></i> ${prayer.time}</span>
                    <span><i class="fas fa-layer-group"></i> ${prayer.rakats}</span>
                </div>
                <p class="description">${prayer.description}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Show prayer guide
function showPrayerGuide(prayerId) {
    const prayer = appData.namaz.types.find(p => p.id === prayerId);
    if (!prayer) return;
    
    const steps = appData.namaz.steps[prayerId];
    if (!steps) return;
    
    // Create modal content
    const modal = document.getElementById('duaModal');
    const title = document.getElementById('duaModalTitle');
    const body = document.getElementById('duaModalBody');
    
    title.textContent = `How to Pray ${prayer.name}`;
    
    let html = `
        <div class="modal-prayer-info">
            <div class="info-grid">
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <div>
                        <label>Time</label>
                        <span>${prayer.time}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-layer-group"></i>
                    <div>
                        <label>Rakats</label>
                        <span>${prayer.rakats}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-volume-up"></i>
                    <div>
                        <label>Audible</label>
                        <span>${prayer.audible ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    html += '<div class="modal-dua-content">';
    steps.forEach((step, index) => {
        html += `
            <div class="modal-section">
                <h4>Step ${index + 1}: ${step.title}</h4>
                ${step.arabic ? `<div class="arabic">${step.arabic}</div>` : ''}
                ${step.roman ? `<div class="roman">${step.roman}</div>` : ''}
                <div class="translation">${step.description}</div>
                ${step.notes ? `<div class="notes"><strong>Note:</strong> ${step.notes}</div>` : ''}
            </div>
        `;
    });
    html += '</div>';
    
    body.innerHTML = html;
    modal.classList.add('active');
}

// Render dua categories
function renderDuaCategories() {
    const container = document.getElementById('duasContainer');
    renderAllDuas();
}

// Render all duas
function renderAllDuas() {
    const container = document.getElementById('duasContainer');
    if (!appData.duas.categories) return;
    
    let html = '';
    appData.duas.categories.forEach(category => {
        category.duas.forEach(dua => {
            html += `
                <div class="dua-card" onclick="showDuaDetail('${category.id}', '${dua.id}')">
                    <span class="dua-category">${category.name}</span>
                    <h3>${dua.title}</h3>
                    <div class="arabic">${dua.arabic}</div>
                    <div class="roman">${dua.roman}</div>
                    <div class="translation">${dua.translation.substring(0, 100)}...</div>
                    <div class="dua-card-footer">
                        <span class="reference">${dua.reference || 'Authentic'}</span>
                        <div class="dua-actions">
                            <button class="dua-action-btn" onclick="event.stopPropagation(); favoriteDua('${category.id}', '${dua.id}')">
                                <i class="${isDuaFavorite(category.id, dua.id) ? 'fas' : 'far'} fa-heart"></i>
                            </button>
                            <button class="dua-action-btn" onclick="event.stopPropagation(); shareDua('${category.id}', '${dua.id}')">
                                <i class="fas fa-share"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    });
    
    container.innerHTML = html;
}

// Show dua detail
function showDuaDetail(categoryId, duaId) {
    const category = appData.duas.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const dua = category.duas.find(d => d.id === duaId);
    if (!dua) return;
    
    const modal = document.getElementById('duaModal');
    const title = document.getElementById('duaModalTitle');
    const body = document.getElementById('duaModalBody');
    
    title.textContent = dua.title;
    
    let html = '<div class="modal-dua-content">';
    
    // Arabic text
    if (dua.arabic) {
        html += `
            <div class="modal-section">
                <h4>Arabic</h4>
                <div class="arabic">${dua.arabic}</div>
            </div>
        `;
    }
    
    // Roman transliteration
    if (dua.roman) {
        html += `
            <div class="modal-section">
                <h4>Transliteration</h4>
                <div class="roman">${dua.roman}</div>
            </div>
        `;
    }
    
    // Translation
    if (dua.translation) {
        html += `
            <div class="modal-section">
                <h4>Translation</h4>
                <div class="translation">${dua.translation}</div>
            </div>
        `;
    }
    
    // Reference
    if (dua.reference) {
        html += `
            <div class="modal-section">
                <h4>Reference</h4>
                <div class="translation">${dua.reference}</div>
            </div>
        `;
    }
    
    // Benefits
    if (dua.benefits) {
        html += `
            <div class="modal-section">
                <h4>Benefits</h4>
                <div class="translation">${dua.benefits}</div>
            </div>
        `;
    }
    
    html += '</div>';
    
    body.innerHTML = html;
    modal.classList.add('active');
    
    // Store current dua for sharing/favoriting
    modal.dataset.categoryId = categoryId;
    modal.dataset.duaId = duaId;
}

// Search duas
function searchDuas() {
    const searchTerm = document.getElementById('duaSearch').value.toLowerCase();
    const container = document.getElementById('duasContainer');
    
    if (!searchTerm) {
        renderAllDuas();
        return;
    }
    
    let html = '';
    appData.duas.categories.forEach(category => {
        category.duas.forEach(dua => {
            if (dua.title.toLowerCase().includes(searchTerm) ||
                dua.arabic.toLowerCase().includes(searchTerm) ||
                dua.roman.toLowerCase().includes(searchTerm) ||
                dua.translation.toLowerCase().includes(searchTerm)) {
                
                html += `
                    <div class="dua-card" onclick="showDuaDetail('${category.id}', '${dua.id}')">
                        <span class="dua-category">${category.name}</span>
                        <h3>${dua.title}</h3>
                        <div class="arabic">${dua.arabic}</div>
                        <div class="roman">${dua.roman}</div>
                        <div class="translation">${dua.translation.substring(0, 100)}...</div>
                        <div class="dua-card-footer">
                            <span class="reference">${dua.reference || 'Authentic'}</span>
                            <div class="dua-actions">
                                <button class="dua-action-btn" onclick="event.stopPropagation(); favoriteDua('${category.id}', '${dua.id}')">
                                    <i class="${isDuaFavorite(category.id, dua.id) ? 'fas' : 'far'} fa-heart"></i>
                                </button>
                                <button class="dua-action-btn" onclick="event.stopPropagation(); shareDua('${category.id}', '${dua.id}')">
                                    <i class="fas fa-share"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    });
    
    if (!html) {
        html = '<div class="no-results"><p>No duas found. Try different keywords.</p></div>';
    }
    
    container.innerHTML = html;
}

// Filter duas by category
function filterDuas(category) {
    const container = document.getElementById('duasContainer');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (category === 'all') {
        renderAllDuas();
        return;
    }
    
    const categoryData = appData.duas.categories.find(c => c.id === category);
    if (!categoryData) return;
    
    let html = '';
    categoryData.duas.forEach(dua => {
        html += `
            <div class="dua-card" onclick="showDuaDetail('${categoryData.id}', '${dua.id}')">
                <span class="dua-category">${categoryData.name}</span>
                <h3>${dua.title}</h3>
                <div class="arabic">${dua.arabic}</div>
                <div class="roman">${dua.roman}</div>
                <div class="translation">${dua.translation.substring(0, 100)}...</div>
                <div class="dua-card-footer">
                    <span class="reference">${dua.reference || 'Authentic'}</span>
                    <div class="dua-actions">
                        <button class="dua-action-btn" onclick="event.stopPropagation(); favoriteDua('${categoryData.id}', '${dua.id}')">
                            <i class="${isDuaFavorite(categoryData.id, dua.id) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        <button class="dua-action-btn" onclick="event.stopPropagation(); shareDua('${categoryData.id}', '${dua.id}')">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Clear search
function clearSearch() {
    document.getElementById('duaSearch').value = '';
    renderAllDuas();
}

// Check if dua is favorite
function isDuaFavorite(categoryId, duaId) {
    return appData.favorites.some(fav => fav.categoryId === categoryId && fav.duaId === duaId);
}

// Toggle favorite dua
function favoriteDua(categoryId, duaId) {
    const index = appData.favorites.findIndex(fav => 
        fav.categoryId === categoryId && fav.duaId === duaId
    );
    
    if (index === -1) {
        appData.favorites.push({ categoryId, duaId });
        showToast('Added to favorites! ❤️');
    } else {
        appData.favorites.splice(index, 1);
        showToast('Removed from favorites');
    }
    
    saveData();
    renderAllDuas(); // Refresh to update heart icons
}

// Share dua
function shareDua(categoryId, duaId) {
    const category = appData.duas.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const dua = category.duas.find(d => d.id === duaId);
    if (!dua) return;
    
    const shareText = `${dua.title}\n\n${dua.arabic}\n\n${dua.roman}\n\n${dua.translation}\n\nShared from Islamic Guide App`;
    
    if (navigator.share) {
        navigator.share({
            title: dua.title,
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Dua copied to clipboard! 📋');
        });
    }
}

// Show random dua
function showRandomDua() {
    const categories = appData.duas.categories;
    if (!categories || categories.length === 0) return;
    
    // Get random category
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    if (!randomCategory.duas || randomCategory.duas.length === 0) return;
    
    // Get random dua
    const randomDua = randomCategory.duas[Math.floor(Math.random() * randomCategory.duas.length)];
    
    showDuaDetail(randomCategory.id, randomDua.id);
}

// Show daily dua
function showDailyDua() {
    const dailyDuaElement = document.getElementById('dailyDua');
    if (!dailyDuaElement) return;
    
    const categories = appData.duas.categories;
    if (!categories || categories.length === 0) return;
    
    // Use date-based random for consistency
    const today = new Date().getDate();
    const categoryIndex = today % categories.length;
    const category = categories[categoryIndex];
    
    if (!category.duas || category.duas.length === 0) return;
    
    const duaIndex = (today * 13) % category.duas.length;
    const dua = category.duas[duaIndex];
    
    dailyDuaElement.textContent = `"${dua.translation.substring(0, 80)}..."`;
}

// Update prayer times
function updatePrayerTimes() {
    const container = document.getElementById('prayerTimes');
    
    // Example prayer times (in production, you would fetch these based on location)
    const prayerTimes = [
        { name: 'Fajr', time: '05:15 AM', active: isCurrentTime('05:15') },
        { name: 'Sunrise', time: '06:45 AM', active: false },
        { name: 'Dhuhr', time: '12:30 PM', active: isCurrentTime('12:30') },
        { name: 'Asr', time: '04:45 PM', active: isCurrentTime('16:45') },
        { name: 'Maghrib', time: '06:50 PM', active: isCurrentTime('18:50') },
        { name: 'Isha', time: '08:15 PM', active: isCurrentTime('20:15') }
    ];
    
    let html = '';
    prayerTimes.forEach(prayer => {
        html += `
            <div class="time-card ${prayer.active ? 'active' : ''}">
                <div class="name">${prayer.name}</div>
                <div class="time">${prayer.time}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Check if current time matches prayer time (simplified)
function isCurrentTime(timeString) {
    const now = new Date();
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    // Check if current time is within 15 minutes of prayer time
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);
    
    const diff = Math.abs(now - prayerTime);
    return diff < 15 * 60 * 1000; // 15 minutes in milliseconds
}

// Tasbeeh functions
function incrementTasbeeh() {
    appData.tasbeeh.count++;
    updateTasbeehDisplay();
    saveData();
    updateProgress();
    
    // Provide feedback
    provideFeedback();
}

function decrementTasbeeh() {
    if (appData.tasbeeh.count > 0) {
        appData.tasbeeh.count--;
        updateTasbeehDisplay();
        saveData();
        updateProgress();
    }
}

function resetTasbeeh() {
    appData.tasbeeh.count = 0;
    updateTasbeehDisplay();
    saveData();
    updateProgress();
}

function updateTasbeehDisplay() {
    const countElement = document.getElementById('tasbeehCount');
    if (countElement) {
        countElement.textContent = appData.tasbeeh.count;
    }
}

function startDhikr(text, count) {
    appData.tasbeeh.currentDhikr = { text, count };
    appData.tasbeeh.count = 0;
    updateTasbeehDisplay();
    showToast(`Started: ${text} (Goal: ${count})`);
}

function updateProgress() {
    const progress = (appData.tasbeeh.count / appData.settings.dailyGoal) * 100;
    // You can add a progress bar element in HTML and update it here
}

function provideFeedback() {
    // Vibration feedback
    if (appData.settings.vibration && navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    // Sound feedback (simple beep)
    if (appData.settings.sound) {
        // You can add sound feedback here
    }
}

// Theme functions
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.innerHTML = appData.settings.theme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
}

function toggleTheme() {
    const newTheme = appData.settings.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function setTheme(theme) {
    appData.settings.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    saveData();
    
    // Update toggle icon
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.innerHTML = theme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    
    showToast(`${theme === 'dark' ? 'Dark' : 'Light'} theme activated`);
}

function applySettings() {
    // Apply theme
    setTheme(appData.settings.theme);
    
    // Apply font size
    changeFontSize(0, true);
    
    // Update theme options active state
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === appData.settings.theme) {
            option.classList.add('active');
        }
    });
}

// Font size functions
function changeFontSize(delta, initial = false) {
    const sizes = ['small', 'medium', 'large', 'x-large'];
    let currentIndex = sizes.indexOf(appData.settings.fontSize);
    
    if (initial) {
        // Just apply current size
    } else if (delta > 0 && currentIndex < sizes.length - 1) {
        currentIndex++;
    } else if (delta < 0 && currentIndex > 0) {
        currentIndex--;
    }
    
    appData.settings.fontSize = sizes[currentIndex];
    document.documentElement.style.fontSize = getFontSizeValue(appData.settings.fontSize);
    saveData();
    
    // Update display
    const label = document.querySelector('.font-size-label');
    if (label) {
        label.textContent = appData.settings.fontSize.charAt(0).toUpperCase() + appData.settings.fontSize.slice(1);
    }
}

function getFontSizeValue(size) {
    switch(size) {
        case 'small': return '14px';
        case 'medium': return '16px';
        case 'large': return '18px';
        case 'x-large': return '20px';
        default: return '16px';
    }
}

// Sidebar functions
function setupSidebar() {
    // Close sidebar on outside click
    document.addEventListener('click', function(event) {
        const sidebar = document.getElementById('sidebarMenu');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(event.target) && 
            !menuToggle.contains(event.target)) {
            closeSidebar();
        }
    });
}

function openSidebar() {
    document.getElementById('sidebarMenu').classList.add('active');
}

function closeSidebar() {
    document.getElementById('sidebarMenu').classList.remove('active');
}

// Modal functions
function closeModal() {
    document.getElementById('duaModal').classList.remove('active');
}

// Loading functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Clear app data
function clearAppData() {
    if (confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
        localStorage.removeItem('islamicGuideData');
        location.reload();
    }
}

// Export data (simplified)
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'islamic-guide-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!');
}

// Fallback data (in case GitHub fetch fails)
function getFallbackNamazData() {
    return {
        types: [
            {
                id: "fajr",
                name: "Fajr Prayer",
                description: "Morning prayer before sunrise",
                time: "Dawn to sunrise",
                rakats: "2 Sunnah, 2 Fard",
                icon: "fas fa-sun",
                audible: true
            },
            {
                id: "dhuhr",
                name: "Dhuhr Prayer",
                description: "Midday prayer after sun passes zenith",
                time: "After noon until mid-afternoon",
                rakats: "4 Sunnah, 4 Fard, 2 Sunnah",
                icon: "fas fa-sun",
                audible: true
            },
            {
                id: "asr",
                name: "Asr Prayer",
                description: "Afternoon prayer",
                time: "Mid-afternoon until sunset",
                rakats: "4 Fard",
                icon: "fas fa-cloud-sun",
                audible: false
            },
            {
                id: "maghrib",
                name: "Maghrib Prayer",
                description: "Evening prayer after sunset",
                time: "After sunset until darkness",
                rakats: "3 Fard, 2 Sunnah",
                icon: "fas fa-sunset",
                audible: true
            },
            {
                id: "isha",
                name: "Isha Prayer",
                description: "Night prayer",
                time: "After darkness until midnight",
                rakats: "4 Fard, 2 Sunnah, 3 Witr",
                icon: "fas fa-moon",
                audible: true
            }
        ],
        steps: {
            fajr: [
                {
                    title: "Make Intention",
                    arabic: "نَوَيْتُ أَنْ أُصَلِّيَ صَلاةَ الصُّبْحِ رَكْعَتَيْنِ فَرْضاً لِلَّهِ تَعَالَى",
                    roman: "Nawaitu an usalliya salatas subhi rak'atayni fardan lillahi ta'ala",
                    description: "I intend to pray the Fajr prayer, two rakats fard for Allah the Exalted.",
                    notes: "Intention is in the heart, not spoken out loud."
                },
                {
                    title: "Takbiratul Ihram",
                    arabic: "اللهُ أَكْبَرُ",
                    roman: "Allahu Akbar",
                    description: "Raise your hands to your ears and say 'Allahu Akbar' (Allah is the Greatest)."
                }
            ]
        }
    };
}

function getFallbackDuaData() {
    return {
        categories: [
            {
                id: "morning",
                name: "Morning Duas",
                duas: [
                    {
                        id: "morning1",
                        title: "Morning Dua 1",
                        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
                        roman: "Asbahna wa asbahal mulku lillahi, wal hamdu lillahi, la ilaha illallahu wahdahu la sharika lah",
                        translation: "We have reached the morning and at this very time all sovereignty belongs to Allah. Praise is for Allah. There is none worthy of worship but Allah alone, Who has no partner.",
                        reference: "Muslim 4/2088",
                        benefits: "Reciting this dua in the morning grants protection for the entire day."
                    }
                ]
            },
            {
                id: "evening",
                name: "Evening Duas",
                duas: [
                    {
                        id: "evening1",
                        title: "Evening Dua 1",
                        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
                        roman: "Amsayna wa amsal mulku lillahi, wal hamdu lillahi, la ilaha illallahu wahdahu la sharika lah",
                        translation: "We have reached the evening and at this very time all sovereignty belongs to Allah. Praise is for Allah. There is none worthy of worship but Allah alone, Who has no partner.",
                        reference: "Muslim 4/2088",
                        benefits: "Reciting this dua in the evening grants protection for the entire night."
                    }
                ]
            },
            {
                id: "travel",
                name: "Travel Duas",
                duas: [
                    {
                        id: "travel1",
                        title: "Dua for Travel",
                        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
                        roman: "Subhanallazi sakkhara lana haza wa ma kunna lahu muqrineen",
                        translation: "Glory is to Him Who has provided this for us though we could never have had it by our efforts. Indeed, to our Lord we will return.",
                        reference: "Quran 43:13",
                        benefits: "Protection during travel and gratitude for transportation."
                    }
                ]
            }
        ]
    };
}

// Render prayer steps on prayer guide page
function renderPrayerSteps() {
    const container = document.getElementById('prayerSteps');
    if (!container || !appData.namaz.steps) return;
    
    // Get Fajr prayer steps as example
    const steps = appData.namaz.steps.fajr || [];
    
    let html = '';
    steps.forEach((step, index) => {
        html += `
            <div class="step-card">
                <div class="step-header">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-title">${step.title}</div>
                </div>
                <div class="step-content">
                    ${step.arabic ? `<div class="arabic-text">${step.arabic}</div>` : ''}
                    ${step.roman ? `<div class="roman-text">${step.roman}</div>` : ''}
                    <div class="step-description">${step.description}</div>
                    ${step.notes ? `
                        <div class="step-notes">
                            <p><strong>Note:</strong> ${step.notes}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}