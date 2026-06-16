// Per-page initializer for login — uses shared /assets/js/password-validator.js
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initPasswordValidator !== 'function') return;
  initPasswordValidator({
    passwordSelector: '#password',
    feedbackSelector: '#password-feedback',
    submitSelector: '#login-btn',
    minLength: 6
  });

  // Ensure all required fields are filled and submit via fetch so we can redirect back
  const form = document.querySelector('.login-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // browser-level required checks
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      // Authenticate against stored tickets (ibams_ticket_*) in localStorage.
      // If a matching ticket is found (username/email + password), create a session
      // `ibams_user` (no password) and preserve the ticket id on the session entry.
      try {
        const fd = new FormData(form);
        const usernameOrEmail = (fd.get('username') || '').toString();
        const password = (fd.get('password') || '').toString();

        let foundTicket = null;
        // scan localStorage keys for tickets (very small demo data expected)
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith('ibams_ticket_')) continue;
          try {
            const payload = JSON.parse(localStorage.getItem(key) || 'null');
            if (!payload) continue;
            // match by username or email
            const uname = (payload.username || '').toString();
            const email = (payload.email || '').toString();
            if ((usernameOrEmail === uname || usernameOrEmail === email) && password === (payload.password || '')) {
              foundTicket = { key, payload }; break;
            }
          } catch (e) { /* ignore malformed */ }
        }

        if (foundTicket) {
          const payload = foundTicket.payload;
          const initial = (payload.username || payload.email || '').trim().charAt(0).toUpperCase() || 'A';
          const session = { username: payload.username || payload.email, profileImage: '/image/' + initial + '.jpeg', ticket: foundTicket.key };
          localStorage.setItem('ibams_user', JSON.stringify(session));
        } else {
          // Refuse login if username and password don't exist in localStorage
          showCustomAlert('Invalid username or password. Please check your credentials.');
          return;
        }
      } catch (e) {}
      // Prefer returning to the page that linked to /login (document.referrer).
      (function navigateAfterLogin() {
        const action = form.getAttribute('action') || '/';
        let target = null;
        try {
          const ref = document.referrer;
          if (ref && ref !== window.location.href) {
            try { new URL(ref); target = ref; } catch (_) { target = null; }
          }
        } catch (e) { /* ignore */ }

        if (!target) target = action || '/';

        // avoid redirecting back to login itself
        try {
          const curPath = new URL(window.location.href).pathname;
          const tgtPath = new URL(target, window.location.href).pathname;
          if (tgtPath === curPath) target = '/';
        } catch (e) { /* ignore */ }

        window.location.href = target;
      })();
    });
  }
});
// Custom centered alert with white background
function showCustomAlert(message) {

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;


  const alertBox = document.createElement('div');
  alertBox.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 8px;
    text-align: center;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
  `;


  const messageText = document.createElement('p');
  messageText.textContent = message;
  messageText.style.cssText = `
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #333;
    line-height: 1.5;
  `;
  alertBox.appendChild(messageText);

  const okButton = document.createElement('button');
  okButton.textContent = 'OK';
  okButton.style.cssText = `
    background: #222;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s ease;
  `;
  okButton.onmouseover = () => okButton.style.background = '#444';
  okButton.onmouseout = () => okButton.style.background = '#222';
  okButton.onclick = () => {
    overlay.remove();
  };
  alertBox.appendChild(okButton);

  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);


  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}