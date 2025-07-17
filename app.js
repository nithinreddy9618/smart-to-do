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

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      authBg.style.display = 'none';
      mainApp.style.display = 'block';
      loadTasks();
    } catch (err) {
      document.getElementById('login-error').textContent = err.message;
    }
  });

  // Register
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
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
    } catch (err) {
      document.getElementById('register-error').textContent = err.message;
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

  // To-Do App Logic
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');

  async function loadTasks() {
    taskList.innerHTML = '<li>Loading...</li>';
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
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
      li.textContent = task.text;
      li.className = 'task-item';
      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑️';
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
    if (!text) return;
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ text })
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned invalid JSON');
      }
      if (!res.ok) throw new Error(data.error || 'Failed to add task');
      taskInput.value = '';
      loadTasks();
    } catch (err) {
      alert('Error adding task.');
    }
  });

  async function deleteTask(id) {
    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
  }
}); 