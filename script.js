// ==========================================
// 1. API BASE URL & SECURITY
// ==========================================
const BASE_URL = 'https://universal-backend-3.onrender.com/api';

const adminToken = localStorage.getItem('adminToken');
if (!adminToken && window.location.pathname.includes('index.html')) {
    // अलर्ट अभी टेस्टिंग के लिए बंद है
    // window.location.href = 'login.html';
}

// ==========================================
// 2. SIDEBAR LOGIC (मेनू बटन)
// ==========================================
const navToggle = document.getElementById('nav-toggle');
const sidebar = document.getElementById('sidebar');

if (navToggle && sidebar) {
    navToggle.addEventListener('click', function(e) {
        sidebar.classList.toggle('active');
        e.stopPropagation(); 
    });
}

document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (!sidebar.contains(e.target) && navToggle && !navToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// ==========================================
// 3. PAGE SWITCHING (बिना पेज रीलोड किए सेक्शन बदलना)
// ==========================================
const menuItems = document.querySelectorAll('.sidebar-menu ul li');
const sections = document.querySelectorAll('.content-section');

menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault(); 
        menuItems.forEach(li => li.classList.remove('active'));
        this.classList.add('active');

        if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('active');

        const menuName = this.querySelector('span').innerText;
        sections.forEach(sec => sec.style.display = 'none');

        const showSection = (id) => {
            const el = document.getElementById(id);
            if(el) el.style.display = 'block';
        };

        if (menuName === 'Dashboard') showSection('view-dashboard');
        else if (menuName === 'All Projects') showSection('view-projects');
        else if (menuName === 'Realtime DB') showSection('view-database');
        else if (menuName === 'Authentication') {
            showSection('view-auth');
            fetchAndDisplayUsers(); // पेज खोलते ही यूज़र्स लोड करो
        }
        else if (menuName === 'API Keys') showSection('view-apikeys');
        else if (menuName === 'Settings') showSection('view-settings');
    });
});

// ==========================================
// 4. MODALS (Pop-ups) LOGIC
// ==========================================
// A. User Modal (यूज़र जोड़ने वाला पॉप-अप)
const addUserBtn = document.getElementById('open-add-user-btn'); 
const userModal = document.getElementById('addUserModal');
const closeUserModal = document.getElementById('closeUserModal'); 

if(addUserBtn && userModal && closeUserModal) {
    addUserBtn.addEventListener('click', () => userModal.style.display = 'block');
    closeUserModal.addEventListener('click', () => userModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === userModal) userModal.style.display = 'none'; });
}

// B. Project Modal (नया प्रोजेक्ट बनाने वाला पॉप-अप)
const addProjectBtn = document.getElementById('open-add-project-btn'); 
const projectModal = document.getElementById('addProjectModal');
const closeProjectModal = document.getElementById('closeProjectModal');

if(addProjectBtn && projectModal && closeProjectModal) {
    addProjectBtn.addEventListener('click', () => projectModal.style.display = 'block');
    closeProjectModal.addEventListener('click', () => projectModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === projectModal) projectModal.style.display = 'none'; });
}

// ==========================================
// 5. API INTEGRATION (असली बैकएंड से कनेक्शन)
// ==========================================

// 5A. यूज़र्स को डेटाबेस से लाना
async function fetchAndDisplayUsers() {
    const userTable = document.getElementById('auth-users-list');
    if (!userTable) return;

    userTable.innerHTML = '<tr><td colspan="2" style="padding: 15px; text-align: center; color: #10b981;">Waking up Server... Loading Data <i class="fa-solid fa-spinner fa-spin"></i></td></tr>';

    try {
        const response = await fetch(`${BASE_URL}/users`); 
        if (!response.ok) throw new Error("API Route Not Found");
        const data = await response.json();

        if (data && data.length > 0) {
            userTable.innerHTML = ''; 
            data.forEach(user => {
                const row = `
                    <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 15px 10px;">${user.email}</td>
                        <td style="padding: 15px 10px; color: #94a3b8; font-family: monospace;">${user._id || 'N/A'}</td>
                    </tr>`;
                userTable.innerHTML += row;
            });
        } else {
            userTable.innerHTML = '<tr><td colspan="2" style="padding: 15px; text-align: center; color: #94a3b8;">No users found in database yet.</td></tr>';
        }
    } catch (error) {
        userTable.innerHTML = '<tr><td colspan="2" style="padding: 15px; text-align: center; color: #ef4444;">Backend API Not Ready.</td></tr>';
    }
}

// 5B. नया यूज़र डेटाबेस में भेजना
const saveUserBtn = document.getElementById('save-user-btn');
if (saveUserBtn) {
    saveUserBtn.addEventListener('click', async () => {
        const emailInput = document.getElementById('new-user-email').value;
        const passwordInput = document.getElementById('new-user-password').value;

        if (!emailInput || !passwordInput) return alert("Email और Password दोनों ज़रूरी हैं!");

        saveUserBtn.innerHTML = 'Saving... <i class="fa-solid fa-spinner fa-spin"></i>';
        saveUserBtn.disabled = true;

        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput, password: passwordInput })
            });

            if (response.ok) {
                alert("🎉 Success! नया यूज़र सेव हो गया!");
                if(userModal) userModal.style.display = 'none';
                document.getElementById('new-user-email').value = '';
                document.getElementById('new-user-password').value = '';
                fetchAndDisplayUsers();
            } else {
                const errData = await response.json();
                alert("❌ Error: " + (errData.message || "Failed to create user."));
            }
        } catch (error) {
            alert("❌ Render सर्वर से कनेक्ट नहीं हो पाया!");
        }

        saveUserBtn.innerHTML = 'Add to Database';
        saveUserBtn.disabled = false;
    });
}

// 5C. नया BaaS प्रोजेक्ट (API Key के साथ) बनाना
const saveProjectBtn = document.getElementById('save-project-btn');
if(saveProjectBtn) {
    saveProjectBtn.addEventListener('click', async () => {
        const projectName = document.getElementById('new-project-name').value;

        if (!projectName) return alert("प्रोजेक्ट का नाम डालना ज़रूरी है बॉस!");

        saveProjectBtn.innerHTML = 'Creating... <i class="fa-solid fa-spinner fa-spin"></i>';
        saveProjectBtn.disabled = true;

        try {
            // यहाँ हमने सही वाला राउट (baas-apps) डाल दिया है!
            const response = await fetch(`${BASE_URL}/baas-apps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: projectName })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`🎉 Success! "${projectName}" बन गया! API Key: ${data.project.apiKey}`);
                if(projectModal) projectModal.style.display = 'none';
                document.getElementById('new-project-name').value = '';
            } else {
                const errData = await response.json();
                alert("❌ Error: " + (errData.message || "प्रोजेक्ट नहीं बन पाया"));
            }
        } catch (error) {
            alert("Render सर्वर से कनेक्ट नहीं हो पाया।");
        }

        saveProjectBtn.innerHTML = 'Create & Generate Key';
        saveProjectBtn.disabled = false;
    });
}

// ==========================================
// 6. INITIAL LOAD (डैशबोर्ड डेटा)
// ==========================================
window.onload = function() {
    const p = document.getElementById('total-projects');
    const d = document.getElementById('active-databases');
    const a = document.getElementById('api-requests');
    if(p) p.innerText = 24;
    if(d) d.innerText = 12;
    if(a) a.innerText = "14.5K";
    
    // अगर Authentication पेज खुला हो तो यूज़र्स लोड कर लो
    if(document.getElementById('view-auth').style.display === 'block') {
        fetchAndDisplayUsers();
    }
};

// 5D. Projects ko database se mangana aur table mein dikhana
async function fetchAndDisplayProjects() {
    const projectTable = document.getElementById('projects-list');
    if (!projectTable) return;

    projectTable.innerHTML = '<tr><td colspan="3" style="padding: 15px; text-align: center; color: #10b981;">Loading Projects... <i class="fa-solid fa-spinner fa-spin"></i></td></tr>';

    try {
        const response = await fetch(`${BASE_URL}/baas-apps`); 
        if (!response.ok) throw new Error("API Not Found");
        const data = await response.json();

        if (data && data.length > 0) {
            projectTable.innerHTML = ''; 
            data.forEach(proj => {
                // API Key ko thoda chupa kar dikhayenge taaki safe rahe
                const shortKey = proj.apiKey.substring(0, 15) + '...';
                
                const row = `
                    <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 15px 10px; font-weight: bold;">${proj.name}</td>
                        <td style="padding: 15px 10px; color: #10b981; font-family: monospace;">${shortKey}</td>
                        <td style="padding: 15px 10px;"><span style="color: #10b981; background: rgba(16,185,129,0.2); padding: 5px 10px; border-radius: 20px; font-size: 12px;">${proj.status || 'Active'}</span></td>
                    </tr>`;
                projectTable.innerHTML += row;
            });
        } else {
            projectTable.innerHTML = '<tr><td colspan="3" style="padding: 15px; text-align: center; color: #94a3b8;">No projects found. Create one!</td></tr>';
        }
    } catch (error) {
        projectTable.innerHTML = '<tr><td colspan="3" style="padding: 15px; text-align: center; color: #ef4444;">Failed to load projects.</td></tr>';
    }
}

// Sidebar mein 'All Projects' par click karne par list update karna
document.querySelectorAll('.sidebar-menu ul li').forEach(item => {
    item.addEventListener('click', function() {
        if (this.innerText.includes('All Projects')) {
            fetchAndDisplayProjects();
        }
    });
});

// Page load hone par agar All Projects khula ho toh
if(document.getElementById('view-projects') && document.getElementById('view-projects').style.display === 'block') {
    fetchAndDisplayProjects();
}
