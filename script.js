// ڈیٹا یو آر ایلز (GitHub Raw URLs)
const DATA_URLS = {
    namaz: 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/namaz.json',
    duas: 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/duas.json'
};

// گلوبل متغیرات
let namazData = {};
let duaCategories = {};
let currentTasbeehCount = 0;
let tasbeehGoal = 100;

// ایپ شروع کرنے کے لئے
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    showLoading(true);
    
    try {
        // ڈیٹا لوڈ کریں
        await loadData();
        
        // نماز کے اوقات سیٹ کریں
        setupPrayerTimes();
        
        // نماز کے بٹن بنائیں
        renderNamazButtons();
        
        // دعا کی اقسام بنائیں
        renderDuaCategories();
        
        // تسبیح سیٹ اپ کریں
        setupTasbeeh();
        
        // ایونٹ لسٹنرز شامل کریں
        setupEventListeners();
        
        // ڈیفالٹ ٹیب دکھائیں
        switchTab('home');
        
        showLoading(false);
    } catch (error) {
        console.error('Error initializing app:', error);
        showLoading(false);
        alert('ڈیٹا لوڈ کرنے میں مسئلہ ہوا۔ براہ کرم انٹرنیٹ کنکشن چیک کریں۔');
    }
}

// ڈیٹا لوڈ کریں
async function loadData() {
    try {
        // نماز ڈیٹا لوڈ کریں
        const namazResponse = await fetch(DATA_URLS.namaz);
        namazData = await namazResponse.json();
        
        // دعا ڈیٹا لوڈ کریں
        const duasResponse = await fetch(DATA_URLS.duas);
        duaCategories = await duasResponse.json();
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// نماز کے اوقات سیٹ اپ کریں
function setupPrayerTimes() {
    const prayerTimesElement = document.getElementById('prayerTimes');
    
    // نماز کے اوقات (مثال کے طور پر)
    const prayerTimes = [
        { name: 'فجر', time: '05:15 AM' },
        { name: 'ظہر', time: '12:30 PM' },
        { name: 'عصر', time: '04:45 PM' },
        { name: 'مغرب', time: '06:50 PM' },
        { name: 'عشاء', time: '08:15 PM' },
        { name: 'جماعت', time: '12:30 PM' }
    ];
    
    let html = '';
    prayerTimes.forEach(prayer => {
        html += `
            <div class="time-card">
                <div class="time-name">${prayer.name}</div>
                <div class="time-value">${prayer.time}</div>
            </div>
        `;
    });
    
    prayerTimesElement.innerHTML = html;
}

// نماز کے بٹن رینڈر کریں
function renderNamazButtons() {
    const namazContainer = document.getElementById('namazContainer');
    
    if (!namazData.types) return;
    
    let html = '';
    namazData.types.forEach(namaz => {
        html += `
            <div class="namaz-card" onclick="showNamazDetail('${namaz.id}')">
                <div class="namaz-icon">
                    <i class="${namaz.icon || 'fas fa-clock'}"></i>
                </div>
                <h3>${namaz.name}</h3>
                <p>${namaz.description || 'مکمل طریقہ'}</p>
            </div>
        `;
    });
    
    namazContainer.innerHTML = html;
}

// دعا کی اقسام رینڈر کریں
function renderDuaCategories() {
    const duaCategoriesElement = document.getElementById('duaCategories');
    
    let html = '';
    for (const category in duaCategories) {
        const categoryData = duaCategories[category];
        if (categoryData.length > 0) {
            html += `
                <div class="category-card" onclick="showDuaCategory('${category}')">
                    <div class="category-icon">
                        <i class="${getCategoryIcon(category)}"></i>
                    </div>
                    <h3>${getCategoryName(category)}</h3>
                    <p>${categoryData.length} دعائیں</p>
                </div>
            `;
        }
    }
    
    duaCategoriesElement.innerHTML = html;
}

// دعا کی قسم کا آئیکن حاصل کریں
function getCategoryIcon(category) {
    const icons = {
        morning: 'fas fa-sun',
        evening: 'fas fa-moon',
        eating: 'fas fa-utensils',
        sleeping: 'fas fa-bed',
        travel: 'fas fa-car',
        health: 'fas fa-heartbeat',
        general: 'fas fa-pray'
    };
    
    return icons[category] || 'fas fa-hands-praying';
}

// دعا کی قسم کا نام حاصل کریں
function getCategoryName(category) {
    const names = {
        morning: 'صبح کی دعائیں',
        evening: 'شام کی دعائیں',
        eating: 'کھانے کی دعائیں',
        sleeping: 'سونے کی دعائیں',
        travel: 'سفر کی دعائیں',
        health: 'صحت کی دعائیں',
        general: 'عام دعائیں'
    };
    
    return names[category] || category;
}

// تسبیح سیٹ اپ کریں
function setupTasbeeh() {
    // لوکل سٹوریج سے تسبیح کاؤنٹ لوڈ کریں
    const savedCount = localStorage.getItem('tasbeehCount');
    if (savedCount) {
        currentTasbeehCount = parseInt(savedCount);
        updateTasbeehDisplay();
    }
    
    const savedGoal = localStorage.getItem('tasbeehGoal');
    if (savedGoal) {
        tasbeehGoal = parseInt(savedGoal);
        document.getElementById('tasbeehGoal').value = tasbeehGoal;
        updateProgress();
    }
}

// ایونٹ لسٹنرز سیٹ اپ کریں
function setupEventListeners() {
    // مینو ٹوگل
    document.getElementById('menuToggle').addEventListener('click', function() {
        alert('مینو جلد ہی دستیاب ہوگا!');
    });
    
    // موبائل ٹچ کے لئے اضافی ایونٹس
    document.querySelectorAll('.clickable').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touched');
        });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('touched');
        });
    });
}

// ٹیب سوئچ کریں
function switchTab(tabName) {
    // تمام ٹیبز اور مواد کو غیر فعال کریں
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // نئی ٹیب اور مواد کو فعال کریں
    const tabButtons = document.querySelectorAll(`.tab[onclick*="${tabName}"]`);
    if (tabButtons.length > 0) {
        tabButtons[0].classList.add('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    
    // خاص حالات
    if (tabName === 'home') {
        updatePrayerTimesIfNeeded();
    }
}

// نماز کی تفصیل دکھائیں
function showNamazDetail(namazId) {
    const namaz = namazData.types.find(n => n.id === namazId);
    if (!namaz) return;
    
    const steps = namazData.steps[namazId];
    if (!steps) return;
    
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = namaz.name;
    
    let html = `<div class="namaz-info">
                   <p><strong>وقت:</strong> ${namaz.time || 'مختلف'}</p>
                   <p><strong>رکعات:</strong> ${namaz.rakats || 'مختلف'}</p>
               </div>`;
    
    steps.forEach((step, index) => {
        html += `
            <div class="step">
                <h4>${index + 1}. ${step.title}</h4>
                ${step.arabic ? `<p class="arabic">${step.arabic}</p>` : ''}
                ${step.transcription ? `<p><strong>تلفظ:</strong> ${step.transcription}</p>` : ''}
                <p>${step.description}</p>
            </div>
        `;
    });
    
    body.innerHTML = html;
    modal.classList.add('active');
}

// دعا کی قسم دکھائیں
function showDuaCategory(category) {
    const duas = duaCategories[category];
    if (!duas || duas.length === 0) return;
    
    const duaListDiv = document.getElementById('dua-list');
    const duasListContainer = document.getElementById('duasListContainer');
    const duaListTitle = document.getElementById('duaListTitle');
    
    // عنوان سیٹ کریں
    duaListTitle.textContent = getCategoryName(category);
    
    // دعائیں رینڈر کریں
    let html = '';
    duas.forEach((dua, index) => {
        html += `
            <div class="dua-item" onclick="showDuaDetail('${category}', ${index})">
                <h4>${dua.title}</h4>
                <p class="arabic">${dua.arabic}</p>
                <p>${dua.urdu.substring(0, 80)}...</p>
            </div>
        `;
    });
    
    duasListContainer.innerHTML = html;
    
    // سیکشنز سوئچ کریں
    document.getElementById('dua').classList.remove('active');
    duaListDiv.classList.add('active');
}

// دعا کی تفصیل دکھائیں
function showDuaDetail(category, index) {
    const dua = duaCategories[category][index];
    if (!dua) return;
    
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = dua.title;
    
    body.innerHTML = `
        <div class="step">
            <h4>عربی</h4>
            <p class="arabic">${dua.arabic}</p>
        </div>
        <div class="step">
            <h4>تلفظ</h4>
            <p>${dua.transcription || 'دستیاب نہیں'}</p>
        </div>
        <div class="step">
            <h4>اردو ترجمہ</h4>
            <p>${dua.urdu}</p>
        </div>
        ${dua.reference ? `
        <div class="step">
            <h4>حوالہ</h4>
            <p>${dua.reference}</p>
        </div>` : ''}
    `;
    
    modal.classList.add('active');
}

// دعا کی اقسام پر واپس جائیں
function backToDuaCategories() {
    document.getElementById('dua-list').classList.remove('active');
    document.getElementById('dua').classList.add('active');
}

// تسبیح دکھائیں
function showTasbeeh() {
    switchTab('tasbeeh');
}

// تسبیح بند کریں
function closeTasbeeh() {
    switchTab('home');
}

// تسبیح کاؤنٹ بڑھائیں
function incrementTasbeeh() {
    currentTasbeehCount++;
    updateTasbeehDisplay();
    saveTasbeehCount();
    updateProgress();
    
    // ہپٹک فیڈبیک (اگر دستیاب ہو)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// تسبیح ری سیٹ کریں
function resetTasbeeh() {
    currentTasbeehCount = 0;
    updateTasbeehDisplay();
    saveTasbeehCount();
    updateProgress();
}

// تسبیح ڈسپلے اپڈیٹ کریں
function updateTasbeehDisplay() {
    document.getElementById('tasbeehCount').textContent = currentTasbeehCount;
}

// تسبیح کاؤنٹ محفوظ کریں
function saveTasbeehCount() {
    localStorage.setItem('tasbeehCount', currentTasbeehCount.toString());
}

// تسبیح کا ہدف سیٹ کریں
function setTasbeehGoal(goal) {
    tasbeehGoal = goal;
    document.getElementById('tasbeehGoal').value = goal;
    setCustomGoal();
}

// کسٹم ہدف سیٹ کریں
function setCustomGoal() {
    const input = document.getElementById('tasbeehGoal');
    let goal = parseInt(input.value);
    
    if (isNaN(goal) || goal < 1) goal = 100;
    if (goal > 1000) goal = 1000;
    
    tasbeehGoal = goal;
    input.value = goal;
    localStorage.setItem('tasbeehGoal', goal.toString());
    updateProgress();
}

// پیش رفت اپڈیٹ کریں
function updateProgress() {
    const progress = Math.min((currentTasbeehCount / tasbeehGoal) * 100, 100);
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('goalText').textContent = `${currentTasbeehCount}/${tasbeehGoal}`;
}

// دعا تلاش کریں
function searchDuas() {
    const searchTerm = document.getElementById('duaSearch').value.toLowerCase();
    const duaCategoriesElement = document.getElementById('duaCategories');
    
    let html = '';
    for (const category in duaCategories) {
        const categoryData = duaCategories[category];
        const filteredDuas = categoryData.filter(dua => 
            dua.title.toLowerCase().includes(searchTerm) || 
            dua.arabic.toLowerCase().includes(searchTerm) ||
            dua.urdu.toLowerCase().includes(searchTerm) ||
            (dua.transcription && dua.transcription.toLowerCase().includes(searchTerm))
        );
        
        if (filteredDuas.length > 0) {
            html += `
                <div class="category-card" onclick="showDuaCategory('${category}')">
                    <div class="category-icon">
                        <i class="${getCategoryIcon(category)}"></i>
                    </div>
                    <h3>${getCategoryName(category)}</h3>
                    <p>${filteredDuas.length} دعائیں مل گئیں</p>
                </div>
            `;
        }
    }
    
    if (!html) {
        html = '<div class="no-results"><p>کوئی دعا نہیں ملی۔</p></div>';
    }
    
    duaCategoriesElement.innerHTML = html;
}

// مودل بند کریں
function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// لوڈنگ دکھائیں/چھپائیں
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (show) {
        loadingElement.classList.add('active');
    } else {
        loadingElement.classList.remove('active');
    }
}

// نماز کے اوقات اپڈیٹ کریں اگر ضرورت ہو
function updatePrayerTimesIfNeeded() {
    // یہاں آپ نماز کے اوقات کو اپ ڈیٹ کرنے کا منطق شامل کر سکتے ہیں
    // جیسے مقام کے حساب سے اوقات کا تعین
}

// iOS ڈیوائس کے لئے خصوصی فنکشنز
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// ایپ کو iOS پش نوٹیفیکیشن کے لئے تیار کریں
function setupIOSFeatures() {
    if (isIOS()) {
        // iOS کے لئے اضافی سیٹ اپ
        document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
        
        // iOS کے لئے اسٹائل ایڈجسٹمنٹ
        if (navigator.standalone) {
            // اگر ایپ ہوم اسکرین سے چل رہی ہے
            document.body.classList.add('ios-standalone');
        }
    }
}

// ایپ کو فُل اسکرین موڈ میں چلانے کی کوشش کریں
function requestFullscreen() {
    const docEl = document.documentElement;
    
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) { // Safari
        docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) { // IE11
        docEl.msRequestFullscreen();
    }
}

// ونڈو لوڈ ہونے پر iOS خصوصیات سیٹ اپ کریں
window.addEventListener('load', function() {
    setupIOSFeatures();
    
    // سکرین پر کلک کرنے پر فُل اسکرین کی درخواست
    document.addEventListener('click', function() {
        requestFullscreen();
    }, { once: true });
});

// آف لائن سپورٹ
window.addEventListener('online', function() {
    showNotification('انٹرنیٹ سے منسلک ہوگیا ہے۔');
});

window.addEventListener('offline', function() {
    showNotification('انٹرنیٹ کنکشن منقطع ہے۔ آف لائن موڈ میں کام کر رہے ہیں۔');
});

function showNotification(message) {
    // سادہ نوٹیفیکیشن دکھائیں
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 16px;
        left: 16px;
        background: var(--primary-color);
        color: white;
        padding: 12px 16px;
        border-radius: var(--radius-sm);
        text-align: center;
        z-index: 9999;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// نوٹیفیکیشن کے لئے اینیمیشنز شامل کریں
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-100%); opacity: 0; }
    }
`;
document.head.appendChild(style);