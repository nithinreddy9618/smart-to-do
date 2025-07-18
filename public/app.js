document.addEventListener('DOMContentLoaded', () => {
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const mainApp = document.getElementById('main-app');
  const authBg = document.querySelector('.auth-bg');

  // Toggle forms
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


  const authContainer = document.getElementById('auth-container');
 
  const loginError = document.getElementById('login-error');

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      // Use 'email' to match backend
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
          // Login successful
          authContainer.style.display = 'none';
          mainApp.style.display = 'flex';
          loginError.textContent = '';
        } else {
          // Login failed
          loginError.textContent = data.error || data.message || 'Invalid email or password';
        }
      } catch (err) {
        loginError.textContent = 'Server error. Please try again later.';
      }
    });
  }

  // Register
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('token', data.token);
      authBg.style.display = 'none';
      mainApp.style.display = 'block';
      loadTasks();
      alert('Registration successful!');
    } catch (err) {
      document.getElementById('register-error').textContent = err.message;
      alert('Registration failed: ' + err.message);
    }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    mainApp.style.display = 'none';
    authBg.style.display = 'flex';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  });

  // Forgot Password
  document.querySelector('.forgot-link').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('forgot-modal').style.display = 'block';
    document.querySelector('.auth-bg').style.display = 'flex';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
  });

  document.getElementById('close-forgot').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('forgot-modal').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  });

  document.getElementById('forgot-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset link');
      alert('If this email is registered, a reset link has been sent.');
      document.getElementById('forgot-modal').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
    } catch (err) {
      document.getElementById('forgot-error').textContent = err.message;
    }
  });

  // --- Password Reset Link Logic ---
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    // Hide all other forms
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('reset-form').style.display = 'block';

    // Optionally, store the token for use when submitting the reset form
    document.getElementById('reset-form').dataset.token = token;
  }

  // To-Do App Logic
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');

  async function loadTasks() {
    taskList.innerHTML = '<li>Loading...</li>';
    try {
      const res = await fetch('/api/tasks', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (!res.ok) throw new Error('Failed to load tasks');
      const tasks = await res.json();
      renderTasks(tasks);
    } catch (err) {
      taskList.innerHTML = `<li style="color:#fc5c7d;">${err.message}</li>`;
    }
  }

  function renderTasks(tasks) {
    taskList.innerHTML = '';
    if (!tasks.length) {
      taskList.innerHTML = '<li>No tasks yet.</li>';
      return;
    }
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.textContent = task.text;
      // Add due date/time if present
      if (task.dueDate) {
        const due = new Date(task.dueDate);
        const formatted = due.toLocaleString();
        const dueSpan = document.createElement('span');
        dueSpan.style.fontSize = '0.95em';
        dueSpan.style.color = '#6d1b7b';
        dueSpan.style.marginLeft = '10px';
        dueSpan.textContent = `(Due: ${formatted})`;
        li.appendChild(dueSpan);
      }
      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = '\uD83D\uDDD1\uFE0F';
      delBtn.className = 'action-btn';
      delBtn.onclick = async () => {
        await deleteTask(task._id);
        loadTasks();
      };
      li.appendChild(delBtn);
      taskList.appendChild(li);
    });
  }

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const dueDate = document.getElementById('due-date-input').value;
    if (!text) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ text, dueDate })
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned invalid JSON');
      }
      if (!res.ok) throw new Error(data.error || 'Failed to add task');
      taskInput.value = '';
      document.getElementById('due-date-input').value = '';
      loadTasks();
      alert('Task added successfully!');
    } catch (err) {
      alert('Error adding task: ' + err.message);
    }
  });

  async function deleteTask(id) {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      loadTasks();
      alert('Task deleted successfully!');
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  }

  document.getElementById('reset-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const token = e.target.dataset.token; // get the token from the form's dataset

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      alert('Password reset successful! You can now log in.');
      // Optionally redirect to login
      window.location.href = '/';
    } catch (err) {
      document.getElementById('reset-error').textContent = err.message;
    }
  });
}); 