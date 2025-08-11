function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorElem = document.getElementById('error');

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      window.location.href = '/';
    } else {
      errorElem.textContent = data.message || 'Invalid credentials';
    }
  })
  .catch(() => {
    errorElem.textContent = 'Error connecting to server';
  });
}

function toggleTheme() {
  document.body.classList.toggle('dark');
}
