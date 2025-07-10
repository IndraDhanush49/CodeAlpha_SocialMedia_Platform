document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authForms = document.getElementById('auth-forms');
  const authButtons = document.getElementById('auth-buttons');
  const userInfo = document.getElementById('user-info');
  const usernameSpan = document.getElementById('username');
  const createPostSection = document.getElementById('create-post');

  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (token) {
    authButtons.style.display = 'none';
    userInfo.style.display = 'block';
    createPostSection.style.display = 'block';
    loadUserProfile();
  }

  // Event listeners
  loginBtn?.addEventListener('click', () => {
    authForms.style.display = 'block';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  });

  registerBtn?.addEventListener('click', () => {
    authForms.style.display = 'block';
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
  });

  document.getElementById('cancel-login')?.addEventListener('click', () => {
    authForms.style.display = 'none';
  });

  document.getElementById('cancel-register')?.addEventListener('click', () => {
    authForms.style.display = 'none';
  });

  document.getElementById('submit-login')?.addEventListener('click', login);
  document.getElementById('submit-register')?.addEventListener('click', register);
  logoutBtn?.addEventListener('click', logout);

  // Password confirmation check
  document.getElementById('register-password-confirm')?.addEventListener('input', checkPasswordMatch);

  async function checkPasswordMatch() {
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    const matchError = document.getElementById('password-match-error');
    
    if (password && confirmPassword && password !== confirmPassword) {
      matchError.style.display = 'block';
      return false;
    } else {
      matchError.style.display = 'none';
      return true;
    }
  }

  async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        authButtons.style.display = 'none';
        userInfo.style.display = 'block';
        authForms.style.display = 'none';
        createPostSection.style.display = 'block';
        usernameSpan.textContent = data.user.username;
        window.location.reload();
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  }

  async function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;

    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        authButtons.style.display = 'none';
        userInfo.style.display = 'block';
        authForms.style.display = 'none';
        createPostSection.style.display = 'block';
        usernameSpan.textContent = data.user.username;
        window.location.reload();
      } else {
        if (data.error.includes('email') || data.error.includes('username')) {
          alert('Email or username already exists');
        } else {
          alert(data.error || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    authButtons.style.display = 'block';
    userInfo.style.display = 'none';
    createPostSection.style.display = 'none';
    window.location.reload();
  }

  async function loadUserProfile() {
    try {
      const response = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        usernameSpan.textContent = data.username;
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }
});