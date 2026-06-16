// cart-notify.js
// Small toast notification for cart actions. Listens for
// - 'ibams_cart_item_added' with detail { item } to show an "Added" toast
// - 'ibams_cart_updated' to optionally show a brief update (used for removals)
(function(){
  function createContainer(){
    let c = document.getElementById('ibams-toast-container');
    if(c) return c;
    c = document.createElement('div');
    c.id = 'ibams-toast-container';
    c.style.position = 'fixed';
    c.style.right = '18px';
    c.style.bottom = '18px';
    c.style.zIndex = 2000;
    c.style.display = 'flex';
    c.style.flexDirection = 'column';
    c.style.gap = '8px';
    document.body.appendChild(c);
    return c;
  }

  function showToast(html, opts){
    const container = createContainer();
    const toast = document.createElement('div');
    toast.className = 'ibams-toast';
    toast.style.background = 'rgba(0,0,0,0.85)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 14px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
    toast.style.fontSize = '14px';
    toast.style.maxWidth = '320px';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    toast.style.transition = 'opacity 220ms ease, transform 220ms ease';
    toast.innerHTML = html;
    container.appendChild(toast);
    // animate in
    requestAnimationFrame(()=>{ toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
    const ttl = (opts && opts.ttl) || 2200;
    const id = setTimeout(()=>{
      toast.style.opacity = '0'; toast.style.transform = 'translateY(6px)';
      setTimeout(()=>{ try{ container.removeChild(toast); }catch(e){} }, 260);
    }, ttl);
    // allow click to dismiss
    toast.addEventListener('click', ()=>{ clearTimeout(id); toast.style.opacity = '0'; toast.style.transform = 'translateY(6px)'; setTimeout(()=>{ try{ container.removeChild(toast); }catch(e){} }, 260); });
  }

  // handle added-item events
  window.addEventListener('ibams_cart_item_added', (e)=>{
    try{
      const item = (e && e.detail && e.detail.item) || null;
      const name = item && item.title ? item.title : 'Item';
      showToast(`<strong>${escapeHtml(name)}</strong> added to cart. <a href=\"/cart/index.html\" style=\"color:#ffd; text-decoration:underline; margin-left:8px\">View cart</a>`);
    }catch(err){ /* ignore */ }
  });

  // simple escape helper
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  // optionally show a short notice for generic cart updates (like removals)
  let suppressNextUpdate = false;
  window.addEventListener('ibams_cart_updated', ()=>{
    if(suppressNextUpdate){ suppressNextUpdate = false; return; }
    // show a subtle update toast
    showToast('Cart updated', { ttl: 1400 });
  });

  // expose helper to suppress the generic update toast when dispatching more specific events
  window.IBAMS = window.IBAMS || {};
  window.IBAMS.suppressNextUpdateToast = function(){ suppressNextUpdate = true; };
})();
