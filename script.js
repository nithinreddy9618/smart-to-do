document.addEventListener('DOMContentLoaded', () => {
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (showRegister && loginForm && registerForm) {
    showRegister.addEventListener('click', function(e) {
      e.preventDefault();
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    });
  }
  if (showLogin && loginForm && registerForm) {
    showLogin.addEventListener('click', function(e) {
      e.preventDefault();
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }

  // Add your login/register form submit logic here!

  // Show reset form if token is present in URL
  window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      document.querySelector('.auth-bg').style.display = 'flex';
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('register-form').style.display = 'none';
      document.getElementById('reset-form').style.display = 'block';
    }
  });

  // Handle reset form submit
  document.getElementById('reset-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const password = document.getElementById('new-password').value;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      document.getElementById('reset-error').textContent = 'Invalid or missing token.';
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      alert('Password reset successful! You can now log in.');
      // Remove token from URL and show login form
      window.location.href = 'index.html';
    } catch (err) {
      document.getElementById('reset-error').textContent = err.message;
    }
  });

  // Back to login from reset
  document.getElementById('show-login-from-reset').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('reset-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  });
  
}); // <-- Properly close the DOMContentLoaded event listener
  