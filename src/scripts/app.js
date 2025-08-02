// Artiply - Design Marketplace JavaScript

// LIFF Integration
let liffProfile = null;
let cartItems = [
    { id: 1, title: "Modern Minimalist Living Room", price: 25, image: "🏠" },
    { id: 2, title: "Cozy Bedroom Retreat", price: 30, image: "🛏" },
    { id: 3, title: "Contemporary Kitchen", price: 20, image: "🍽" }
];
let currentProduct = null;

// Initialize LIFF
async function initializeLiff() {
    try {
        await liff.init({ liffId: 'YOUR_LIFF_ID' });
        
        if (liff.isLoggedIn()) {
            liffProfile = await liff.getProfile();
            updateUserProfile();
        } else {
            // Mock data for demo
            liffProfile = {
                displayName: "Sophia Carter",
                pictureUrl: "",
                userId: "sophia_carter"
            };
            updateUserProfile();
        }
    } catch (error) {
        console.log('LIFF initialization failed:', error);
        // Use mock data
        liffProfile = {
            displayName: "Sophia Carter",
            pictureUrl: "",
            userId: "sophia_carter"
        };
        updateUserProfile();
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
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    document.querySelector('.cart-summary .final span').textContent = `${total}`;
}

function removeCartItem(index) {
    cartItems.splice(index, 1);
    updateCartDisplay();
    updateCartTotal();
}

function updateCartDisplay() {
    const container = document.getElementById('cartItems');
    if (cartItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Your cart is empty</p>';
        return;
    }
    
    container.innerHTML = cartItems.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image" style="background: #E8C5C5;">${item.image}</div>
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.price}</div>
            </div>
            <button class="remove-btn" onclick="removeCartItem(${index})">×</button>
        </div>
    `).join('');
}

function addToCart() {
    if (currentProduct) {
        cartItems.push({
            id: Date.now(),
            title: currentProduct.title,
            price: currentProduct.price,
            image: "🎨"
        });
        updateCartDisplay();
        updateCartTotal();
        alert('Added to cart successfully!');
        showPage('dashboard');
    }
}

function buyNow() {
    if (currentProduct) {
        cartItems = [{
            id: Date.now(),
            title: currentProduct.title,
            price: currentProduct.price,
            image: "🎨"
        }];
        proceedToPayment();
    }
}

// Payment Functions
function proceedToPayment() {
    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    document.getElementById('paymentModal').classList.add('active');
}

function closePayment() {
    document.getElementById('paymentModal').classList.remove('active');
}

function selectPayment(method) {
    document.querySelectorAll('.payment-method').forEach(pm => {
        pm.classList.remove('selected');
        pm.querySelector('.radio-btn').classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    event.currentTarget.querySelector('.radio-btn').classList.add('selected');
}

function confirmPayment() {
    closePayment();
    
    // Simulate payment processing
    setTimeout(() => {
        showPage('paymentSuccess');
        cartItems = [];
        updateCartDisplay();
        updateCartTotal();
    }, 1000);
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

// Search Function
function searchDesigns(query) {
    console.log('Searching for:', query);
    // Here you would implement the search functionality
}

// Upload Functions
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
    alert('Welcome to our Designer Program!\n\nYou can now upload and sell your designs.\nCommission rate: 15%\n\nStart uploading now!');
    showPage('upload');
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

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeLiff();
    updateCartTotal();
    
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
            
            // Simulate upload
            setTimeout(() => {
                alert('Design uploaded successfully!');
                this.reset();
                submitBtn.textContent = 'Upload Design';
                submitBtn.disabled = false;
                
                // Reset upload area
                const uploadArea = document.querySelector('.upload-area');
                if (uploadArea) {
                    uploadArea.innerHTML = `
                        <div class="upload-icon">📁</div>
                        <div class="upload-text">Upload your design template</div>
                        <div class="upload-subtext">Accepts images or ZIP files<br>Drag and drop or click to upload</div>
                    `;
                }
                
                showPage('myDesigns');
            }, 2000);
        });
    }
});

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('payment-modal')) {
        closePayment();
    }
});

// Add click effects
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        e.target.style.transform = 'scale(0.98)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1)';
        }, 100);
    }
});