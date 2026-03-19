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

let chatMessages = [
    { id: 1, sender: "Admin User", initials: "AU", text: "¡Bienvenidos al nuevo espacio de chat del equipo!", time: "09:00", isSelf: true, channel: "General" },
    { id: 2, sender: "María D.", initials: "MD", text: "Tiene muy buena pinta el calendario de grabaciones.", time: "09:15", isSelf: false, channel: "General" },
    { id: 3, sender: "Carlos Dev", initials: "CD", text: "Recordad que acabo de subir las contraseñas de Acme Corp.", time: "09:42", isSelf: false, channel: "Desarrollo Web" }
];

let teamUsers = [
    { id: 1, name: "Admin User", initials: "AU" },
    { id: 2, name: "María D.", initials: "MD" },
    { id: 3, name: "Carlos Dev", initials: "CD" }
];

let tasksList = [
    { id: 1, title: "Diseñar logo Acme Corp", assigneeId: 2, status: "todo", priority: "alta", dueDate: "2026-03-25", clientId: 1, file: null },
    { id: 2, title: "Revisar contrato Kit Digital", assigneeId: 1, status: "in-progress", priority: "media", dueDate: "2026-03-22", clientId: 2, file: { name: "contrato_firmado.pdf" } },
    { id: 3, title: "Actualizar base de datos MySQL", assigneeId: 3, status: "done", priority: "baja", dueDate: "2026-03-20", clientId: 4, file: null }
];

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

// Initialization
function init() {
    renderTable(customers);
    updateStats();
    setupEventListeners();
    
    // Auto-setup current view calendar
    renderCalendar();
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
                            <div class="name">${customer.name}</div>
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
                sender: "Admin User",
                initials: "AU",
                text: input.value.trim(),
                time: timeStr,
                isSelf: true,
                channel: currentChannel
            });
            
            input.value = '';
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
            const fileInput = document.getElementById('task-file');
            
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
                        file: fileObj
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
                    file: fileObj
                });
            }

            closeTaskModal();
            renderTasks();
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
        files: existingCustomer ? existingCustomer.files : []
    };

    if (id) {
        // Edit
        const index = customers.findIndex(c => c.id === parseInt(id));
        if(index !== -1) customers[index] = newCustomer;
    } else {
        // Add
        customers.unshift(newCustomer);
    }

    switchView('dashboard');
    updateStats();
    // Re-apply filters before rendering
    filterData();
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
    const sel = document.getElementById('rec-client');
    sel.innerHTML = customers.map(c => `<option value="${c.id}">${c.name} (${c.company})</option>`).join('');
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

    recordings.push({
        id: Date.now(),
        customerId: parseInt(customerId),
        date: date,
        time: time,
        duration: duration,
        type: type
    });

    closeRecordingModal();
    renderCalendar();
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
        <div class="chat-message ${msg.isSelf ? 'self' : ''}">
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
        updateStats();
        filterData();
    }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
