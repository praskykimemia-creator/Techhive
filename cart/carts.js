(function(){
    function safeParse(key, fallback){ try{ return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }catch(e){ return fallback; } }
    function getCart(){ return safeParse('ibams_cart', []); }
    function setCart(cart){ localStorage.setItem('ibams_cart', JSON.stringify(cart)); window.dispatchEvent(new Event('storage')); }
    function formatPrice(n){ return '$' + (n||0).toFixed(2); }

    function updateNavBadge(){
        const badge = document.querySelector('.nav .nav-links .cart-badge');
        if(!badge) return;
        const cnt = getCart().reduce((s,i)=>s+i.qty,0);
        badge.textContent = cnt || '';
        badge.style.display = cnt ? 'inline-block' : 'none';
    }

    function renderEmpty(container){ container.innerHTML = '<div class="empty-cart">Your cart is empty.<br><a href="products.html">Continue shopping</a></div>'; }

    function renderCart(container){ const cart = getCart(); if(!cart.length){ renderEmpty(container); return; }
        const table = document.createElement('table'); table.className='cart-table';
        const thead = document.createElement('thead'); thead.innerHTML = '<tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr>';
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        cart.forEach(item => {
            const tr = document.createElement('tr');
            const tdItem = document.createElement('td');
            tdItem.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><img class=\"cart-item-img\" src=\"\" alt=\"\"><div><div>${item.title}</div><div style=\"color:#888;font-size:12px\">ID: ${item.id}</div></div></div>`;
            const tdPrice = document.createElement('td'); tdPrice.textContent = formatPrice(item.price);
            const tdQty = document.createElement('td');
            tdQty.innerHTML = `<div class="qty-controls"><button data-action=\"dec\">-</button><span class="qty">${item.qty}</span><button data-action=\"inc\">+</button></div>`;
            const tdTotal = document.createElement('td'); tdTotal.textContent = formatPrice(item.price * item.qty);
            const tdRemove = document.createElement('td'); tdRemove.innerHTML = `<button class="remove-btn">Remove</button>`;
            tr.appendChild(tdItem); tr.appendChild(tdPrice); tr.appendChild(tdQty); tr.appendChild(tdTotal); tr.appendChild(tdRemove);
            // attach dataset for handlers
            tr.dataset.id = item.id;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.innerHTML = '';
        container.appendChild(table);

        const subtotal = cart.reduce((s,i)=>s + (i.price * i.qty), 0);
        const footer = document.createElement('div'); footer.className='checkout-row';
        const left = document.createElement('div'); left.innerHTML = `<div><strong>Subtotal:</strong> ${formatPrice(subtotal)}</div>`;
        const right = document.createElement('div'); right.innerHTML = `<button class="checkout-btn">Checkout</button>`;
        footer.appendChild(left); footer.appendChild(right);
        container.appendChild(footer);

        // handlers
        container.querySelectorAll('[data-action]').forEach(btn=>{
            btn.addEventListener('click', (e)=>{
                const action = btn.getAttribute('data-action');
                const tr = btn.closest('tr'); if(!tr) return;
                const id = tr.dataset.id;
                const cart = getCart(); const idx = cart.findIndex(c=>c.id===id); if(idx<0) return;
                if(action==='inc'){ cart[idx].qty += 1; }
                else if(action==='dec'){ cart[idx].qty -= 1; if(cart[idx].qty <= 0) cart.splice(idx,1); }
                setCart(cart); renderCart(container); updateNavBadge();
            });
        });

        container.querySelectorAll('.remove-btn').forEach(btn=>{
            btn.addEventListener('click', (e)=>{
                const tr = e.target.closest('tr'); if(!tr) return; const id = tr.dataset.id;
                let cart = getCart(); cart = cart.filter(c=>c.id !== id); setCart(cart); renderCart(container); updateNavBadge();
            });
        });

        container.querySelector('.checkout-btn').addEventListener('click', ()=>{
            // simple demo: clear cart
            setCart([]); renderEmpty(container); updateNavBadge(); alert('Thank you — this is a demo checkout and has cleared the cart.');
        });
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        const container = document.getElementById('cart-main'); if(!container) return;
        updateNavBadge(); renderCart(container);
    });

    // react to changes from other tabs
    window.addEventListener('storage', (e)=>{ if(e.key === 'ibams_cart' || e.key === null) { const container = document.getElementById('cart-main'); if(container) renderCart(container); updateNavBadge(); } });

})();
