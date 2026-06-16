// cart-badge.js
// Keeps the .cart-badge in the nav synchronized with localStorage['ibams_cart']
// Listens for storage events (other tabs) and a custom 'ibams_cart_updated' event (same-tab).
(function(){
  function safeParse(key, fallback){ try{ return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }catch(e){ return fallback; } }
  function getCart(){ return safeParse('ibams_cart', []); }

  function updateCartBadge(){
    const navLinks = document.querySelector('.nav .nav-links'); if(!navLinks) return;
    let badge = navLinks.querySelector('.cart-badge');
    if(!badge){ badge = document.createElement('span'); badge.className = 'cart-badge';
      // try to place badge next to any .cart anchor if present
      const cartAnchor = navLinks.querySelector('.cart');
      if(cartAnchor) cartAnchor.appendChild(badge); else navLinks.appendChild(badge);
    }
    const cnt = getCart().reduce((s,i)=>s + (i.qty||0), 0);
    badge.textContent = cnt || '';
    badge.style.display = cnt ? 'inline-block' : 'none';
  }

  // expose a helper for other scripts to update and trigger the badge
  window.IBAMS = window.IBAMS || {};
  window.IBAMS.getCart = getCart;
  window.IBAMS.setCart = function(cart){ try{ localStorage.setItem('ibams_cart', JSON.stringify(cart)); }catch(e){}; window.dispatchEvent(new Event('ibams_cart_updated')); };

  document.addEventListener('DOMContentLoaded', updateCartBadge);
  window.addEventListener('storage', function(e){ if(e.key === 'ibams_cart' || e.key === null) updateCartBadge(); });
  window.addEventListener('ibams_cart_updated', updateCartBadge);
})();
