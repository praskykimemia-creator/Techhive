document.addEventListener('DOMContentLoaded', ()=>{
      try{
        const info = document.getElementById('account-info');
        const raw = localStorage.getItem('ibams_user');
        const user = raw ? JSON.parse(raw) : null;
        if(!user){ info.innerHTML = '<p>You are not logged in. <a href="/login/index.html">Login</a></p>'; return; }
        info.innerHTML = `<p><strong>Username:</strong> ${user.username || ''}</p><p><strong>Ticket:</strong> ${user.ticket || 'n/a'}</p>`;
      }catch(e){}
    });