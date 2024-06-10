function onOpenRegister() {
    window.location.href = "register.html";
}

function onOpenLogin() {
    window.location.href = "login.html";
}

function onOpenForgotPassword() {
    window.location.href = "forgot-password.html";
}

async function onLogin() {

    const email = document.getElementById("user-input").value;
    const password = document.getElementById("pass-input").value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });

    if (response.ok) {
        console.log('User logged in');
    } else {
        console.error('Login failed');
    }

}
async function onLogout() {
    const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
    });

    if (response.ok) {
        console.log('User logged out');
    } else {
        console.error('Logout failed');
    }
}