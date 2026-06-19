// Ensure profile visibility on this page: hide .profile until a user logs in or registers
;(function(){
	function getStored(){ try { return JSON.parse(localStorage.getItem('ibams_user')||'null'); } catch(e){ return null; } }
	function renderProfile(){
		const data = getStored();
		const navLinks = document.querySelector('.nav .nav-links'); if (!navLinks) return;
		const formEl = navLinks.querySelector('.form');
		let profileEl = navLinks.querySelector('.profile');
		if (!profileEl){ profileEl = document.createElement('div'); profileEl.className='profile';
			const img = document.createElement('img'); img.alt='profile'; img.src=''; profileEl.appendChild(img); navLinks.appendChild(profileEl);
		}
		const img = profileEl.querySelector('img');
		if (data && data.username){ const profileImage = data.profileImage || ('/image/' + (data.username.trim().charAt(0)||'A').toUpperCase() + '.jpeg'); img.src=profileImage; img.alt=data.username; profileEl.style.display='flex'; if(formEl) formEl.style.display='none'; }
		else { profileEl.style.display='none'; if(formEl) formEl.style.display=''; }
	}
	document.addEventListener('DOMContentLoaded', renderProfile);
	window.addEventListener('storage', renderProfile);
})();

// Simple cart demo: store items in localStorage under 'ibams_cart' and signal updates
;(function(){
	function getCart(){ try { return JSON.parse(localStorage.getItem('ibams_cart')||'[]'); } catch(e){ return []; } }
	function setCartLocal(c){ try { localStorage.setItem('ibams_cart', JSON.stringify(c)); } catch(e){} }

	function addToCart(item){
		const cart = getCart();
		const existing = cart.find(c=>c.id===item.id);
		if(existing){ existing.qty += 1; } else { cart.push({...item, qty:1}); }
		// Prefer centralized setter if available to trigger badge update across pages/tabs
		if(window.IBAMS && typeof window.IBAMS.setCart === 'function'){
			// suppress the generic update toast (cart-notify) because we'll emit an item-added event
			if(typeof window.IBAMS.suppressNextUpdateToast === 'function') window.IBAMS.suppressNextUpdateToast();
			window.IBAMS.setCart(cart);
		} else {
			setCartLocal(cart);
			// notify same-tab listeners
			window.dispatchEvent(new Event('ibams_cart_updated'));
		}

		// announce the specific item that was added so other pages can show a detailed toast
		try{ window.dispatchEvent(new CustomEvent('ibams_cart_item_added', { detail: { item } })); } catch(e){}
	}

	document.addEventListener('DOMContentLoaded', ()=>{
		document.querySelectorAll('.add-to-cart').forEach(btn=>{
			btn.addEventListener('click', (e)=>{
				const card = e.target.closest('.product-card');
				if(!card) return;
				const id = card.getAttribute('data-id');
				const title = card.getAttribute('data-title') || card.querySelector('.product-title')?.textContent || 'Product';
				const price = parseFloat(card.getAttribute('data-price')||'0') || 0;
				addToCart({ id, title, price });
				// tiny feedback
				const orig = e.target.textContent;
				e.target.textContent = 'Added';
				setTimeout(()=> e.target.textContent = orig, 900);
			});
		});

		// Handle View button clicks
		document.querySelectorAll('.view-btn').forEach(btn=>{
			btn.addEventListener('click', (e)=>{
				const card = e.target.closest('.product-card');
				if(!card) return;
				const id = card.getAttribute('data-id');
				window.location.href = `products-detail.html?id=${encodeURIComponent(id)}`;
			});
		});
	});

	// keep listening to storage so this page updates if cart changes elsewhere
	window.addEventListener('storage', (e)=>{ if(e.key === 'ibams_cart') { if(window.IBAMS && typeof window.IBAMS.getCart === 'function') window.IBAMS.getCart(); } });
})();
