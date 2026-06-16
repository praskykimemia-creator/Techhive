// Product database
const productDatabase = {
  'laptop-quantum-14': {
    title: 'QuantumBook 14',
    price: 599.99,
    image: 'products/product-images/Laptop 1.jpg',
    description: 'An exceptional entry-level laptop designed for everyday productivity and seamless multitasking. With a sleek silver chassis and a vibrant display, it balances efficiency and style perfectly for students and remote workers.',
    processor: 'Intel Core i5 / AMD Ryzen 5',
    ram: '8GB DDR4',
    storage: '512GB NVMe SSD',
    display: '14" FHD (1920 x 1080) IPS'
  },
  'laptop-apex-ultraslim': {
    title: 'Apex UltraSlim 13',
    price: 1099.00,
    image: 'products/product-images/Laptop 2.jpg',
    description: 'Ultra-thin, ultra-light, and ultra-powerful. The Apex UltraSlim 13 is engineered for the modern professional on the move, featuring a premium aluminum unibody, exceptional battery life, and a brilliant bezel-less display.',
    processor: 'Intel Core i7 / Apple M-Series Equivalent',
    ram: '16GB LPDDR5',
    storage: '512GB Gen4 SSD',
    display: '13.4" QHD+ (2560 x 1600) Touchscreen'
  },
  'laptop-titan-gaming': {
    title: 'Titan X Gaming 15',
    price: 1549.99,
    image: 'products/product-images/Laptop 3.jpg',
    description: 'Unleash raw gaming performance with the Titan X. Packed with a high-end dedicated graphics card, advanced thermal cooling, and an RGB backlit keyboard, this machine is built to dominate AAA titles and competitive esports.',
    processor: 'Intel Core i9 / AMD Ryzen 9',
    ram: '32GB DDR5',
    storage: '1TB NVMe Gen4 SSD',
    display: '15.6" FHD (1920 x 1080) 240Hz'
  },
  'laptop-nexus-lite': {
    title: 'Nexus Lite Chromebook',
    price: 349.00,
    image: 'products/product-images/Laptop 4.jpg',
    description: 'The perfect budget-friendly companion for web browsing, streaming, and schoolwork. Fast, secure, and running on a lightweight OS, it boots up in seconds and lasts all day on a single charge.',
    processor: 'Intel Celeron / ARM Octa-Core',
    ram: '4GB LPDDR4X',
    storage: '128GB eMMC',
    display: '14" HD (1366 x 768) Anti-Glare'
  },
  'laptop-horizon-creator': {
    title: 'Horizon Creator Studio',
    price: 1899.99,
    image: 'products/product-images/Laptop 5.jpg',
    description: 'A masterpiece tailored for digital artists, video editors, and 3D modelers. The Horizon Creator Studio pairs blistering processing power with a color-accurate display to bring your creative visions to life without compromise.',
    processor: 'AMD Ryzen 9 / Intel Core i9',
    ram: '32GB DDR5',
    storage: '2TB NVMe Gen4 SSD',
    display: '16" 4K OLED (3840 x 2400) 100% DCI-P3'
  },
  'laptop-vanguard-pro': {
    title: 'Vanguard Pro 16',
    price: 1249.00,
    image: 'products/product-images/Laptop 6.jpg',
    description: 'The ultimate enterprise-grade flagship. Designed with robust security features, a tactile keyboard, and versatile connectivity ports, the Vanguard Pro 16 is built to handle heavy corporate workloads with enterprise-level stability.',
    processor: 'Intel Core i7 vPro',
    ram: '16GB DDR5',
    storage: '1TB NVMe SSD',
    display: '16" WUXGA (1920 x 1200) ComfortView'
  }
};

// Handle page load
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId || !productDatabase[productId]) {
    document.querySelector('.product-detail-content').innerHTML = '<p style="text-align:center; padding: 40px;">Product not found. <a href="products.html">Back to Products</a></p>';
    return;
  }

  const product = productDatabase[productId];

  // Update page content
  document.getElementById('product-title').textContent = product.title;
  document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
  document.getElementById('product-image').src = product.image;
  document.getElementById('product-image').alt = product.title;
  document.getElementById('product-desc').textContent = product.description;
  
  // ONLY CHANGED THESE BITS TO MATCH THE NEW LAPTOP PROPERTIES
  document.getElementById('product-material').textContent = product.processor;
  document.getElementById('product-size').textContent = product.ram;
  document.getElementById('product-color').textContent = product.storage;
  
  document.title = product.title + ' - IBAMS Bracelets';

  // Handle Add to Cart
  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const qty = parseInt(document.getElementById('product-qty').value) || 1;
    addToCartFromDetail(productId, product, qty);
  });
});

function addToCartFromDetail(productId, product, qty) {
  try {
    // Get current cart
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('ibams_cart') || '[]');
    } catch (e) {
      cart = [];
    }

    // Find if product already in cart
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: productId,
        title: product.title,
        price: product.price,
        qty: qty
      });
    }

    // Save cart
    localStorage.setItem('ibams_cart', JSON.stringify(cart));

    // Dispatch update events
    if (window.IBAMS && typeof window.IBAMS.setCart === 'function') {
      if (typeof window.IBAMS.suppressNextUpdateToast === 'function') {
        window.IBAMS.suppressNextUpdateToast();
      }
      window.IBAMS.setCart(cart);
    } else {
      window.dispatchEvent(new Event('ibams_cart_updated'));
    }

    // Announce the item added
    try {
      window.dispatchEvent(new CustomEvent('ibams_cart_item_added', { detail: { item: { ...product, id: productId, qty } } }));
    } catch (e) { }

    // Show feedback
    const btn = document.getElementById('add-to-cart-btn');
    const orig = btn.textContent;
    btn.textContent = 'Added to Cart!';
    setTimeout(() => {
      btn.textContent = orig;
    }, 1500);
  } catch (e) {
    console.error('Error adding to cart:', e);
  }
}