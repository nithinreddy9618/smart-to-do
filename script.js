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

  // Login form submit handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Get values
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    // Send login request
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned invalid JSON');
      }
      if (!res.ok) throw new Error(data.error || 'Login failed');
      // Save token if needed: localStorage.setItem('token', data.token);
      // Hide auth card, show main app
      document.querySelector('.auth-bg').style.display = 'none';
      document.getElementById('main-app').style.display = 'block';
    } catch (err) {
      document.getElementById('login-error').textContent = err.message;
    }
  });
});
  