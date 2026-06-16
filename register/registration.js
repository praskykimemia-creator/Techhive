// Per-page initializer for register — uses shared /assets/js/password-validator.js
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initPasswordValidator !== 'function') return;
  initPasswordValidator({
    passwordSelector: '#password',
    confirmSelector: '#confirm-password',
    feedbackSelector: '#password-feedback',
    submitSelector: '#register-btn',
    minLength: 6
  });

  const form = document.querySelector('.reg-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Use browser validation first
      if (!form.checkValidity()) { form.reportValidity(); return; }
      // Persist registration under a generated ticket key so credentials are stored
      // under a unique identifier while keeping a lightweight `ibams_user` session
      // object for profile rendering. NOTE: storing passwords in localStorage is
      // insecure and only intended for static-host demos.
      try {
        const fd = new FormData(form);
        const first = (fd.get('firstname') || '').toString();
        const last = (fd.get('lastname') || '').toString();
        const username = (fd.get('username') || '').toString() || (first || '').trim();
        const email = (fd.get('email') || '').toString();
        const password = (fd.get('password') || '').toString();

        // generate a small ticket id
        const rnd = Math.random().toString(36).slice(2,8);
        const ticketId = 'ibams_ticket_' + Date.now() + '_' + rnd;

        const ticketPayload = {
          id: ticketId,
          username: username || email || ('user' + Date.now()),
          firstname: first,
          lastname: last,
          email: email,
          // WARNING: password stored plaintext for demo only
          password: password,
          createdAt: new Date().toISOString()
        };

        try { localStorage.setItem(ticketId, JSON.stringify(ticketPayload)); } catch (e) { /* ignore storage errors */ }

        // keep a lightweight session entry used by the profile renderer (no password here)
        const initial = (username || '').trim().charAt(0).toUpperCase() || ((first||'').trim().charAt(0)||'A').toUpperCase();
        const session = { username: ticketPayload.username, profileImage: '/image/' + initial + '.jpeg', ticket: ticketId };
        try { localStorage.setItem('ibams_user', JSON.stringify(session)); } catch (e) { /* ignore */ }
      } catch (e) { /* ignore */ }

      // Navigate to home page after successful registration
      (function navigateAfterRegister() {
        const homeUrl = 'index.html';
        window.location.href = homeUrl;
      })();
    });
  }
});
