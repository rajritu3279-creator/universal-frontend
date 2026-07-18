const BASE_URL = 'https://universal-backend-3.onrender.com/api';

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // फॉर्म को रीलोड होने से रोकना

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-msg');

    // बटन का टेक्स्ट बदलना ताकि पता चले लोडिंग हो रही है
    loginBtn.innerHTML = 'Checking... <i class="fa-solid fa-spinner fa-spin"></i>';
    loginBtn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        // तुम्हारे रेंडर बैकएंड पर रिक्वेस्ट भेजना (Admin Login API)
        const response = await fetch(`${BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            // 🎉 अगर लॉगिन सक्सेस हो गया!
            // सर्वर से मिली VIP चाबी (Token) को मोबाइल/ब्राउज़र में सेव कर लो
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminEmail', data.email);

            loginBtn.innerHTML = 'Success! <i class="fa-solid fa-check"></i>';
            loginBtn.style.background = '#10b981';
            
            // 1 सेकंड बाद सीधे डैशबोर्ड (index.html) पर भेज दो
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // ❌ अगर पासवर्ड गलत हुआ
            errorMsg.innerText = data.message || "लॉगिन फेल हो गया। डिटेल्स चेक करो!";
            errorMsg.style.display = 'block';
            loginBtn.innerHTML = 'Secure Login <i class="fa-solid fa-lock"></i>';
            loginBtn.disabled = false;
        }

    } catch (error) {
        console.error("सर्वर से नहीं जुड़ पाया:", error);
        errorMsg.innerText = "सर्वर एरर! रेंडर बैकएंड चेक करो।";
        errorMsg.style.display = 'block';
        loginBtn.innerHTML = 'Secure Login <i class="fa-solid fa-lock"></i>';
        loginBtn.disabled = false;
    }
});
