// RBAC Authentication Check
const loginOverlay = document.getElementById('loginOverlay');
const dashboardApp = document.getElementById('dashboardApp');
const loginForm = document.getElementById('loginForm');
const adminPasswordInput = document.getElementById('adminPassword');

// Check if already authenticated in session
if (sessionStorage.getItem('rentify_admin_auth') === 'true') {
    loginOverlay.classList.add('hidden');
    dashboardApp.classList.remove('hidden');
    initDashboard();
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (adminPasswordInput.value === 'admin123') {
        sessionStorage.setItem('rentify_admin_auth', 'true');
        loginOverlay.classList.add('hidden');
        dashboardApp.classList.remove('hidden');
        initDashboard();
    } else {
        alert('Invalid password! Hint: admin123');
    }
});

function logoutAdmin() {
    sessionStorage.removeItem('rentify_admin_auth');
    window.location.href = 'index.html';
}

// Navigation Tabs
function switchTab(tabName) {
    const tabs = ['inventory', 'orders', 'analytics'];
    tabs.forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
        const navBtn = document.getElementById(`nav-${t}`);
        navBtn.classList.remove('bg-amber-500', 'text-white');
        navBtn.classList.add('text-slate-400', 'hover:bg-slate-800', 'hover:text-white');
    });

    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    const activeNav = document.getElementById(`nav-${tabName}`);
    activeNav.classList.remove('text-slate-400', 'hover:bg-slate-800', 'hover:text-white');
    activeNav.classList.add('bg-amber-500', 'text-white');

    const titles = {
        inventory: 'Inventory Management',
        orders: 'Orders Management',
        analytics: 'Analytics & Performance'
    };
    document.getElementById('pageTitle').textContent = titles[tabName];

    if (tabName === 'analytics') {
        renderCharts();
    }
}

// Dashboard Initialization
function initDashboard() {
    renderAdminInventory();
    renderAdminOrders();
}

// INVENTORY CRUD FUNCTIONS
const adminInventoryTableBody = document.getElementById('adminInventoryTableBody');
const toolModal = document.getElementById('toolModal');
const toolForm = document.getElementById('toolForm');
const toolModalTitle = document.getElementById('toolModalTitle');
const editToolId = document.getElementById('editToolId');

function openToolModal(toolId = null) {
    toolModal.classList.remove('hidden');
    if (toolId) {
        toolModalTitle.textContent = 'Edit Tool';
        const tools = JSON.parse(localStorage.getItem('rentify_tools'));
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
            editToolId.value = tool.id;
            document.getElementById('toolName').value = tool.name;
            document.getElementById('toolCategory').value = tool.category;
            document.getElementById('toolPrice').value = tool.price;
            document.getElementById('toolImage').value = tool.image;
            document.getElementById('toolStatus').value = tool.status;
        }
    } else {
        toolModalTitle.textContent = 'Add New Tool';
        toolForm.reset();
        editToolId.value = '';
    }
}

function closeToolModal() {
    toolModal.classList.add('hidden');
    toolForm.reset();
}

toolForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const idVal = editToolId.value;
    const name = document.getElementById('toolName').value;
    const category = document.getElementById('toolCategory').value;
    const price = parseFloat(document.getElementById('toolPrice').value);
    const image = document.getElementById('toolImage').value;
    const status = document.getElementById('toolStatus').value;

    let tools = JSON.parse(localStorage.getItem('rentify_tools'));

    if (idVal) {
        // Update
        const index = tools.findIndex(t => t.id == idVal);
        if (index !== -1) {
            tools[index] = { ...tools[index], name, category, price, image, status };
        }
    } else {
        // Create
        const newTool = {
            id: Date.now(),
            name,
            category,
            price,
            image,
            status,
            rentCount: 0
        };
        tools.unshift(newTool);
    }

    localStorage.setItem('rentify_tools', JSON.stringify(tools));
    closeToolModal();
    renderAdminInventory();
});

function deleteTool(id) {
    if (confirm('Are you sure you want to delete this tool?')) {
        let tools = JSON.parse(localStorage.getItem('rentify_tools'));
        tools = tools.filter(t => t.id !== id);
        localStorage.setItem('rentify_tools', JSON.stringify(tools));
        renderAdminInventory();
    }
}

function renderAdminInventory() {
    const tools = JSON.parse(localStorage.getItem('rentify_tools'));
    adminInventoryTableBody.innerHTML = '';

    tools.forEach(tool => {
        let statusClass = 'bg-emerald-100 text-emerald-700';
        if (tool.status === 'Rented') statusClass = 'bg-blue-100 text-blue-700';
        if (tool.status === 'Maintenance') statusClass = 'bg-rose-100 text-rose-700';

        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 transition';
        row.innerHTML = `
            <td class="p-4 flex items-center space-x-3">
                <img src="${tool.image}" class="w-10 h-10 rounded-lg object-cover border border-slate-200">
                <span class="font-semibold text-slate-800">${tool.name}</span>
            </td>
            <td class="p-4 text-slate-600">${tool.category}</td>
            <td class="p-4 font-bold text-amber-600">$${tool.price}</td>
            <td class="p-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}">${tool.status}</span></td>
            <td class="p-4 text-right space-x-2">
                <button onclick="openToolModal(${tool.id})" class="text-slate-400 hover:text-amber-600 p-1.5 transition"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteTool(${tool.id})" class="text-slate-400 hover:text-rose-600 p-1.5 transition"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        adminInventoryTableBody.appendChild(row);
    });
}

// ORDERS MANAGEMENT FUNCTIONS
const adminOrdersTableBody = document.getElementById('adminOrdersTableBody');

function renderAdminOrders() {
    const orders = JSON.parse(localStorage.getItem('rentify_orders')) || [];
    adminOrdersTableBody.innerHTML = '';

    if (orders.length === 0) {
        adminOrdersTableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-400">No rental orders yet.</td></tr>`;
        return;
    }

    orders.forEach(order => {
        let statusBg = 'bg-amber-100 text-amber-700';
        if (order.status === 'Issued') statusBg = 'bg-blue-100 text-blue-700';
        if (order.status === 'Returned') statusBg = 'bg-emerald-100 text-emerald-700';

        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 transition';
        row.innerHTML = `
            <td class="p-4">
                <div class="font-bold text-slate-800">${order.clientName}</div>
                <div class="text-xs text-slate-500">${order.clientPhone}</div>
            </td>
            <td class="p-4 font-medium text-slate-700">${order.toolName}</td>
            <td class="p-4 text-slate-600">${order.days} days</td>
            <td class="p-4 font-bold text-amber-600">$${order.totalPrice.toFixed(2)}</td>
            <td class="p-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${statusBg}">${order.status}</span></td>
            <td class="p-4 text-right">
                <select onchange="updateOrderStatus(${order.id}, this.value)" class="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="Pending Confirmation" ${order.status === 'Pending Confirmation' ? 'selected' : ''}>Pending</option>
                    <option value="Issued" ${order.status === 'Issued' ? 'selected' : ''}>Issued</option>
                    <option value="Returned" ${order.status === 'Returned' ? 'selected' : ''}>Returned</option>
                </select>
            </td>
        `;
        adminOrdersTableBody.appendChild(row);
    });
}

function updateOrderStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem('rentify_orders'));
    let tools = JSON.parse(localStorage.getItem('rentify_tools'));

    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        const toolId = orders[orderIndex].toolId;

        // If returned, automatically set tool status back to Available
        if (newStatus === 'Returned') {
            const toolIndex = tools.findIndex(t => t.id === toolId);
            if (toolIndex !== -1) {
                tools[toolIndex].status = 'Available';
            }
        }

        localStorage.setItem('rentify_orders', JSON.stringify(orders));
        localStorage.setItem('rentify_tools', JSON.stringify(tools));
        renderAdminOrders();
    }
}

// CHART.JS ANALYTICS
let revenueChartInstance = null;
let topToolsChartInstance = null;

function renderCharts() {
    const orders = JSON.parse(localStorage.getItem('rentify_orders')) || [];
    const tools = JSON.parse(localStorage.getItem('rentify_tools')) || [];

    // Calculate dynamic monthly revenue based on orders
    const monthlyRevenue = { 'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0, 'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 4500, 'Nov': 0, 'Dec': 0 };
    orders.forEach(o => {
        // Default demo month attribution for simplicity or current month
        monthlyRevenue['Oct'] += o.totalPrice;
    });

    // Revenue Chart
    const ctxRev = document.getElementById('revenueChart').getContext('2d');
    if (revenueChartInstance) revenueChartInstance.destroy();
    revenueChartInstance = new Chart(ctxRev, {
        type: 'bar',
        data: {
            labels: Object.keys(monthlyRevenue),
            datasets: [{
                label: 'Revenue ($)',
                data: Object.values(monthlyRevenue),
                backgroundColor: '#f59e0b',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });

    // Top 3 Rented Tools
    const sortedTools = [...tools].sort((a, b) => (b.rentCount || 0) - (a.rentCount || 0)).slice(0, 3);
    const topNames = sortedTools.map(t => t.name);
    const topCounts = sortedTools.map(t => t.rentCount || 0);

    const ctxTop = document.getElementById('topToolsChart').getContext('2d');
    if (topToolsChartInstance) topToolsChartInstance.destroy();
    topToolsChartInstance = new Chart(ctxTop, {
        type: 'doughnut',
        data: {
            labels: topNames,
            datasets: [{
                data: topCounts,
                backgroundColor: ['#0f172a', '#f59e0b', '#64748b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}