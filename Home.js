const pages = { home: 'page-home', auth: 'page-auth' };
const navIds = { home: 'nav-home' };
const storageKey = 'rescueit-users-v9';
let toastTimer;

function showPage(key, role = 'user') {
  Object.values(pages).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const el = document.getElementById(pages[key]);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navEl = document.getElementById(navIds[key]);
  if (navEl) navEl.classList.add('active');

  if (key === 'auth') {
    switchAuthMode('register');
    setRole(role);
  } else if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMenu();
}

function switchAuthMode(mode) {
  const registerPanel = document.getElementById('panel-register');
  const loginPanel = document.getElementById('panel-login');
  const message = document.getElementById('auth-message');

  if (!registerPanel || !loginPanel) return;

  const isRegister = mode === 'register';
  registerPanel.classList.toggle('active', isRegister);
  loginPanel.classList.toggle('active', !isRegister);

  if (message) {
    message.textContent = '';
    message.classList.remove('error');
  }
}

function setRole(role) {
  document.querySelectorAll('.role-tab').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.getElementById(`role-${role}`);
  if (activeTab) activeTab.classList.add('active');

  const roleInput = document.getElementById('register-role');
  if (roleInput) roleInput.value = role;

  const authSection = document.querySelector('.auth-section');
  if (authSection) {
    authSection.classList.remove('theme-user', 'theme-restaurant', 'theme-volunteer');
    authSection.classList.add(`theme-${role}`);
  }

  document.querySelectorAll('.sidebar-content').forEach(content => content.classList.remove('active'));
  const activeSidebar = document.getElementById(`sidebar-${role}`);
  if (activeSidebar) activeSidebar.classList.add('active');

  const content = {
    user: {
      regTitle: "Create account",
      regDesc: "Sign up to start rescuing meals.",
      logTitle: "Welcome back",
      logDesc: "Sign in to keep rescuing meals."
    },
    restaurant: {
      regTitle: "Restaurant portal",
      regDesc: "Sign up to start listing surplus food.",
      logTitle: "Restaurant portal",
      logDesc: "Sign in to manage your listings."
    },
    volunteer: {
      regTitle: "Charity portal",
      regDesc: "Sign up to receive food donations.",
      logTitle: "Charity portal",
      logDesc: "Sign in to receive incoming donations."
    }
  };

  if (content[role]) {
    const regTitle = document.getElementById('form-title-register');
    const regDesc = document.getElementById('form-desc-register');
    const logTitle = document.getElementById('form-title-login');
    const logDesc = document.getElementById('form-desc-login');

    if (regTitle) regTitle.textContent = content[role].regTitle;
    if (regDesc) regDesc.textContent = content[role].regDesc;
    if (logTitle) logTitle.textContent = content[role].logTitle;
    if (logDesc) logDesc.textContent = content[role].logDesc;
  }
}

function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('open');
}

function closeMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.remove('open');
}

function getUsers() {
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(storageKey, JSON.stringify(users));
}

function showPageFromHash() {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const authRoles = ['user', 'restaurant', 'volunteer'];

  if (authRoles.includes(hash)) {
    showPage('auth', hash);
    return;
  }

  if (hash === 'auth') {
    showPage('auth');
    return;
  }

  showPage('home');
}

function showAuthMessage(text, isError = false) {
  const message = document.getElementById('auth-message');
  if (!message) return;
  message.textContent = text;
  message.classList.toggle('error', isError);
}

function showToast(text, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = text;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.remove('error');
  }, 2600);
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(registerForm);
    const accountType = formData.get('accountType');
    const name = formData.get('name').trim();
    const email = formData.get('email').trim().toLowerCase();
    const phone = formData.get('phone').trim();
    const password = formData.get('password').trim();
    const users = getUsers();

    if (users.some(user => user.email === email)) {
      switchAuthMode('login');
      showAuthMessage('This email is already registered. Please log in instead.', true);
      showToast('This email is already registered.', true);
      return;
    }

    const newUser = { name, email, phone, password, accountType };
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem('rescueit-current-user', JSON.stringify(newUser));
    registerForm.reset();

    showToast('Account created successfully!');

    setTimeout(() => {
      if (accountType === 'user') {
        window.location.href = 'prac.html';
      } else {
        switchAuthMode('login');
        showAuthMessage('Account created successfully. You can log in now.');
      }
    }, 1500);
  });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const email = formData.get('email').trim().toLowerCase();
    const password = formData.get('password').trim();
    const users = getUsers();
    const matchedUser = users.find(user => user.email === email && user.password === password);

    if (!matchedUser) {
      showAuthMessage('Invalid email or password. Please try again.', true);
      showToast('Invalid email or password.', true);
      return;
    }

    loginForm.reset();
    localStorage.setItem('rescueit-current-user', JSON.stringify(matchedUser));
    showToast(`Welcome back, ${matchedUser.name}!`);

    setTimeout(() => {
      if (matchedUser.accountType === 'restaurant') {
        window.location.href = 'dashboard.html';
      } else if (matchedUser.accountType === 'volunteer') {
        window.location.href = 'charity.html';
      } else {
        window.location.href = 'prac.html';
      }
    }, 1500);
  });
}

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 10) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

showPageFromHash();
window.addEventListener('hashchange', showPageFromHash);
