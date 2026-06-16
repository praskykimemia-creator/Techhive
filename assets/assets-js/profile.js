// profile.js
// Purpose: render a small avatar in the navbar when a user profile exists in localStorage
// Behavior:
//  - Reads localStorage['ibams_user'] (JSON with at least { username, profileImage? }).
//  - Tries the explicitly provided profileImage first (if any), then attempts common
//    static folders: /image/ and /images/ using the username initial (A.jpeg/JPG).
//  - If no reachable image is found, falls back to a generated SVG data URL showing
//    the user's initial.
//  - Hides the .form (login/register links) when a profile is present and updates
//    when storage changes (other tabs).
document.addEventListener('DOMContentLoaded', () => {
  function getStored() {
    try { return JSON.parse(localStorage.getItem('ibams_user') || 'null'); } catch (e) { return null; }
  }

  function renderProfile() {
    const data = getStored();
    const navLinks = document.querySelector('.nav .nav-links');
    if (!navLinks) return;

    // find .form (login/register links) and .profile container
    const formEl = navLinks.querySelector('.form');
    let profileEl = navLinks.querySelector('.profile');
    if (!profileEl) {
      profileEl = document.createElement('div');
      profileEl.className = 'profile';
      const img = document.createElement('img');
      img.alt = 'profile';
      img.src = '';
      profileEl.appendChild(img);
      navLinks.appendChild(profileEl);
    }

    const img = profileEl.querySelector('img');
    if (data && data.username) {
      // build candidate static paths (user can supply profileImage or we try common folders)
      const initial = (data.username.trim().charAt(0) || 'A').toUpperCase();
      const candidates = [];
      if (data.profileImage) candidates.push(data.profileImage);
      // try both singular and plural folder names to be forgiving
      candidates.push('/user-images/' + initial + '.jpeg');
      candidates.push('/user-images/' + initial + '.jpg');
      candidates.push('/user-images/' + initial + '.jpeg');
      candidates.push('/user-images/' + initial + '.jpg');

      // hide image until we have a working source to avoid broken icon flicker
      img.style.visibility = 'hidden';

      // try candidates sequentially and fall back to generated SVG with initials
      function loadFirstAvailable(srcs) {
        return new Promise(resolve => {
          let i = 0;
          function tryNext() {
            if (i >= srcs.length) return resolve(null);
            const src = srcs[i++];
            const tester = new Image();
            tester.onload = () => resolve(src);
            tester.onerror = tryNext;
            // add a cache-busting param for safety when testing user-provided paths
            tester.src = src + (src.indexOf('?') === -1 ? '?v=1' : '&v=1');
          }
          tryNext();
        });
      }

      function svgDataUrlFor(name) {
        const initialCh = (name.trim().charAt(0) || 'A').toUpperCase();
        const bg = '#6c7ae0';
        const fg = '#ffffff';
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' fill='${bg}' rx='12' ry='12'/><text x='50%' y='50%' dy='0.36em' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='44' fill='${fg}'>${initialCh}</text></svg>`;
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
      }

      loadFirstAvailable(candidates).then(found => {
        const finalSrc = found || svgDataUrlFor(data.username);
        img.src = finalSrc;
        img.alt = data.username;
        img.style.visibility = 'visible';
        profileEl.style.display = 'flex';
        if (formEl) formEl.style.display = 'none';
        // make profile clickable to allow logout/menu
        try {
          img.style.cursor = 'pointer';
          // attach a toggle menu handler once
          if (!profileEl.dataset.menuAttached) {
            profileEl.dataset.menuAttached = '1';
                let menuEl = null;
                let overlayEl = null;

                function closeMenu() {
                  if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl);
                  if (overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
                  menuEl = null; overlayEl = null;
                  document.removeEventListener('keydown', onKey);
                  document.removeEventListener('click', onDocClick, true);
                }

                function onDocClick(ev) {
                  if (!menuEl) return;
                  if (menuEl.contains(ev.target) || profileEl.contains(ev.target)) return;
                  closeMenu();
                }

                function onKey(ev){ if(ev.key === 'Escape') closeMenu(); }

                function showLogoutConfirm(){
                  return new Promise(resolve => {
                    // modal overlay + box
                    const ov = document.createElement('div');
                    overlayEl = ov;
                    ov.style.position = 'fixed'; ov.style.left = '0'; ov.style.top = '0'; ov.style.right = '0'; ov.style.bottom = '0';
                    ov.style.background = 'rgba(0,0,0,0.35)'; ov.style.zIndex = 3000; ov.style.display = 'flex'; ov.style.alignItems = 'center'; ov.style.justifyContent = 'center';

                    const box = document.createElement('div');
                    box.style.background = '#fff'; box.style.padding = '18px'; box.style.borderRadius = '10px'; box.style.minWidth = '300px'; box.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
                    const msg = document.createElement('div'); msg.textContent = 'Are you sure you want to logout?'; msg.style.marginBottom = '12px';
                    const actions = document.createElement('div'); actions.style.display = 'flex'; actions.style.gap = '8px'; actions.style.justifyContent = 'flex-end';
                    const btnCancel = document.createElement('button'); btnCancel.textContent = 'Cancel'; btnCancel.style.padding='8px 12px'; btnCancel.style.border='none'; btnCancel.style.borderRadius='6px'; btnCancel.style.cursor='pointer';
                    const btnConfirm = document.createElement('button'); btnConfirm.textContent = 'Logout'; btnConfirm.style.padding='8px 12px'; btnConfirm.style.background='#ff5a5f'; btnConfirm.style.color='#fff'; btnConfirm.style.border='none'; btnConfirm.style.borderRadius='6px'; btnConfirm.style.cursor='pointer';
                    actions.appendChild(btnCancel); actions.appendChild(btnConfirm);
                    box.appendChild(msg); box.appendChild(actions);
                    ov.appendChild(box);
                    document.body.appendChild(ov);

                    function cleanup(){ try{ if(ov && ov.parentNode) ov.parentNode.removeChild(ov); }catch(e){} document.removeEventListener('keydown', onKey); }
                    btnCancel.addEventListener('click', ()=>{ cleanup(); resolve(false); });
                    btnConfirm.addEventListener('click', ()=>{ cleanup(); resolve(true); });
                    document.addEventListener('keydown', onKey);
                  });
                }

                function openMenu() {
                  closeMenu();
                  menuEl = document.createElement('div');
                  menuEl.className = 'profile-menu';
                  // style as a side dropdown (right of avatar)
                  const rect = profileEl.getBoundingClientRect();
                  menuEl.style.position = 'absolute';
                  menuEl.style.width = '220px';
                  menuEl.style.background = '#fff';
                  menuEl.style.color = '#222';
                  menuEl.style.border = '1px solid rgba(0,0,0,0.08)';
                  menuEl.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                  menuEl.style.borderRadius = '8px';
                  menuEl.style.padding = '8px';
                  menuEl.style.zIndex = 2001;
                  // position to the right and vertically centered with avatar
                  const top = Math.max(8, rect.top + window.scrollY - 8);
                  const left = rect.right + 8 + window.scrollX;
                  menuEl.style.left = left + 'px';
                  menuEl.style.top = top + 'px';
                  menuEl.style.transform = 'translateX(8px)';
                  menuEl.style.transition = 'transform 160ms ease, opacity 160ms ease';
                  menuEl.style.opacity = '0';

                  // contents: username, my account link, logout
                  const name = document.createElement('div');
                  name.textContent = data.username || '';
                  name.style.fontWeight = '700';
                  name.style.padding = '8px';
                  name.style.borderBottom = '1px solid rgba(0,0,0,0.04)';

                  const acct = document.createElement('a');
                  acct.href = '/account/index.html';
                  acct.textContent = 'My account';
                  acct.style.display = 'block';
                  acct.style.padding = '10px 8px';
                  acct.style.color = '#222';
                  acct.style.textDecoration = 'none';
                  acct.style.borderRadius = '6px';
                  acct.addEventListener('mouseover', ()=> acct.style.background = 'rgba(0,0,0,0.03)');
                  acct.addEventListener('mouseout', ()=> acct.style.background = '');

                  const logout = document.createElement('button');
                  logout.type = 'button';
                  logout.textContent = 'Logout';
                  logout.style.marginTop = '8px';
                  logout.style.width = '100%';
                  logout.style.padding = '10px';
                  logout.style.border = 'none';
                  logout.style.background = '#ff5a5f';
                  logout.style.color = '#fff';
                  logout.style.borderRadius = '6px';
                  logout.style.cursor = 'pointer';

                  logout.addEventListener('click', async ()=>{
                    const ok = await showLogoutConfirm();
                    if(!ok) return;
                    try { localStorage.removeItem('ibams_user'); } catch(e){}
                    try { renderProfile(); } catch(e){}
                    closeMenu();
                  });

                  menuEl.appendChild(name);
                  menuEl.appendChild(acct);
                  menuEl.appendChild(logout);
                  document.body.appendChild(menuEl);
                  // animate in
                  requestAnimationFrame(()=>{ menuEl.style.opacity='1'; menuEl.style.transform='translateX(0)'; });
                  // listen for outside clicks and escape
                  document.addEventListener('click', onDocClick, true);
                  document.addEventListener('keydown', onKey);
                }

                profileEl.addEventListener('click', (ev)=>{
                  ev.preventDefault(); ev.stopPropagation();
                  // toggle
                  const existing = document.querySelector('.profile-menu');
                  if (existing) { existing.parentNode.removeChild(existing); return; }
                  openMenu();
                });
              }
            } catch (e) { /* ignore if menu can't be attached */ }
      });
    } else {
      // show login/register links
      profileEl.style.display = 'none';
      if (formEl) formEl.style.display = '';
    }
  }

  renderProfile();
  // re-render when storage changes in other tabs
  window.addEventListener('storage', renderProfile);
});
