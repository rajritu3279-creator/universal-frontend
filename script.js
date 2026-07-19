const BASE_URL = 'https://universal-backend-3.onrender.com/api';

// ==========================================
// 1. SIDEBAR TOGGLE LOGIC (जो मैं भूल गया था) 😅
// ==========================================
const navToggle = document.getElementById('nav-toggle');
const sidebar = document.getElementById('sidebar');

if (navToggle && sidebar) {
    // ☰ बटन दबाने पर साइडबार खोलना/बंद करना
    navToggle.addEventListener('click', function(e) {
        sidebar.classList.toggle('active');
        e.stopPropagation(); 
    });
}

// मोबाइल में साइडबार के बाहर क्लिक करने पर उसे अंदर कर देना
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (!sidebar.contains(e.target) && navToggle && !navToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// ==========================================
// 2. PAGE SWITCHER (टैब बदलना)
// ==========================================
const menuItems = document.querySelectorAll('.sidebar-menu ul li');
const sections = document.querySelectorAll('.content-section');

menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault(); 
        menuItems.forEach(li => li.classList.remove('active'));
        this.classList.add('active');

        // मोबाइल में कोई भी मेनू दबाने के बाद साइडबार खुद अंदर चला जाए
        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('active');
        }

        const menuName = this.querySelector('span').innerText;
        sections.forEach(sec => sec.style.display = 'none');

        if (menuName === 'Dashboard') document.getElementById('view-dashboard').style.display = 'block';
        else if (menuName === 'All Projects') { document.getElementById('view-projects').style.display = 'block'; fetchProjects(); }
        else if (menuName === 'Realtime DB') { document.getElementById('view-database').style.display = 'block'; loadRealtimeDB(); }
        else if (menuName === 'Authentication') { document.getElementById('view-auth').style.display = 'block'; fetchUsers(); }
        else if (menuName === 'API Keys') { document.getElementById('view-apikeys').style.display = 'block'; fetchApiKeys(); }
        else if (menuName === 'Settings') document.getElementById('view-settings').style.display = 'block';
    });
});

// ==========================================
// 3. MODALS (Popups)
// ==========================================
const toggleModal = (btnId, modalId, closeId) => {
    const btn = document.getElementById(btnId), modal = document.getElementById(modalId), close = document.getElementById(closeId);
    if(btn && modal && close) {
        btn.onclick = () => modal.style.display = 'block';
        close.onclick = () => modal.style.display = 'none';
        window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; }
    }
}
toggleModal('open-add-user-btn', 'addUserModal', 'closeUserModal');
toggleModal('open-add-project-btn', 'addProjectModal', 'closeProjectModal');

// ==========================================
// 4. API CALLS (Data Fetching)
// ==========================================
// --- Fetch Users ---
async function fetchUsers() {
    const table = document.getElementById('auth-users-list');
    table.innerHTML = '<tr><td colspan="3" style="color: #10b981; padding: 15px; text-align: center;">Loading...</td></tr>';
    try {
        const res = await fetch(`${BASE_URL}/users`);
        if(!res.ok) throw new Error();
        const data = await res.json();
        table.innerHTML = '';
        if(data.length === 0) table.innerHTML = '<tr><td colspan="3" style="color: #94a3b8; text-align:center; padding:15px;">No users found.</td></tr>';
        data.forEach(u => table.innerHTML += `<tr style="border-bottom: 1px solid #334155;"><td style="padding:15px;">${u.name || 'Gamer'}</td><td style="padding:15px;">${u.email}</td><td style="padding:15px; color:#94a3b8; font-family:monospace;">${u._id}</td></tr>`);
    } catch { table.innerHTML = '<tr><td colspan="3" style="color: red; text-align:center; padding:15px;">Backend API Not Ready.</td></tr>'; }
}

// --- Fetch Projects ---
async function fetchProjects() {
    const table = document.getElementById('projects-list');
    try {
        const res = await fetch(`${BASE_URL}/baas-apps`);
        const data = await res.json();
        table.innerHTML = '';
        data.forEach(p => table.innerHTML += `<tr style="border-bottom: 1px solid #334155;"><td style="padding:15px; font-weight:bold;">${p.name}</td><td style="padding:15px; color:#10b981; font-family:monospace;">${p.apiKey.substring(0,10)}...</td><td style="padding:15px;"><span style="color:#10b981; background:rgba(16,185,129,0.2); padding:5px 10px; border-radius:20px; font-size:12px;">Active</span></td></tr>`);
        document.getElementById('total-projects').innerText = data.length;
    } catch (e) {}
}

// --- Fetch API Keys ---
async function fetchApiKeys() {
    const table = document.getElementById('api-keys-list');
    try {
        const res = await fetch(`${BASE_URL}/baas-apps`);
        const data = await res.json();
        table.innerHTML = '';
        data.forEach(p => table.innerHTML += `<tr style="border-bottom: 1px solid #334155;"><td style="padding:15px; font-weight:bold;">${p.name}</td><td style="padding:15px; color:#f59e0b; font-family:monospace;">${p.apiKey}</td><td style="padding:15px;"><button onclick="navigator.clipboard.writeText('${p.apiKey}'); alert('Copied!');" style="background:#3b82f6; color:white; border:none; padding:8px 12px; border-radius:5px; font-weight:bold; cursor:pointer;"><i class="fa-solid fa-copy"></i> Copy</button></td></tr>`);
    } catch (e) {}
}

// --- Firebase Style Realtime DB JSON ---
async function loadRealtimeDB() {
    const viewer = document.getElementById('json-viewer');
    viewer.innerHTML = "Fetching Live Data... <i class='fa-solid fa-spinner fa-spin'></i>";
    try {
        const usersRes = await fetch(`${BASE_URL}/users`);
        const appsRes = await fetch(`${BASE_URL}/baas-apps`);
        const users = await usersRes.json();
        const apps = await appsRes.json();
        
        const combinedData = {
            "root_database": {
                "baas_projects": apps,
                "registered_gamers": users
            }
        };
        viewer.innerHTML = JSON.stringify(combinedData, null, 4);
    } catch (e) {
        viewer.innerHTML = "Error fetching Realtime DB Data.";
    }
}

// ==========================================
// 5. SAVE NEW DATA (POST)
// ==========================================
// --- Save User ---
document.getElementById('save-user-btn').onclick = async function() {
    const name = document.getElementById('new-user-name').value;
    const email = document.getElementById('new-user-email').value;
    const pass = document.getElementById('new-user-password').value;
    if(!name || !email || !pass) return alert("नाम, ईमेल और पासवर्ड भरें!");
    
    this.innerHTML = 'Saving... <i class="fa-solid fa-spinner fa-spin"></i>';
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name, email, password: pass}) });
        if(res.ok) { alert("User Created!"); document.getElementById('addUserModal').style.display='none'; fetchUsers(); }
        else { const err = await res.json(); alert("Error: " + (err.message || "Failed")); }
    } catch (e) { alert("Server Error"); }
    this.innerText = 'Add to Database';
}

// --- Save Project ---
document.getElementById('save-project-btn').onclick = async function() {
    const name = document.getElementById('new-project-name').value;
    if(!name) return alert("Project Name is required!");
    
    this.innerHTML = 'Creating... <i class="fa-solid fa-spinner fa-spin"></i>';
    try {
        const res = await fetch(`${BASE_URL}/baas-apps`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name}) });
        if(res.ok) { alert("Project Created!"); document.getElementById('addProjectModal').style.display='none'; fetchProjects(); }
        else { const err = await res.json(); alert("Error: " + (err.message || "Failed")); }
    } catch (e) { alert("Server Error"); }
    this.innerText = 'Generate API Key';
}

// Page load hone par default data load karna
window.onload = () => { fetchProjects(); fetchUsers(); }
