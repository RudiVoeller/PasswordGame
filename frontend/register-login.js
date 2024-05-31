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
        const data = await response.json();
        localStorage.setItem('token', data.token);
    } else {
        console.error('Login failed');
    }

}