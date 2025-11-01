document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

        // 登录表单提交事件
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        const response = await fetch("http://mask.ddns.net:8888/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        const loginError = document.getElementById("login-error");

        if (response.ok) {
            loginError.textContent = "";
            alert("登录成功!");
            // 可以使用 token 做后续操作
            console.log("Token:", data.token);
            // 清空表单
            loginForm.reset();
        } else {
            loginError.textContent = data.error || "登录失败";
        }
    });

    // 注册表单提交事件
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nickname = document.getElementById("nickname").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;

        const response = await fetch("http://mask.ddns.net:8888/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nickname,
                email,
                password
            })
        });

        const data = await response.json();

        const registerError = document.getElementById("register-error");

        if (response.ok) {
            registerError.textContent = "";
            alert("注册成功!");
            // 清空表单
            registerForm.reset();
        } else {
            registerError.textContent = data.error || "注册失败";
        }
    });

});
