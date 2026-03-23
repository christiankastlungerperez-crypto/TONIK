// Initial Mock Data
let customers = [
    {
        id: 1,
        name: "Elena Garcés",
        company: "TechNova Solutions",
        email: "elena@technova.com",
        phone: "+34 612 345 678",
        status: "Activo",
        type: "Kit Digital",
        service: "Desarrollo Web",
        comments: [],
        files: []
    },
    {
        id: 2,
        name: "Carlos Ruiz",
        company: "Global Logistics",
        email: "carlos@globallogistics.es",
        phone: "+34 688 991 223",
        status: "Lead",
        type: "Externo",
        service: "Redes Sociales",
        comments: [],
        files: []
    },
    {
        id: 3,
        name: "Sofía Martínez",
        company: "EcoFood S.L.",
        email: "smartinez@ecofood.com",
        phone: "+34 600 112 233",
        status: "Activo",
        type: "Kit Digital",
        service: "Desarrollo Web",
        comments: [],
        files: []
    },
    {
        id: 4,
        name: "Javier López",
        company: "Arquitectos Unidos",
        email: "jlopez@arquidos.com",
        phone: "+34 655 444 333",
        status: "Inactivo",
        type: "Externo",
        service: "Redes Sociales",
        comments: [],
        files: []
    },
    {
        id: 5,
        name: "Ana Silva",
        company: "Creative Design",
        email: "ana@creativedesign.co",
        phone: "+34 677 888 999",
        status: "Lead",
        type: "Kit Digital",
        service: "Desarrollo Web",
        comments: [],
        files: []
    }
];

let recordings = [
    { id: 1, customerId: 1, date: "2026-03-22", time: "10:00", duration: "2", type: "Video Corporativo" },
    { id: 2, customerId: 2, date: "2026-03-25", time: "16:30", duration: "1", type: "Reel Mensual" },
    { id: 3, customerId: 4, date: "2026-03-28", time: "12:00", duration: "3", type: "Sesión Fotos" }
];

let currentChannel = "General";
let currentUser = null;

let chatMessages = [
    { id: 1, sender: "Admin User", initials: "AU", text: "¡Bienvenidos al nuevo espacio de chat del equipo!", time: "09:00", isSelf: true, channel: "General" },
    { id: 2, sender: "Pablo M.", initials: "PM", text: "Tiene muy buena pinta el calendario de grabaciones.", time: "09:15", isSelf: false, channel: "General" },
    { id: 3, sender: "Sara L.", initials: "SL", text: "Recordad que acabo de subir las contraseñas de Acme Corp.", time: "09:42", isSelf: false, channel: "Desarrollo Web" }
];

let teamUsers = [
    { id: 1, name: "Admin", initials: "AD", username: "admin", pass: "Admintonik2025-", role: "admin", email: "admin@agenciatonik.com" },
    { id: 2, name: "Juanjo", initials: "JJ", username: "juanjo@agenciatonik.com", pass: "juanjo123", role: "user", email: "juanjo@agenciatonik.com" },
    { id: 3, name: "Ismael", initials: "IS", username: "ismael@agenciatonik.com", pass: "ismael123", role: "user", email: "ismael@agenciatonik.com" },
    { id: 4, name: "Grecia", initials: "GR", username: "grecia@agenciatonik.com", pass: "grecia123", role: "user", email: "grecia@agenciatonik.com" },
    { id: 5, name: "Mirela", initials: "MI", username: "mirela@agenciatonik.com", pass: "mirela123", role: "user", email: "mirela@agenciatonik.com" },
    { id: 6, name: "Luis", initials: "LU", username: "luis@agenciatonik.com", pass: "luis123", role: "user", email: "luis@agenciatonik.com" }
];

let tasksList = [
    { id: 3, title: "Actualizar base de datos MySQL", assigneeId: 3, status: "done", priority: "baja", dueDate: "2026-03-20", clientId: 4, file: null }
];

let agencyWALinks = [
    { id: 1, name: "Agencia Tonik - General", phone: "34600000000" },
    { id: 2, name: "Consultas y Ventas", phone: "34611111111" }
];

async function loadData() {
    // 1. Cargar de LocalStorage primero (Respaldo inmediato)
    const sC = localStorage.getItem('crm_customers'); if(sC) customers = JSON.parse(sC);
    const sR = localStorage.getItem('crm_recordings'); if(sR) recordings = JSON.parse(sR);
    const sCh = localStorage.getItem('crm_chatMessages'); if(sCh) chatMessages = JSON.parse(sCh);
    const sT = localStorage.getItem('crm_tasksList'); if(sT) tasksList = JSON.parse(sT);
    const sWA = localStorage.getItem('crm_agencyWALinks'); if(sWA) agencyWALinks = JSON.parse(sWA);

    // 2. Intentar cargar del servidor (SQLite) si está disponible
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos de timeout
        
        const res = await fetch('/api/data', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.ok) {
            const data = await res.json();
            if (data.customers) customers = data.customers;
            if (data.recordings) recordings = data.recordings;
            if (data.chatMessages) chatMessages = data.chatMessages;
            if (data.tasksList) tasksList = data.tasksList;
            if (data.agencyWALinks) agencyWALinks = data.agencyWALinks;
            
            // Sincronizar LocalStorage con los datos frescos del servidor
            saveToLocalStorage();
        }
    } catch(e) {
        console.warn("Servidor SQLite no detectado o fuera de línea. Usando LocalStorage.");
    }
}

function saveToLocalStorage() {
    localStorage.setItem('crm_customers', JSON.stringify(customers));
    localStorage.setItem('crm_recordings', JSON.stringify(recordings));
    localStorage.setItem('crm_chatMessages', JSON.stringify(chatMessages));
    localStorage.setItem('crm_tasksList', JSON.stringify(tasksList));
    localStorage.setItem('crm_agencyWALinks', JSON.stringify(agencyWALinks));
}

async function saveData() {
    // Guardado local SIEMPRE
    saveToLocalStorage();

    // Sincronización con el servidor
    try {
        const syncKeys = [
            { key: 'crm_customers', data: customers },
            { key: 'crm_recordings', data: recordings },
            { key: 'crm_chatMessages', data: chatMessages },
            { key: 'crm_tasksList', data: tasksList },
            { key: 'crm_agencyWALinks', data: agencyWALinks }
        ];

        for (const item of syncKeys) {
            await fetch('/api/save', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(item) 
            });
        }
    } catch(e) {
        // Silencioso
    }
}

// DOM Elements
const tableBody = document.getElementById('customers-table-body');
const totalStat = document.getElementById('stat-total');
const activeStat = document.getElementById('stat-active');
const leadsStat = document.getElementById('stat-leads');
const noResults = document.getElementById('no-results');

const modal = document.getElementById('customer-modal');
const btnAdd = document.getElementById('btn-add-customer');
const btnClose = document.getElementById('btn-close-modal');
const btnCancel = document.getElementById('btn-cancel');
const customerForm = document.getElementById('customer-form');
const modalTitle = document.getElementById('modal-title');

const searchInput = document.getElementById('global-search');
const statusFilter = document.getElementById('status-filter');
const serviceFilter = document.getElementById('service-filter');

// Tab and Notes elements
const notesWarning = document.getElementById('notes-warning');
const notesSection = document.getElementById('notes-section');
const btnAddComment = document.getElementById('btn-add-comment');
const newCommentInput = document.getElementById('new-comment');
const commentsFeed = document.getElementById('comments-feed');
const fileInput = document.getElementById('file-upload');
const filesList = document.getElementById('files-list');

let currentOpenCustomerId = null;
let currentFilteredCustomers = [...customers];

// Initialization
function init() {
    currentFilteredCustomers = [...customers];
    renderTable(currentFilteredCustomers);
    updateStats();
    setupEventListeners();
    setupLogin();
    
    // Auto-setup current view calendar
    renderCalendar();
}

function setupLogin() {
    const loginForm = document.getElementById('login-form');
    if(!loginForm) return;
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const uInput = document.getElementById('login-user').value.trim();
        const pInput = document.getElementById('login-pass').value.trim();
        
        const validUser = teamUsers.find(u => u.username === uInput && u.pass === pInput);
        if (validUser) {
            currentUser = validUser;
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
            
            // Profile image update
            const profileImg = document.querySelector('.profile-card img');
            if(profileImg) profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(validUser.name)}&background=6366f1&color=fff`;
            

            
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });
}

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + viewName).classList.remove('hidden');
    document.getElementById('view-' + viewName).classList.add('active');

    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.getElementById('nav-' + viewName).classList.add('active');

    if(viewName === 'calendar') {
        renderCalendar();
    } else if (viewName === 'chat') {
        renderChat();
    } else if (viewName === 'tasks') {
        renderTasks();
    } else if (viewName === 'whatsapp-agency') {
        renderAgencyWA();
    }
}

// Generate Avatar Initials
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Get Badge Class
function getStatusClass(status) {
    switch(status) {
        case 'Activo': return 'status-active';
        case 'Lead': return 'status-lead';
        case 'Inactivo': return 'status-inactive';
        default: return 'status-active';
    }
}

// Render Table Function
function renderTable(data) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        data.forEach(customer => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="client-cell">
                        <div class="client-avatar">${getInitials(customer.name)}</div>
                        <div class="client-info">
                            <div class="name">
                                ${customer.name}
                                <a href="https://wa.me/${customer.phone.replace(/\D/g, '')}" target="_blank" title="Contactar por WhatsApp" style="color:#25d366; font-size:16px; margin-left:8px;">
                                    <i class='bx bxl-whatsapp'></i>
                                </a>
                            </div>
                            <div class="email">${customer.email}</div>
                        </div>
                    </div>
                </td>
                <td class="company-cell">${customer.company}</td>
                <td class="contact-cell">${customer.phone}</td>
                <td>
                    <span class="service-badge ${customer.service === 'Desarrollo Web' ? 'service-web' : 'service-social'}">
                        <i class='bx ${customer.service === 'Desarrollo Web' ? 'bx-code-alt' : 'bx-share-alt'}'></i>
                        ${customer.service}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${getStatusClass(customer.status)}">${customer.status}</span>
                </td>
                <td>
                    <span class="type-badge ${customer.type === 'Kit Digital' ? 'type-kit' : 'type-external'}">${customer.type}</span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editCustomer(${customer.id})" title="Editar">
                            <i class='bx bx-edit-alt'></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteCustomer(${customer.id})" title="Eliminar">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

// Update Dashboard Stats
function updateStats() {
    totalStat.innerText = customers.length;
    activeStat.innerText = customers.filter(c => c.status === 'Activo').length;
    leadsStat.innerText = customers.filter(c => c.status === 'Lead').length;
}

// Setup Event Listeners
function setupEventListeners() {
    // Dashboard Form trigger
    btnAdd.addEventListener('click', () => openCustomerView());
    
    // Notes and Files
    btnAddComment.addEventListener('click', addComment);
    fileInput.addEventListener('change', addFile);

    // Form Submit
    customerForm.addEventListener('submit', handleFormSubmit);
    document.getElementById('recording-form').addEventListener('submit', handleRecordingSubmit);

    // Search and Filter
    searchInput.addEventListener('input', filterData);
    statusFilter.addEventListener('change', filterData);
    serviceFilter.addEventListener('change', filterData);

    // Chat form
    const chatForm = document.getElementById('chat-form');
    if(chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-input');
            if(!input.value.trim()) return;
            
            const now = new Date();
            const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
            
            chatMessages.push({
                id: Date.now(),
                sender: currentUser ? currentUser.name : "Admin User",
                initials: currentUser ? currentUser.initials : "AU",
                text: input.value.trim(),
                time: timeStr,
                isSelf: true,
                channel: currentChannel
            });
            
            input.value = '';
            saveData();
            renderChat();
        });
    }

    // Task form
    const taskForm = document.getElementById('task-form');
    if(taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('task-title').value;
            const assigneeId = document.getElementById('task-assignee').value;
            const clientId = document.getElementById('task-client').value;
            const priority = document.getElementById('task-priority').value;
            const dueDate = document.getElementById('task-due-date').value;
            const status = document.getElementById('task-status').value;
            const editId = document.getElementById('edit-task-id').value;
            const emailNotice = document.getElementById('task-email-notice').value;
            const waNotice = document.getElementById('task-wa-notice').value;
            
            let fileObj = null;
            if(fileInput.files.length > 0) {
                fileObj = { name: fileInput.files[0].name };
            }

            if (editId) {
                // Update existing
                const taskIndex = tasksList.findIndex(t => t.id === parseInt(editId));
                if (taskIndex !== -1) {
                    if(!fileObj && tasksList[taskIndex].file) {
                        fileObj = tasksList[taskIndex].file;
                    }
                    
                    tasksList[taskIndex] = {
                        ...tasksList[taskIndex],
                        title: title,
                        assigneeId: parseInt(assigneeId),
                        clientId: parseInt(clientId),
                        priority: priority,
                        dueDate: dueDate,
                        status: status,
                        file: fileObj,
                        emailNotice: emailNotice,
                        waNotice: waNotice
                    };
                }
            } else {
                // Create new
                tasksList.push({
                    id: Date.now(),
                    title: title,
                    assigneeId: parseInt(assigneeId),
                    clientId: parseInt(clientId),
                    priority: priority,
                    dueDate: dueDate,
                    status: status,
                    file: fileObj,
                    emailNotice: emailNotice,
                    waNotice: waNotice
                });
            }

            closeTaskModal();
            saveData();
            renderTasks();

            if(emailNotice || waNotice) {
                const assignee = teamUsers.find(u => u.id === parseInt(assigneeId));
                const assigneeName = assignee ? assignee.name : 'Responsable';
                let msg = `Recordatorio de Tarea:\n\nResponsable: ${assigneeName}\nTarea: ${title}\nFecha Límite: ${dueDate}`;
                
                if(emailNotice) {
                    fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ to: emailNotice, subject: 'Recordatorio de Tarea', body: msg })
                    });
                }
                if(waNotice) {
                    fetch('/api/send-whatsapp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ to: waNotice, message: msg })
                    });
                }
            }
        });
    }

    // Agency WhatsApp form
    const agencyWAForm = document.getElementById('agency-wa-form');
    if(agencyWAForm) {
        agencyWAForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('wa-acc-name').value;
            const phone = document.getElementById('wa-acc-phone').value.replace(/\+/g, '').replace(/\s/g, '');
            
            agencyWALinks.push({
                id: Date.now(),
                name: name,
                phone: phone
            });
            
            saveData();
            closeAgencyWAModal();
            renderAgencyWA();
        });
    }
}

// Filter Function
function filterData() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusVal = statusFilter.value;
    const serviceVal = serviceFilter.value;

    const filtered = customers.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm) || 
                              client.company.toLowerCase().includes(searchTerm) || 
                              client.email.toLowerCase().includes(searchTerm);
                              
        const matchesStatus = statusVal === 'all' || client.status === statusVal;
        const matchesService = serviceVal === 'all' || client.service === serviceVal;

        return matchesSearch && matchesStatus && matchesService;
    });

    currentFilteredCustomers = filtered;
    renderTable(filtered);
}

// Modal Functions
function openCustomerView(customer = null) {
    customerForm.reset();
    
    if (customer) {
        document.getElementById('customer-view-title').innerText = 'Perfil de ' + customer.name;
        currentOpenCustomerId = customer.id;
        document.getElementById('customer-id').value = customer.id;
        document.getElementById('name').value = customer.name;
        document.getElementById('company').value = customer.company;
        document.getElementById('email').value = customer.email;
        document.getElementById('phone').value = customer.phone;
        document.getElementById('status').value = customer.status;
        document.getElementById('type').value = customer.type;
        document.getElementById('service').value = customer.service;
        
        // Auto-load socials
        if(customer.socials) {
            ['ig', 'fb', 'tk'].forEach(net => {
                const creds = customer.socials[net];
                const check = document.getElementById(`social-${net}-check`);
                if(creds && creds.active) {
                    check.checked = true;
                    document.getElementById(`social-${net}-user`).value = creds.user || '';
                    document.getElementById(`social-${net}-pass`).value = creds.pass || '';
                    document.getElementById(`social-${net}-fields`).style.display = 'grid';
                } else {
                    check.checked = false;
                    document.getElementById(`social-${net}-user`).value = '';
                    document.getElementById(`social-${net}-pass`).value = '';
                    document.getElementById(`social-${net}-fields`).style.display = 'none';
                }
            });
        } else {
            // Default reset
            ['ig', 'fb', 'tk'].forEach(net => {
                document.getElementById(`social-${net}-check`).checked = false;
                document.getElementById(`social-${net}-user`).value = '';
                document.getElementById(`social-${net}-pass`).value = '';
                document.getElementById(`social-${net}-fields`).style.display = 'none';
            });
        }
        
        notesWarning.classList.add('hidden');
        notesSection.classList.remove('hidden');
        
        renderComments(customer.id);
        renderFiles(customer.id);
    } else {
        document.getElementById('customer-view-title').innerText = 'Nuevo Cliente';
        currentOpenCustomerId = null;
        document.getElementById('customer-id').value = '';
        
        ['ig', 'fb', 'tk'].forEach(net => {
            document.getElementById(`social-${net}-check`).checked = false;
            document.getElementById(`social-${net}-user`).value = '';
            document.getElementById(`social-${net}-pass`).value = '';
            document.getElementById(`social-${net}-fields`).style.display = 'none';
        });

        notesWarning.classList.remove('hidden');
        notesSection.classList.add('hidden');
        document.getElementById('customer-email-notice').value = '';
        document.getElementById('customer-wa-notice').value = '';
    }
    
    switchView('customer');
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('customer-id').value;
    let existingCustomer = null;
    if(id) existingCustomer = customers.find(c => c.id === parseInt(id));

    const newCustomer = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('name').value,
        company: document.getElementById('company').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        status: document.getElementById('status').value,
        type: document.getElementById('type').value,
        service: document.getElementById('service').value,
        socials: {
            ig: {
                active: document.getElementById(`social-ig-check`).checked,
                user: document.getElementById(`social-ig-user`).value,
                pass: document.getElementById(`social-ig-pass`).value
            },
            fb: {
                active: document.getElementById(`social-fb-check`).checked,
                user: document.getElementById(`social-fb-user`).value,
                pass: document.getElementById(`social-fb-pass`).value
            },
            tk: {
                active: document.getElementById(`social-tk-check`).checked,
                user: document.getElementById(`social-tk-user`).value,
                pass: document.getElementById(`social-tk-pass`).value
            }
        },
        comments: existingCustomer ? existingCustomer.comments : [],
        files: existingCustomer ? existingCustomer.files : [],
        emailNotice: emailNotice
    };

    const emailNotice = document.getElementById('customer-email-notice').value;
    const waNotice = document.getElementById('customer-wa-notice').value;

    if (id) {
        // Edit
        const index = customers.findIndex(c => c.id === parseInt(id));
        if(index !== -1) customers[index] = newCustomer;
    } else {
        // Add
        customers.unshift(newCustomer);
    }

    saveData();
    switchView('dashboard');
    updateStats();
    // Re-apply filters before rendering
    filterData();

    if(!id && (emailNotice || waNotice)) {
        let msg = `Email de Bienvenida:\n\nCliente: ${newCustomer.name}\nEmpresa: ${newCustomer.company}\nServicio: ${newCustomer.service}`;
        if(emailNotice) {
            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: emailNotice, subject: 'Bienvenido al CRM', body: msg })
            });
        }
        if(waNotice) {
            fetch('/api/send-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: waNotice, message: msg })
            });
        }
    }
}

// Logic for Notes, Files and Socials
window.toggleSocialFields = function(network) {
    const isChecked = document.getElementById(`social-${network}-check`).checked;
    const fields = document.getElementById(`social-${network}-fields`);
    fields.style.display = isChecked ? 'grid' : 'none';
};

function addComment() {
    const text = newCommentInput.value.trim();
    if (!text || !currentOpenCustomerId) return;
    
    const customer = customers.find(c => c.id === currentOpenCustomerId);
    if(customer) {
        if(!customer.comments) customer.comments = [];
        customer.comments.push({
            date: new Date().toLocaleString(),
            text: text
        });
        newCommentInput.value = '';
        saveData();
        renderComments(currentOpenCustomerId);
    }
}

function renderComments(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if(!customer) return;
    const comms = customer.comments || [];
    
    if(comms.length === 0) {
        commentsFeed.innerHTML = '<div style="color:var(--text-secondary);font-size:13px;text-align:center;margin-top:20px;">No hay comentarios todavía.</div>';
    } else {
        commentsFeed.innerHTML = comms.map(c => `
            <div class="comment-bubble">
                <span class="date">${c.date}</span>
                <span class="text">${c.text}</span>
            </div>
        `).join('');
    }
    commentsFeed.scrollTop = commentsFeed.scrollHeight;
}

function addFile(e) {
    if (!currentOpenCustomerId || !e.target.files.length) return;
    
    const customer = customers.find(c => c.id === currentOpenCustomerId);
    if(customer) {
        if(!customer.files) customer.files = [];
        
        // Simulating upload
        Array.from(e.target.files).forEach(file => {
            customer.files.push({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB'
            });
        });
        
        saveData();
        renderFiles(currentOpenCustomerId);
        e.target.value = ''; // reset
    }
}

function renderFiles(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if(!customer) return;
    const fls = customer.files || [];
    
    if(fls.length === 0) {
        filesList.innerHTML = '<li style="color:var(--text-secondary);font-size:13px;">No hay archivos.</li>';
    } else {
        filesList.innerHTML = fls.map(f => `
            <li class="file-item">
                <span><i class='bx bx-file'></i> ${f.name}</span>
                <span style="color:var(--text-muted);font-size:11px;">${f.size}</span>
            </li>
        `).join('');
    }
}

// --- CALENDAR LOGIC ---
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar() {
    const monthYear = document.getElementById('calendar-month-year');
    const calendarGrid = document.getElementById('calendar-grid-days');
    if (!monthYear || !calendarGrid) return;
    
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    monthYear.innerText = `${months[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Adjust first day for Monday start
    let startDay = firstDay === 0 ? 6 : firstDay - 1; 

    let html = '';
    
    // Empty cells
    for(let i = 0; i < startDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }
    
    // Day cells
    for(let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        const dayRecordings = recordings.filter(r => r.date === dateStr);
        let eventsHtml = '';
        dayRecordings.forEach(rec => {
            const client = customers.find(c => c.id === parseInt(rec.customerId));
            const clientName = client ? client.name : 'Desconocido';
            const timeStr = rec.time ? rec.time : '';
            const durationStr = rec.duration ? `(${rec.duration}h)` : '';
            eventsHtml += `
                <div class="recording-event" onclick="alert('Grabación: ${clientName}\\nHora: ${timeStr} ${durationStr}\\nTipo: ${rec.type}')" title="${timeStr} - ${clientName}">
                    <span class="event-time"><i class='bx bx-time'></i> ${timeStr}</span>
                    <span class="event-title">${clientName}</span>
                </div>
            `;
        });

        const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, i).toDateString() ? 'today' : '';

        html += `
            <div class="calendar-day ${isToday}">
                <div class="day-num">${i}</div>
                <div class="day-events">${eventsHtml}</div>
            </div>
        `;
    }
    
    calendarGrid.innerHTML = html;
}

function prevMonth() {
    currentMonth--;
    if(currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}
function nextMonth() {
    currentMonth++;
    if(currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function openRecordingModal() {
    const selClient = document.getElementById('rec-client');
    selClient.innerHTML = customers.map(c => `<option value="${c.id}">${c.name} (${c.company})</option>`).join('');
    
    const selAssignee = document.getElementById('rec-assignee');
    selAssignee.innerHTML = '<option value="" disabled selected>Selecciona un responsable</option>' + 
                            teamUsers.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
                            
    document.getElementById('recording-form').reset();
    document.getElementById('recording-modal').classList.add('active');
}
function closeRecordingModal() {
    document.getElementById('recording-modal').classList.remove('active');
}

function handleRecordingSubmit(e) {
    e.preventDefault();
    const customerId = document.getElementById('rec-client').value;
    const date = document.getElementById('rec-date').value;
    const time = document.getElementById('rec-time').value;
    const duration = document.getElementById('rec-duration').value;
    const type = document.getElementById('rec-type').value;
    const assigneeId = document.getElementById('rec-assignee').value;
    const emailExtra = document.getElementById('rec-email').value;
    const wa = document.getElementById('rec-wa').value;

    const recordingId = Date.now();
    const newRecording = {
        id: recordingId,
        customerId: parseInt(customerId),
        date: date,
        time: time,
        duration: duration,
        type: type,
        assigneeId: parseInt(assigneeId),
        email: emailExtra,
        wa: wa
    };

    recordings.push(newRecording);

    saveData();
    closeRecordingModal();
    renderCalendar();

    // Notificar al Responsable
    const responsible = teamUsers.find(u => u.id === parseInt(assigneeId));
    if(responsible && responsible.email) {
        let msg = `<h3>Nueva grabación asignada</h3>
                   <p>Hola <strong>${responsible.name}</strong>,</p>
                   <p>Se te ha asignado una nueva grabación en el CRM:</p>
                   <ul>
                       <li><strong>Fecha:</strong> ${date}</li>
                       <li><strong>Hora:</strong> ${time}</li>
                       <li><strong>Duración:</strong> ${duration}h</li>
                       <li><strong>Tipo:</strong> ${type}</li>
                   </ul>`;
                   
        fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                to: responsible.email, 
                subject: `Confirmación de Grabación: ${date}`, 
                body: msg 
            })
        });
    }

    // Notificaciones extra (Manuales)
    if(emailExtra || wa) {
        let plainMsg = `Nueva grabación asignada\nFecha: ${date} a las ${time}\nTipo: ${type}`;
        if(emailExtra) {
            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: emailExtra, subject: 'Aviso de grabación', body: plainMsg })
            });
        }
        if(wa) {
            fetch('/api/send-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: wa, message: plainMsg })
            });
        }
    }
}

// --- CHAT LOGIC ---
window.switchChannel = function(channelName) {
    currentChannel = channelName;
    document.getElementById('chat-channel-title').innerText = channelName;
    
    const channels = document.querySelectorAll('.chat-channel');
    channels.forEach(ch => {
        if(ch.innerText.trim() === channelName) {
            ch.classList.add('active');
        } else {
            ch.classList.remove('active');
        }
    });

    renderChat();
};

function renderChat() {
    const feed = document.getElementById('chat-feed');
    if (!feed) return;
    
    const messages = chatMessages.filter(m => m.channel === currentChannel);
    
    if(messages.length === 0) {
        feed.innerHTML = `<div style="text-align:center; color:var(--text-secondary); margin-top:20px;">No hay mensajes en #${currentChannel} todavía. ¡Escribe tu primer mensaje!</div>`;
        return;
    }
    
    feed.innerHTML = messages.map(msg => `
        <div class="chat-message ${msg.isSelf || (currentUser && msg.sender === currentUser.name) ? 'self' : ''}">
            <div class="chat-avatar">${msg.initials}</div>
            <div>
                <div class="chat-meta">
                    <span style="font-weight:600; color:var(--text-primary);">${msg.sender}</span>
                    <span>${msg.time}</span>
                </div>
                <div class="chat-bubble">${msg.text}</div>
            </div>
        </div>
    `).join('');
    // Scroll to bottom
    feed.scrollTop = feed.scrollHeight;
}

// --- TASKS KANBAN LOGIC ---
function renderTasks() {
    ['todo', 'in-progress', 'done'].forEach(status => {
        const container = document.getElementById(`tasks-${status}`);
        const countBadge = document.getElementById(`count-${status}`);
        if(!container) return;
        
        const filteredTasks = tasksList.filter(t => t.status === status);
        countBadge.innerText = filteredTasks.length;
        
        container.innerHTML = filteredTasks.map(task => {
            const user = teamUsers.find(u => u.id === parseInt(task.assigneeId)) || teamUsers[0];
            const client = customers.find(c => c.id === parseInt(task.clientId));
            const clientName = client ? client.name : "Interno";
            
            let dateStr = "Sin fecha";
            if(task.dueDate) {
                const d = new Date(task.dueDate);
                // Correct for timezone offset automatically standard in Spanish dates
                dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`;
            }

            return `
                <div class="kanban-card" draggable="true" ondragstart="drag(event, '${task.id}')">
                    <div class="task-meta">
                        <span class="task-badge priority-${task.priority}">${task.priority}</span>
                        ${task.clientId !== 0 ? `<span class="task-badge client"><i class='bx bx-user'></i> ${clientName}</span>` : ''}
                        <span class="task-badge date"><i class='bx bx-calendar'></i> ${dateStr}</span>
                    </div>
                    <h4>${task.title}</h4>
                    ${task.file ? `<div style="font-size:12px; color:var(--accent); margin-bottom:12px; display:flex; align-items:center; gap:6px;"><i class='bx bx-paperclip' style="font-size:14px;"></i> ${task.file.name}</div>` : ''}
                    <div class="kanban-card-footer">
                        <div class="assignee-badge">
                            <div class="assignee-avatar">${user.initials}</div>
                            <span>${user.name}</span>
                        </div>
                        <div class="kanban-actions">
                            <button onclick="editTask(${task.id})" title="Editar"><i class='bx bx-edit-alt'></i></button>
                            <button onclick="deleteTask(${task.id})" title="Eliminar"><i class='bx bx-trash'></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    });
}

window.drag = function(ev, taskId) {
    ev.dataTransfer.setData("text", taskId);
}
window.allowDrop = function(ev) {
    ev.preventDefault();
}
window.drop = function(ev, newStatus) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("text");
    const task = tasksList.find(t => t.id == parseInt(taskId));
    if(task) {
        task.status = newStatus;
        saveData();
        renderTasks();
    }
}

window.openTaskModal = function(taskId = null) {
    const selAss = document.getElementById('task-assignee');
    selAss.innerHTML = teamUsers.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    
    const selCli = document.getElementById('task-client');
    selCli.innerHTML = `<option value="0">Interno (Sin Cliente)</option>` + 
                       customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
                       
    document.getElementById('task-form').reset();
    document.getElementById('edit-task-id').value = '';
    document.getElementById('task-modal-title').innerText = 'Nueva Tarea';
    document.getElementById('task-current-file').innerText = '';
    document.getElementById('task-email-notice').value = ''; // Added this line for reset
    document.getElementById('task-wa-notice').value = ''; // Added this line for reset
    
    if(taskId) {
        const task = tasksList.find(t => t.id === taskId);
        if(task) {
            document.getElementById('task-modal-title').innerText = 'Editar Tarea';
            document.getElementById('edit-task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-assignee').value = task.assigneeId;
            document.getElementById('task-client').value = task.clientId;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-due-date').value = task.dueDate || '';
            document.getElementById('task-status').value = task.status;
            document.getElementById('task-email-notice').value = task.emailNotice || ''; // Added this line for editing
            if(task.file) {
                document.getElementById('task-current-file').innerText = `Archivo actual: ${task.file.name}`;
            }
        }
    }

    document.getElementById('task-modal').classList.add('active');
}

window.editTask = function(id) {
    openTaskModal(id);
}
window.closeTaskModal = function() {
    document.getElementById('task-modal').classList.remove('active');
}

window.deleteTask = function(id) {
    if(confirm('¿Seguro que deseas eliminar esta tarea?')) {
        tasksList = tasksList.filter(t => t.id !== parseInt(id));
        saveData();
        renderTasks();
    }
}

// Global Edit and Delete functions (called from inline onclick)
window.editCustomer = function(id) {
    const customer = customers.find(c => c.id === id);
    if(customer) openCustomerView(customer);
}

window.deleteCustomer = function(id) {
    if(confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        customers = customers.filter(c => c.id !== id);
        saveData();
        updateStats();
        filterData();
    }
}

// Export to CSV
window.exportCustomersToCSV = function() {
    const headers = ["Cliente", "Empresa", "Contacto", "Servicio", "Estado", "Tipo"];
    
    const rows = currentFilteredCustomers.map(c => [
        `"${c.name} - ${c.email}"`, 
        `"${c.company}"`,
        `"${c.phone}"`,
        `"${c.service}"`,
        `"${c.status}"`,
        `"${c.type}"`
    ]);
    
    // UTF-8 BOM para que Excel detecte tildes correctamente
    let csvContent = "\uFEFF" + headers.join(";") + "\n";
    rows.forEach(row => {
        csvContent += row.join(";") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.testEmailConnection = async function() {
    const userEmail = prompt("Introduce tu email de registro en Resend para el test:", "admin@agenciatonik.com");
    if(!userEmail) return;

    alert("Iniciando test... Ten paciencia y no cierres hasta recibir respuesta.");

    try {
        const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                to: userEmail, 
                subject: 'Test de Conexión CRM', 
                body: '<h1>¡Funciona!</h1><p>Si recibes esto, tu clave de Resend es correcta y el servidor está bien configurado.</p>' 
            })
        });
        
        const data = await res.json();
        if(res.ok && data.success) {
            alert("✅ ¡ÉXITO! El email se ha enviado. Revisa tu bandeja de entrada (y SPAM).");
        } else {
            alert("❌ ERROR: " + (data.error || "Error desconocido en el servidor"));
        }
    } catch (e) {
        alert("❌ ERROR DE CONEXIÓN: Asegúrate de que el servidor (node server.js) esté arrancado.");
    }
};

// Start app
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    init();
});

// --- AGENCY WHATSAPP FUNCTIONS ---
window.renderAgencyWA = function() {
    const grid = document.getElementById('agency-wa-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    agencyWALinks.forEach(link => {
        const card = document.createElement('div');
        card.className = 'glass-panel section-card';
        card.style.padding = '20px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.textAlign = 'center';
        
        card.innerHTML = `
            <div style="background:rgba(37,211,102,0.1); width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:15px;">
                <i class='bx bxl-whatsapp' style="color:#25d366; font-size:28px;"></i>
            </div>
            <h3 style="font-size:16px; margin-bottom:5px;">${link.name}</h3>
            <p style="color:var(--text-secondary); font-size:13px; margin-bottom:15px;">+${link.phone}</p>
            <div style="display:flex; gap:10px; width:100%;">
                <a href="https://wa.me/${link.phone}" target="_blank" class="btn-primary" style="flex:1; justify-content:center; background:#25d366; border:none;">
                    <i class='bx bx-message-rounded-dots'></i> Abrir Chat
                </a>
                <button onclick="deleteAgencyWA(${link.id})" class="btn-secondary" style="padding:10px; aspect-ratio:1/1;">
                    <i class='bx bx-trash'></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.openAgencyWAModal = function() {
    document.getElementById('agency-wa-form').reset();
    document.getElementById('agency-wa-modal').classList.add('active');
}

window.closeAgencyWAModal = function() {
    document.getElementById('agency-wa-modal').classList.remove('active');
}

window.deleteAgencyWA = function(id) {
    if(confirm('¿Deseas eliminar este canal de WhatsApp?')) {
        agencyWALinks = agencyWALinks.filter(link => link.id !== id);
        saveData();
        renderAgencyWA();
    }
}
