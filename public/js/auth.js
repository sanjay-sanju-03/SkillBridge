async function send(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    return result;
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async event => {
        event.preventDefault();
        const message = document.getElementById("message");
        try {
            const result = await send("/api/auth/login", {
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            });
            window.location.href = result.role === "admin" ? "admin.html" : "student.html";
        } catch (error) {
            message.textContent = error.message;
        }
    });
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async event => {
        event.preventDefault();
        const message = document.getElementById("message");
        try {
            await send("/api/auth/register", {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            });
            window.location.href = "student.html";
        } catch (error) {
            message.textContent = error.message;
        }
    });
}
