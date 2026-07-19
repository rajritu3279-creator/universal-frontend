const BASE_URL = 'https://universal-backend-3.onrender.com/api';

// 1. Sidebar Switcher
const menuItems = document.querySelectorAll('.sidebar-menu ul li');
const sections = document.querySelectorAll('.content-section');

menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault(); 
        menuItems.forEach(li => li.classList.remove('active'));
        this.classList.add('active');

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

// 2. Modals (Popups)
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

// 3. API Calls
// --- Fetch Users ---
async function fetchUsers() {
    const table = document.getElementById('auth-users-list');
    table.innerHTML = '<tr><td colspan="3" style="color: #10b981;">Loading...</td></tr>';
    try {
        const res = await fetch(`${BASE_URL}/users`);
        if(!res.ok) throw new Error();
        const data = await res.json();
        table.innerHTML = '';
        data.forEach(u => table.innerHTML += `<tr><td style="padding:10px;">${u.name || 'Gamer'}</td><td style="padding:10px;">${u.email}</td><td style="padding:10px; color:#94a3b8;">${u._id}</td></tr>`);
    } catch { table.innerHTML = '<tr><td colspan="3" style="color: red;">Error connecting backend.</td></tr>'; }
}

// --- Fetch Projects ---
async function fetchProjects() {
    const table = document.getElementById('projects-list');
    try {
        const res = await fetch(`${BASE_URL}/baas-apps`);
        const data = await res.json();
        table.innerHTML = '';
        data.forEach(p => table.innerHTML += `<tr><td style="padding:10px;">${p.name}</td><td style="padding:10px; color:#10b981;">${p.apiKey.substring(0,10)}...</td><td style="padding:10px;">Active</td></tr>`);
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
        data.forEach(p => table.innerHTML += `<tr><td style="padding:12px;">${p.name}</td><td style="padding:12px; color:#f59e0b;">${p.apiKey}</td><td style="padding:12px;"><button onclick="navigator.clipboard.writeText('${p.apiKey}'); alert('Copied!');" style="background:#3b82f6; color:white; border:none; padding:5px 10px; border-radius:3px;">Copy</button></td></tr>`);
    } catch (e) {}
}

// --- Firebase Style Realtime DB JSON ---
async function loadRealtimeDB() {
    const viewer = document.getElementById('json-viewer');
    viewer.innerHTML = "Fetching Live Data...";
    try {
        const usersRes = await fetch(`${BASE_URL}/users`);
        const appsRes = await fetch(`${BASE_URL}/baas-apps`);
        const users = await usersRes.json();
        const apps = await appsRes.json();
        
        // Data ko JSON format mein sundar dikhana
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

// 4. Save New Data
// --- Save User (अब Name भी जाएगा) ---
document.getElementById('save-user-btn').onclick = async function() {
    const name = document.getElementById('new-user-name').value;
    const email = document.getElementById('new-user-email').value;
    const pass = document.getElementById('new-user-password').value;
    if(!name || !email || !pass) return alert("नाम, ईमेल और पासवर्ड भरें!");
    
    this.innerText = 'Saving...';
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name, email, password: pass}) });
        if(res.ok) { alert("User Created!"); document.getElementById('addUserModal').style.display='none'; fetchUsers(); }
        else alert("Error creating user!");
    } catch (e) { alert("Server Error"); }
    this.innerText = 'Add to Database';
}

// --- Save Project ---
document.getElementById('save-project-btn').onclick = async function() {
    const name = document.getElementById('new-project-name').value;
    if(!name) return;
    this.innerText = 'Creating...';
    try {
        const res = await fetch(`${BASE_URL}/baas-apps`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name}) });
        if(res.ok) { alert("Project Created!"); document.getElementById('addProjectModal').style.display='none'; fetchProjects(); }
    } catch (e) { alert("Server Error"); }
    this.innerText = 'Generate API Key';
}

window.onload = () => { fetchProjects(); fetchUsers(); }
