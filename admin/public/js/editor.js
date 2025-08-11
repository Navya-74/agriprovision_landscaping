// Load theme on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }

    // Logout modal setup
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutModal.style.display = 'flex';
        });
    }

    if (cancelLogout) {
        cancelLogout.addEventListener('click', () => {
            logoutModal.style.display = 'none';
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener('click', () => {
            fetch('/logout', { method: 'POST' })
                .then(() => {
                    window.location.href = '/login';
                })
                .catch(err => {
                    console.error('Logout error:', err);
                });
        });
    }

    // Optional: click outside modal to close
    window.addEventListener('click', (event) => {
        if (event.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
    });
});

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// Save file
function saveFile() {
    const filePath = document.getElementById('editor').dataset.filepath;
    const fileContent = editor.getValue();

    fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content: fileContent })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'File saved successfully!');
    })
    .catch(err => {
        console.error(err);
        alert('Error saving file.');
    });
}

// Handle resize
window.addEventListener('resize', () => {
    if (typeof editor.layout === 'function') {
        editor.layout(); // For Monaco
    } else if (typeof editor.resize === 'function') {
        editor.resize(); // For ACE
    }
});
