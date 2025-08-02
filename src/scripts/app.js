// Artiply - Design Marketplace JavaScript

// LIFF Integration
let liffProfile = null;
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

// Cart management functions
function saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function updateCartIcon() {
    const cartCount = cartItems.length; // นับจำนวนรายการ (ไม่ใช่ quantity)
    const cartBtns = document.querySelectorAll('.cart-btn');
    
    cartBtns.forEach(cartBtn => {
        // ลบ badge เก่าถ้ามี
        const existingBadge = cartBtn.querySelector('.cart-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // เพิ่ม badge ใหม่ถ้ามีสินค้าในตะกร้า
        if (cartCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.textContent = cartCount > 99 ? '99+' : cartCount;
            cartBtn.appendChild(badge);
        }
    });
}

function calculateTotal() {
    return cartItems.reduce((total, item) => {
        const price = item.price || 0;
        return total + price; // แต่ละรายการคือ 1 ชิ้น
    }, 0);
}

function findCartItem(productTitle) {
    return cartItems.find(item => item.title === productTitle);
}
let currentProduct = null;

// Initialize LIFF
async function initializeLiff() {
    try {
        await liff.init({ liffId: '2007868119-pAKjVanQ' });
        console.log('LIFF init succeeded');
        
        // เปลี่ยนสีพื้นหลังตาม OS
        const body = document.body;
        switch (liff.getOS()) {
            case "android": 
                body.style.backgroundColor = "#f0f8f0"; 
                break;
            case "ios": 
                body.style.backgroundColor = "#f5f5f5"; 
                break;
            default:
                body.style.backgroundColor = "#f5f5f5";
        }
        
        // เช็คว่าเปิดใน LINE หรือไม่
        if (liff.isInClient()) {
            console.log('Opening in LINE client');
            // ใน LINE app ให้ดึงข้อมูล profile ได้เลย
            if (liff.isLoggedIn()) {
                liffProfile = await liff.getProfile();
                updateUserProfile();
            }
        } else {
            console.log('Opening in external browser');
            // ใน browser ต้องล็อกอินก่อน
            if (liff.isLoggedIn()) {
                liffProfile = await liff.getProfile();
                updateUserProfile();
            } else {
                // แสดงปุ่มล็อกอิน
                showLoginButton();
            }
        }
    } catch (error) {
        console.log('LIFF initialization failed:', error);
        // ใช้ mock data
        liffProfile = {
            displayName: "Sophia Carter",
            pictureUrl: "../picture/sophia-avatar.svg",
            userId: "sophia_carter"
        };
        updateUserProfile();
    }
}

// ฟังก์ชันแสดงปุ่มล็อกอิน (สำหรับใช้นอก LINE)
function showLoginButton() {
    const loginBtn = document.createElement('button');
    loginBtn.textContent = 'Login with LINE';
    loginBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00C300;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
        font-size: 14px;
    `;
    loginBtn.onclick = () => liff.login();
    document.body.appendChild(loginBtn);
}

// ฟังก์ชันส่งข้อความไป LINE
async function sendMessageToLine(text) {
    try {
        if (liff.getContext().type !== "none" && liff.getContext().type !== "external") {
            await liff.sendMessages([{
                type: "text",
                text: text
            }]);
            console.log('Message sent to LINE');
            return true;
        }
    } catch (error) {
        console.log('Failed to send message:', error);
    }
    return false;
}

// ฟังก์ชันแชร์รูปภาพ
async function shareToLine(imageUrl, altText = "") {
    try {
        await liff.shareTargetPicker([{
            type: "image",
            originalContentUrl: imageUrl,
            previewImageUrl: imageUrl,
            altText: altText
        }]);
        console.log('Image shared to LINE');
    } catch (error) {
        console.log('Failed to share image:', error);
        // Fallback: แชร์เป็น text
        await liff.shareTargetPicker([{
            type: "text",
            text: `Check out this design: ${imageUrl}`
        }]);
    }
}

function updateUserProfile() {
    if (liffProfile) {
        document.getElementById('userName').textContent = liffProfile.displayName;
        document.getElementById('userEmail').textContent = "LINE ID: @" + liffProfile.userId;
    }
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Set active nav item based on page
    const navMap = {
        'dashboard': 0,
        'myDesigns': 1,
        'upload': 2,
        'earnings': 3,
        'profile': 4,
        'profileEarnings': 4
    };
    
    if (navMap[pageId] !== undefined) {
        document.querySelectorAll('.nav-item')[navMap[pageId]].classList.add('active');
    }

    // Animate chart when earnings page is shown
    if (pageId === 'profileEarnings') {
        setTimeout(animateChart, 300);
    }
}

// Product Detail
function showProductDetail(type) {
    currentProduct = {
        business: {
            title: "Minimalist Logo",
            price: 2000,
            description: "Designed to suit a wide range of businesses, whether it's a clothing store, café, cosmetics brand, or creative studio."
        },
        wedding: {
            title: "Elegant Wedding Invitation",
            price: 1500,
            description: "Beautiful and elegant wedding invitation template perfect for your special day."
        }
    }[type];
    
    showPage('productDetail');
}

// Cart Functions
function showCart() {
    showPage('cart');
    updateCartTotal();
}

function updateCartTotal() {
    const total = calculateTotal();
    
    // อัพเดทใน cart.html
    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
        cartTotalElement.textContent = `${total.toLocaleString()} THB`;
    }
    
    // อัพเดทใน payment.html 
    const paymentTotalElements = document.querySelectorAll('.total-row span:last-child');
    paymentTotalElements.forEach(element => {
        if (element.textContent.includes('THB')) {
            element.textContent = `${total.toLocaleString()} THB`;
        }
    });
}

function removeCartItem(index) {
    cartItems.splice(index, 1);
    saveCartToStorage();
    updateCartDisplay();
    updateCartTotal();
    updateCartIcon();
}

// ลบฟังก์ชัน changeQuantity เพราะไม่ใช้แล้ว

function updateCartDisplay() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <div class="empty-cart-text">Your cart is empty</div>
                <div class="empty-cart-subtext">Add some designs to get started!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cartItems.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image">
                ${item.image}
            </div>
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} THB</div>
            </div>
            <button class="remove-btn" onclick="removeCartItem(${index})">×</button>
        </div>
    `).join('');
}

function addToCart() {
    console.log('🛒 Adding to cart...');
    
    // Check if we're on product detail page and set current product
    if (window.location.pathname.includes('product-detail.html')) {
        currentProduct = {
            title: "Minimalist Logo",
            price: 2000,
            description: "Designed to suit a wide range of businesses, whether it's a clothing store, café, cosmetics brand, or creative studio."
        };
        console.log('✅ Current product set:', currentProduct);
    }
    
    if (currentProduct) {
        // เพิ่มสินค้าใหม่ทุกครั้ง (แยกชิ้น)
        cartItems.push({
            id: Date.now() + Math.random(), // ใช้ random เพื่อให้ unique
            title: currentProduct.title,
            price: currentProduct.price,
            quantity: 1,
            image: `<img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><rect width='60' height='60' fill='%23E8C5C5'/><rect x='10' y='35' width='40' height='15' rx='2' fill='white'/><rect x='15' y='20' width='30' height='10' rx='2' fill='white'/><circle cx='20' cy='15' r='3' fill='white'/></svg>" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="Design">`
        });
        console.log('✅ Added new item to cart as separate entry');
        
        saveCartToStorage();
        updateCartDisplay();
        updateCartTotal();
        updateCartIcon();
        
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = 'cart.html';
        } else {
            window.location.href = 'pages/cart.html';
        }
    } else {
        console.error('❌ No current product found');
        alert('Error: No product selected');
    }
}

function buyNow() {
    document.getElementById('paymentModal').classList.add('active');
}

// Payment Functions
function proceedToPayment() {
    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // เก็บข้อมูลตะกร้าสำหรับหน้าชำระเงิน
    localStorage.setItem('paymentItems', JSON.stringify(cartItems));
    
    // ไปหน้าชำระเงินเลย
    if (window.location.pathname.includes('/pages/')) {
        window.location.href = 'payment.html';
    } else {
        window.location.href = 'pages/payment.html';
    }
}

function closePayment() {
    document.getElementById('paymentModal').classList.remove('active');
}

function selectPayment(element) {
    document.querySelectorAll('.payment-method').forEach(pm => {
        pm.classList.remove('active');
    });
    element.classList.add('active');
}

async function confirmPayment() {
    console.log('💳 Processing payment...');
    
    try {
        // ส่งข้อความแจ้งการซื้อสำเร็จไป LINE (ถ้าเปิดใน LINE)
        if (typeof liff !== 'undefined' && liff.isInClient()) {
            const paymentItems = JSON.parse(localStorage.getItem('paymentItems') || '[]');
            const totalAmount = paymentItems.reduce((sum, item) => sum + parseFloat(item.price.replace(' THB', '')), 0);
            
            const message = `🎉 Payment Successful!\n\n` +
                          `📦 Items: ${paymentItems.length}\n` +
                          `💰 Total: ${totalAmount} THB\n\n` +
                          `Thank you for shopping with Artiply! 🛍️`;
            
            await sendMessageToLine(message);
        }
    } catch (error) {
        console.log('Failed to send payment notification:', error);
    }
    
    // เคลียร์ตะกร้าก่อน redirect
    cartItems = [];
    saveCartToStorage();
    localStorage.removeItem('paymentItems'); // ลบ payment items ด้วย
    console.log('✅ Cart cleared after payment');
    
    // ไปหน้า payment success
    if (window.location.pathname.includes('/pages/')) {
        window.location.href = 'payment-success.html';
    } else {
        window.location.href = 'pages/payment-success.html';
    }
}

function downloadReceipt() {
    alert('PDF receipt downloaded successfully!');
}

// Category Filtering
function filterCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Here you would filter the designs based on category
    console.log('Filtering by category:', category);
}

// Initialize search and filter system
function initializeSearchAndFilter() {
    console.log('🔍 Initializing search and filter system...');
    
    const searchInput = document.querySelector('.search-input');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const designCards = document.querySelectorAll('.design-card');
    
    if (!searchInput || !categoryButtons.length || !designCards.length) {
        console.log('⚠️ Required elements not found, retrying in 1s...');
        setTimeout(initializeSearchAndFilter, 1000);
        return;
    }
    
    console.log('✅ Found all required elements');
    
    // Add random placeholder suggestions
    const suggestions = [
        'Search for business templates...',
        'Find marketing designs...',
        'Looking for education templates?',
        'Type to search designs...'
    ];
    setInterval(() => {
        searchInput.placeholder = suggestions[Math.floor(Math.random() * suggestions.length)];
    }, 3000);
    
    function filterDesigns() {
        const searchText = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active').textContent.toLowerCase();
        
        console.log('🔍 Filtering - Search:', searchText, 'Category:', activeCategory);
        
        designCards.forEach(card => {
            const category = card.dataset.category.toLowerCase();
            const keywords = card.dataset.keywords.toLowerCase();
            const title = card.querySelector('.design-title').textContent.toLowerCase();
            const author = card.querySelector('.design-author span').textContent.toLowerCase();
            
            const matchesSearch = searchText === '' || 
                                keywords.includes(searchText) || 
                                title.includes(searchText) || 
                                author.includes(searchText);
                                
            const matchesCategory = activeCategory === 'all' || category === activeCategory;
            
            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease-in';
            } else {
                card.style.display = 'none';
            }
        });
        
        updateResultsCount();
    }
    
    function updateResultsCount() {
        const visibleCards = document.querySelectorAll('.design-card[style="display: block"]').length;
        console.log(`📊 Found ${visibleCards} matching designs`);
    }
    
    // Event Listeners
    searchInput.addEventListener('input', filterDesigns);
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterDesigns();
        });
    });
    
    // Initial filter
    filterDesigns();
    console.log('✅ Search and filter system initialized');
}

// Load and display designs from localStorage
function loadMyDesigns() {
    const myDesigns = JSON.parse(localStorage.getItem('myDesigns')) || [];
    const designsList = document.querySelector('.designs-list');
    
    if (!designsList) {
        console.log('⚠️ Designs list container not found');
        return;
    }
    
    console.log('📂 Loading', myDesigns.length, 'uploaded designs');
    
    // Clear existing uploaded designs (keep static ones)
    const uploadedItems = designsList.querySelectorAll('.design-item[data-uploaded="true"]');
    uploadedItems.forEach(item => item.remove());
    
    // Add uploaded designs
    const backgrounds = ['#E8C5C5', '#2F5233', '#D4A574', '#A8C8A8', '#C5A8E8', '#E8E0C5'];
    const existingDesigns = designsList.querySelectorAll('.design-item:not([data-uploaded="true"])');
    const startIndex = existingDesigns.length; // เริ่มนับต่อจากสินค้าเดิม
    
    myDesigns.forEach((design, index) => {
        const designElement = document.createElement('div');
        designElement.className = 'design-item';
        designElement.setAttribute('data-type', design.type);
        designElement.setAttribute('data-keywords', `${design.title} ${design.description} ${design.category}`);
        designElement.setAttribute('data-uploaded', 'true');
        
        const bgColor = backgrounds[index % backgrounds.length];
        const textColor = bgColor === '#2F5233' ? 'white' : '#333';
        
        // เลือกไอคอนตาม category
        const categoryIcons = {
            business: '💼',
            marketing: '📊', 
            education: '📚',
            wedding: '💒',
            social: '📱'
        };
        const icon = categoryIcons[design.category.toLowerCase()] || '📄';
        
        designElement.innerHTML = `
            <div class="design-item-header">
                <div class="design-item-info">
                    <h4>Design ${startIndex + index + 1}</h4>
                    <p style="font-weight: 600; color: #333; margin-bottom: 2px;">${design.title}</p>
                    <p class="${design.free ? '' : 'design-item-price'}" style="${design.free ? 'color: #666;' : ''}">${design.free ? 'Free' : design.price + ' THB'}</p>
                </div>
                <div class="design-item-preview" style="background: ${bgColor}; color: ${textColor}; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                    ${icon}
                </div>
            </div>
            <div class="design-item-actions">
                <button class="edit-btn" onclick="editDesign(${design.id})">Edit</button>
                <button class="download-btn">Download</button>
            </div>
        `;
        
        designsList.appendChild(designElement);
    });
    
    console.log('✅ Designs loaded successfully');
}

// Edit design function
function editDesign(designId) {
    const myDesigns = JSON.parse(localStorage.getItem('myDesigns')) || [];
    const design = myDesigns.find(d => d.id === designId);
    
    if (!design) {
        alert('Design not found');
        return;
    }
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="edit-modal-content">
            <div class="edit-modal-header">
                <h3>Edit Design</h3>
                <button class="close-btn" onclick="closeEditModal()">&times;</button>
            </div>
            <form id="editForm" onsubmit="saveDesignChanges(event, ${designId})">
                <div class="form-group">
                    <label for="editTitle">Design Title</label>
                    <input type="text" id="editTitle" value="${design.title}" required>
                </div>
                
                <div class="form-group">
                    <label for="editDescription">Description</label>
                    <textarea id="editDescription" rows="3" required>${design.description}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="editCategory">Category</label>
                    <select id="editCategory" required>
                        <option value="business" ${design.category === 'business' ? 'selected' : ''}>Business</option>
                        <option value="marketing" ${design.category === 'marketing' ? 'selected' : ''}>Marketing</option>
                        <option value="education" ${design.category === 'education' ? 'selected' : ''}>Education</option>
                        <option value="wedding" ${design.category === 'wedding' ? 'selected' : ''}>Wedding</option>
                        <option value="social" ${design.category === 'social' ? 'selected' : ''}>Social Media</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editPrice">Price (THB)</label>
                    <input type="number" id="editPrice" value="${design.price}" min="0" ${design.free ? 'disabled' : ''}>
                </div>
                
                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="editFree" ${design.free ? 'checked' : ''} onchange="togglePriceField(this)">
                        <label for="editFree">Make this design free</label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                    <button type="button" class="btn btn-danger" onclick="deleteDesign(${designId})">Delete</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
}

function closeEditModal() {
    const modal = document.querySelector('.edit-modal');
    if (modal) {
        modal.remove();
    }
}

function togglePriceField(checkbox) {
    const priceField = document.getElementById('editPrice');
    priceField.disabled = checkbox.checked;
    if (checkbox.checked) {
        priceField.value = 0;
    }
}

function saveDesignChanges(event, designId) {
    event.preventDefault();
    
    const myDesigns = JSON.parse(localStorage.getItem('myDesigns')) || [];
    const designIndex = myDesigns.findIndex(d => d.id === designId);
    
    if (designIndex === -1) {
        alert('Design not found');
        return;
    }
    
    // Update design data
    const updatedDesign = {
        ...myDesigns[designIndex],
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        category: document.getElementById('editCategory').value,
        price: document.getElementById('editFree').checked ? 0 : parseFloat(document.getElementById('editPrice').value),
        free: document.getElementById('editFree').checked,
        type: document.getElementById('editFree').checked ? 'free' : 'paid'
    };
    
    myDesigns[designIndex] = updatedDesign;
    localStorage.setItem('myDesigns', JSON.stringify(myDesigns));
    
    // Reload designs
    loadMyDesigns();
    closeEditModal();
    
    alert('Design updated successfully!');
}

function deleteDesign(designId) {
    if (!confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
        return;
    }
    
    const myDesigns = JSON.parse(localStorage.getItem('myDesigns')) || [];
    const updatedDesigns = myDesigns.filter(d => d.id !== designId);
    
    localStorage.setItem('myDesigns', JSON.stringify(updatedDesigns));
    loadMyDesigns();
    closeEditModal();
    
    alert('Design deleted successfully!');
}

// Initialize My Designs page
function initializeMyDesigns() {
    console.log('🎨 Initializing My Designs page...');
    
    // First, load and display designs from localStorage
    loadMyDesigns();
    
    const searchInput = document.querySelector('.search-designs');
    const designTabs = document.querySelectorAll('.designs-tab');
    
    if (!searchInput || !designTabs.length) {
        console.log('⚠️ My Designs elements not found, retrying in 1s...');
        setTimeout(initializeMyDesigns, 1000);
        return;
    }
    
    console.log('✅ Found all My Designs elements');
    
    function filterDesigns() {
        const searchText = searchInput.value.toLowerCase();
        const activeTab = document.querySelector('.designs-tab.active').textContent.toLowerCase();
        const designItems = document.querySelectorAll('.design-item'); // อ่านใหม่ทุกครั้งหลังจากโหลดข้อมูล
        
        console.log('🔍 Filtering designs - Search:', searchText, 'Tab:', activeTab);
        
        designItems.forEach(item => {
            const type = item.dataset.type;
            const keywords = item.dataset.keywords.toLowerCase();
            const title = item.querySelector('h4').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            const matchesSearch = searchText === '' || 
                                keywords.includes(searchText) || 
                                title.includes(searchText) || 
                                description.includes(searchText);
                                
            const matchesType = activeTab === 'all' || type === activeTab.toLowerCase();
            
            // ใช้ setTimeout เพื่อให้ animation ทำงานเป็นลำดับ
            if (matchesSearch && matchesType) {
                setTimeout(() => {
                    item.style.display = 'block';
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    });
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 200);
            }
        });
        
        updateDesignsCount();
    }
    
    function updateDesignsCount() {
        const visibleDesigns = document.querySelectorAll('.design-item[style="display: block"]').length;
        console.log(`📊 Found ${visibleDesigns} matching designs`);
    }
    
    // Event Listeners
    searchInput.addEventListener('input', filterDesigns);
    
    designTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            designTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterDesigns();
        });
    });
    
    // Initial filter
    filterDesigns();
    console.log('✅ My Designs page initialized');
}

// Initialize payment page
function initializePaymentPage() {
    console.log('💳 Initializing payment page...');
    
    const paymentItems = JSON.parse(localStorage.getItem('paymentItems')) || [];
    const paymentItemsContainer = document.getElementById('payment-items');
    
    if (paymentItemsContainer && paymentItems.length > 0) {
        paymentItemsContainer.innerHTML = paymentItems.map((item, index) => `
            <div class="summary-item">
                <div class="summary-info">
                    <div class="summary-title">${item.title} #${index + 1}</div>
                    <div class="summary-price">${item.price.toLocaleString()} THB</div>
                </div>
                <div class="summary-image">
                    ${item.image}
                </div>
            </div>
        `).join('');
        
        // คำนวณยอดรวม
        const total = paymentItems.reduce((sum, item) => sum + item.price, 0);
        
        // อัพเดทยอดรวม
        const subtotalElement = document.getElementById('payment-subtotal');
        const totalElement = document.getElementById('payment-total');
        
        if (subtotalElement) subtotalElement.textContent = `${total.toLocaleString()} THB`;
        if (totalElement) totalElement.textContent = `${total.toLocaleString()} THB`;
        
        console.log('✅ Payment page initialized with', paymentItems.length, 'items');
    }
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM loaded - starting initialization...');
    
    // Initialize cart system with delay to ensure DOM is ready
    setTimeout(() => {
        updateCartIcon();
        updateCartDisplay();
        updateCartTotal();
    }, 100);
    
    // Check which page we're on
    if (window.location.pathname.includes('payment.html')) {
        initializePaymentPage();
    } else if (window.location.pathname.includes('my-designs.html')) {
        initializeMyDesigns();
    } else {
        initializeSearchAndFilter();
    }
});

// Upload Functions (ลบ event listener ซ้ำ - ใช้อันที่อยู่ใน DOMContentLoaded หลัก)

function handleFileSelect(input) {
    const file = input.files[0];
    if (file) {
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.innerHTML = `
            <div class="upload-icon">📄</div>
            <div class="upload-text">${file.name}</div>
            <div class="upload-subtext">File selected successfully</div>
        `;
    }
}

// Profile Functions
function becomeDesigner() {
    console.log('🔄 Becoming designer...');
    
    // Set designer status
    localStorage.setItem('isDesigner', 'true');
    console.log('✅ Designer status saved to localStorage');
    
    // Show designer profile immediately
    showDesignerProfile();
}

function showDesignerProfile() {
    console.log('🎨 Showing designer profile...');
    
    const profileSections = document.querySelector('.profile-sections');
    console.log('Profile sections element:', profileSections);
    
    if (profileSections) {
        console.log('✅ Found profile sections, updating content...');
        profileSections.innerHTML = `
            <div class="profile-section">
                <h3 class="section-title">Personal Info</h3>
                <div class="personal-info-grid">
                    <div class="info-row">
                        <div class="info-column">
                            <div class="info-label">Name</div>
                            <div class="info-value">Sophia Carter</div>
                        </div>
                        <div class="info-column">
                            <div class="info-label">Email</div>
                            <div class="info-value">sophia.carter@email.com</div>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-column">
                            <div class="info-label">Phone</div>
                            <div class="info-value">+1 (555) 123-4567</div>
                        </div>
                        <div class="info-column">
                            <div class="info-label">Location</div>
                            <div class="info-value">San Francisco, CA</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <h3 class="section-title">Earnings Summary</h3>
                <div class="earnings-grid">
                    <div class="earnings-card">
                        <div class="earnings-label">Total Earnings</div>
                        <div class="earnings-value">$12,500</div>
                    </div>
                    <div class="earnings-card">
                        <div class="earnings-label">Commission Rate</div>
                        <div class="earnings-value">15%</div>
                    </div>
                </div>
                <div class="earnings-monthly">
                    <div class="monthly-earnings">
                        <div class="earnings-label">Monthly Earnings</div>
                        <div class="earnings-value">$2,500</div>
                        <div class="earnings-trend">Last 6 Months: +10%</div>
                    </div>
                </div>
                <div class="earnings-chart">
                    <svg width="100%" height="100" viewBox="0 0 280 100">
                        <!-- Grid lines -->
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" stroke-width="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        <!-- Chart line -->
                        <polyline fill="none" stroke="#72B572" stroke-width="2.5" 
                                  points="20,75 65,55 110,65 155,35 200,45 245,25"/>
                        
                        <!-- Data points -->
                        <circle cx="20" cy="75" r="3" fill="#72B572"/>
                        <circle cx="65" cy="55" r="3" fill="#72B572"/>
                        <circle cx="110" cy="65" r="3" fill="#72B572"/>
                        <circle cx="155" cy="35" r="3" fill="#72B572"/>
                        <circle cx="200" cy="45" r="3" fill="#72B572"/>
                        <circle cx="245" cy="25" r="3" fill="#72B572"/>
                    </svg>
                    <div class="chart-labels">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-section">
                <div class="action-buttons-profile">
                    <button class="btn-profile btn-logout" onclick="logout()">Logout</button>
                </div>
            </div>
        `;
        console.log('✅ Designer profile content updated successfully!');
    } else {
        console.error('❌ Could not find .profile-sections element');
        
        // Try to find it after a short delay
        setTimeout(() => {
            console.log('🔄 Retrying after 500ms...');
            const retryElement = document.querySelector('.profile-sections');
            if (retryElement) {
                console.log('✅ Found element on retry, updating...');
                showDesignerProfile();
            } else {
                console.error('❌ Still could not find .profile-sections element');
            }
        }, 500);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logged out successfully');
        // Here you would handle the actual logout
    }
}

// Chart Animation
function animateChart() {
    const bars = document.querySelectorAll('.chart-bar');
    bars.forEach((bar, index) => {
        const targetHeight = bar.style.height;
        bar.style.height = '0%';
        setTimeout(() => {
            bar.style.height = targetHeight;
        }, index * 100);
    });
}

// Utility Functions
function smoothScrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Search and Filter Functionality
function initializeSearchAndFilter() {
    console.log('🔍 Initializing search and filter...');
    
    // Wait for DOM to be fully ready
    const searchInput = document.querySelector('.search-input');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const designCards = document.querySelectorAll('.design-card');
    
    console.log('Found elements:', {
        searchInput: !!searchInput,
        categoryButtons: categoryButtons.length,
        designCards: designCards.length
    });
    
    if (!searchInput || !categoryButtons.length || !designCards.length) {
        console.log('❌ Missing elements - trying again in 500ms...');
        setTimeout(initializeSearchAndFilter, 500);
        return;
    }
    
    console.log('✅ All elements found - setting up functionality...');
    
    let currentCategory = 'all';
    let currentSearchTerm = '';

    // Search function
    function filterDesigns() {
        console.log('Filtering with search:', currentSearchTerm, 'category:', currentCategory);
        
        designCards.forEach(card => {
            const title = card.querySelector('.design-title').textContent.toLowerCase();
            const keywords = card.dataset.keywords ? card.dataset.keywords.toLowerCase() : '';
            const category = card.dataset.category || '';
            
            // Better search matching - includes partial matches
            const searchText = title + ' ' + keywords;
            const matchesSearch = currentSearchTerm === '' || searchText.includes(currentSearchTerm);
            const matchesCategory = currentCategory === 'all' || category === currentCategory;
            
            console.log('Card:', title, 'matches search:', matchesSearch, 'matches category:', matchesCategory);
            
            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease-in';
            } else {
                card.style.display = 'none';
            }
        });
        
        updateResultsCount();
    }
    
    // Update results count
    function updateResultsCount() {
        const resultsText = document.querySelector('.section-title');
        if (!resultsText) return;
        
        if (currentSearchTerm || currentCategory !== 'all') {
            const visibleCount = Array.from(designCards).filter(card => 
                card.style.display !== 'none'
            ).length;
            resultsText.textContent = `${visibleCount} results found`;
        } else {
            resultsText.textContent = 'Suggestion for you';
        }
    }

    // Search input event
    searchInput.addEventListener('input', function(e) {
        currentSearchTerm = e.target.value.toLowerCase().trim();
        console.log('🔍 Search term:', currentSearchTerm);
        filterDesigns();
    });
    
    // Clear search on escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            currentSearchTerm = '';
            console.log('🔍 Search cleared');
            filterDesigns();
        }
    });
    
    // Test search immediately
    console.log('🧪 Testing search functionality...');
    searchInput.value = 'test';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    setTimeout(() => {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Search test completed');
    }, 100);

    // Category buttons event
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Category button clicked:', this.textContent);
            
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current category
            currentCategory = this.textContent.toLowerCase();
            console.log('New category:', currentCategory);
            
            // Filter designs
            filterDesigns();
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Add search suggestions
    const suggestions = ['business', 'wedding', 'marketing', 'education', 'presentation', 'social media'];
    
    searchInput.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'Try: ' + suggestions[Math.floor(Math.random() * suggestions.length)];
        }
    });
    
    searchInput.addEventListener('blur', function() {
        this.placeholder = 'Search templates';
    });
}

// Add CSS for animations
function addSearchAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .design-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .design-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .category-btn {
            transition: all 0.2s ease;
        }
        
        .category-btn:hover {
            background: #e8f4f8;
            transform: translateY(-1px);
        }
        
        .search-input:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(124, 186, 210, 0.3);
        }
        
        .design-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
    `;
    document.head.appendChild(style);
}

// Check if user is a designer and show appropriate profile
function checkDesignerStatus() {
    // ปิดการเช็คสถานะอัตโนมัติ - ให้ผู้ใช้กดเองทุกครั้ง
    localStorage.removeItem('isDesigner'); // ลบสถานะเก่าออก
}

// ฟังก์ชันรีเซ็ตโปรไฟล์กลับเป็นผู้ใช้ทั่วไป
function resetToNormalProfile() {
    localStorage.removeItem('isDesigner');
    location.reload(); // รีเฟรชหน้าเพื่อแสดงโปรไฟล์ปกติ
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeLiff();
    updateCartTotal();
    checkDesignerStatus();
    
    // Add drag and drop functionality
    const uploadArea = document.querySelector('.upload-area');
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.transform = 'translateY(-2px)';
            this.style.background = 'linear-gradient(135deg, #F5E1E1 0%, #E8C5C5 100%)';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.transform = 'translateY(0)';
            this.style.background = 'linear-gradient(135deg, #E8C5C5 0%, #F5E1E1 100%)';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.transform = 'translateY(0)';
            this.style.background = 'linear-gradient(135deg, #E8C5C5 0%, #F5E1E1 100%)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('fileInput').files = files;
                handleFileSelect(document.getElementById('fileInput'));
            }
        });
    }

    // Upload form handler
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('fileInput');
            if (!fileInput.files[0]) {
                alert('Please select a file to upload');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Uploading...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(this);
            const designData = {
                id: Date.now(),
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                price: formData.get('price'),
                free: formData.get('free') === 'on',
                filename: fileInput.files[0].name,
                uploadDate: new Date().toISOString(),
                type: formData.get('free') === 'on' ? 'free' : 'paid'
            };
            
            // Save to localStorage
            let myDesigns = JSON.parse(localStorage.getItem('myDesigns')) || [];
            myDesigns.push(designData);
            localStorage.setItem('myDesigns', JSON.stringify(myDesigns));
            
            // Simulate upload
            setTimeout(() => {
                alert('Design uploaded successfully!');
                
                // Redirect to my-designs page
                window.location.href = 'my-designs.html';
            }, 2000);
        });
    }
    
    // Initialize search and filter functionality with delay
    setTimeout(() => {
        initializeSearchAndFilter();
        addSearchAnimations();
        
        // Manual fallback test
        const testSearch = document.querySelector('.search-input');
        if (testSearch) {
            console.log('Manual test: Search input found');
            testSearch.addEventListener('input', function(e) {
                console.log('Manual search test:', e.target.value);
            });
        }
        
        const testButtons = document.querySelectorAll('.category-btn');
        testButtons.forEach((btn, index) => {
            console.log(`Manual test: Button ${index} text: "${btn.textContent}"`);
            btn.addEventListener('click', function() {
                console.log('Manual button test clicked:', this.textContent);
            });
        });
    }, 100);
});

// Global debug functions for console testing
window.debugSearch = function(term) {
    console.log('🔍 === DEBUG SEARCH ===');
    const cards = document.querySelectorAll('.design-card');
    let foundMatches = 0;
    
    cards.forEach((card, index) => {
        const title = card.querySelector('.design-title')?.textContent || 'No title';
        const keywords = card.dataset.keywords || 'No keywords';
        const category = card.dataset.category || 'No category';
        const searchText = (title + ' ' + keywords).toLowerCase();
        const matches = searchText.includes(term.toLowerCase());
        
        if (matches) foundMatches++;
        
        console.log(`Card ${index + 1}:`, {
            title: title,
            category: category,
            keywords: keywords,
            searchText: searchText,
            term: term.toLowerCase(),
            matches: matches ? '✅' : '❌'
        });
    });
    
    console.log(`\n📊 Total matches: ${foundMatches}/${cards.length}`);
    return foundMatches;
};

window.debugButtons = function() {
    console.log('📂 === DEBUG BUTTONS ===');
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach((btn, i) => {
        console.log(`Button ${i + 1}: "${btn.textContent}"`, {
            classes: Array.from(btn.classList),
            active: btn.classList.contains('active')
        });
    });
    return buttons.length;
};

window.forceInitialize = function() {
    console.log('🔄 === FORCE INITIALIZE ===');
    initializeSearchAndFilter();
    addSearchAnimations();
    return 'Initialization completed';
};

// Manual search function
window.manualSearch = function(term) {
    console.log(`🔍 Manual search for: "${term}"`);
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = term;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Search triggered');
    } else {
        console.log('❌ Search input not found');
    }
};

// Manual category filter
window.manualCategory = function(category) {
    console.log(`📂 Manual category: "${category}"`);
    const buttons = document.querySelectorAll('.category-btn');
    let found = false;
    
    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase() === category.toLowerCase()) {
            btn.click();
            found = true;
            console.log('✅ Category button clicked');
        }
    });
    
    if (!found) {
        console.log('❌ Category button not found');
    }
};

// Debug function for testing designer mode
window.testDesignerMode = function() {
    console.log('🧪 Testing designer mode...');
    console.log('Current localStorage:', localStorage.getItem('isDesigner'));
    console.log('Profile sections element:', document.querySelector('.profile-sections'));
    becomeDesigner();
};

// Reset designer mode for testing
window.resetDesignerMode = function() {
    console.log('🔄 Resetting designer mode...');
    localStorage.removeItem('isDesigner');
    console.log('✅ Designer mode reset');
    location.reload();
};

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('payment-modal')) {
        closePayment();
    }
});

// Add Designer Function
function addDesigner() {
    alert('Opening LINE to add Notty...');
    // Here you would implement the actual LINE integration
}

// Share Product Function
async function shareProduct() {
    const productTitle = document.querySelector('.product-title')?.textContent || 'Design';
    const productPrice = document.querySelector('.product-price')?.textContent || '';
    const productAuthor = document.querySelector('.product-author')?.textContent || 'Designer';
    
    try {
        // ถ้าเปิดใน LINE ให้ใช้ LIFF Share
        if (typeof liff !== 'undefined' && liff.isInClient()) {
            await liff.shareTargetPicker([{
                type: "text",
                text: `🎨 ${productTitle}\n\n` +
                      `💰 ${productPrice}\n` +
                      `👨‍🎨 By: ${productAuthor}\n\n` +
                      `View on Artiply: ${window.location.href}`
            }]);
            console.log('Shared via LINE');
            return;
        }
    } catch (error) {
        console.log('LINE share failed:', error);
    }
    
    // Fallback: ใช้ Web Share API หรือ clipboard
    if (navigator.share) {
        // Use native share API if available
        navigator.share({
            title: productTitle,
            text: `Check out this ${productTitle} for ${productPrice}`,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback for browsers without native share
        const shareText = `Check out this ${productTitle} for ${productPrice}\n${window.location.href}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Link copied to clipboard!');
            }).catch(err => {
                console.log('Error copying to clipboard:', err);
                fallbackShare(shareText);
            });
        } else {
            fallbackShare(shareText);
        }
    }
}

// Fallback share function
function fallbackShare(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Link copied to clipboard!');
}

// Go to Upload Page
function goToUpload() {
    console.log('🔄 Navigating to upload page...');
    // ตรวจสอบว่าอยู่ในโฟลเดอร์ pages หรือไม่
    if (window.location.pathname.includes('/pages/')) {
        window.location.href = 'upload.html';
    } else {
        window.location.href = 'pages/upload.html';
    }
}

// Add click effects
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        e.target.style.transform = 'scale(0.98)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1)';
        }, 100);
    }
});