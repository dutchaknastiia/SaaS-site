// Initial Mock Data for Igor's 50+ / Fleet Equipment if storage is empty
const INITIAL_TOOLS = [
    { id: 1, name: "Bosch Rotary Hammer Drill", category: "Power Tools", price: 35, status: "Available", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80", rentCount: 12 },
    { id: 2, name: "Honda Mini Excavator 1.5t", category: "Heavy Machinery", price: 250, status: "Available", image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80", rentCount: 8 },
    { id: 3, name: "Husqvarna Chainsaw 450", category: "Garden Equipment", price: 45, status: "Available", image: "https://images.unsplash.com/photo-1617104551784-3c2993b3f37f?auto=format&fit=crop&w=600&q=80", rentCount: 15 },
    { id: 4, name: "DeWalt Angle Grinder 9-Inch", category: "Power Tools", price: 25, status: "Available", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80", rentCount: 10 },
    { id: 5, name: "Caterpillar Skid Steer Loader", category: "Heavy Machinery", price: 300, status: "Rented", image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80", rentCount: 22 },
    { id: 6, name: "Stihl Professional Lawn Mower", category: "Garden Equipment", price: 50, status: "Available", image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb26630?auto=format&fit=crop&w=600&q=80", rentCount: 6 },
    { id: 7, name: "Makita Demolition Hammer", category: "Power Tools", price: 60, status: "Maintenance", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80", rentCount: 9 },
    { id: 8, name: "JCB Vibro Compactor Plate", category: "Heavy Machinery", price: 90, status: "Available", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", rentCount: 11 },
    { id: 9, name: "Echo Leaf Blower Backpack", category: "Garden Equipment", price: 30, status: "Available", image: "https://images.unsplash.com/photo-1584467735811-62848fc32274?auto=format&fit=crop&w=600&q=80", rentCount: 7 },
    { id: 10, name: "Milwaukee Cordless Impact Wrench", category: "Power Tools", price: 40, status: "Available", image: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=600&q=80", rentCount: 14 },
    { id: 11, name: "Kubota Compact Tractor", category: "Heavy Machinery", price: 220, status: "Available", image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80", rentCount: 5 },
    { id: 12, name: "Toro Hedge Trimmer", category: "Garden Equipment", price: 35, status: "Available", image: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=600&q=80", rentCount: 4 },
    { id: 13, name: "Bosch Laser Leveler", category: "Power Tools", price: 30, status: "Available", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", rentCount: 13 }
];

// Initialize LocalStorage Data if not present
if (!localStorage.getItem('rentify_tools')) {
    localStorage.setItem('rentify_tools', JSON.stringify(INITIAL_TOOLS));
}
if (!localStorage.getItem('rentify_orders')) {
    localStorage.setItem('rentify_orders', JSON.stringify([]));
}

// State variables
let currentCategory = 'All';
let searchQuery = '';
let availableOnly = false;
let currentPage = 1;
const ITEMS_PER_PAGE = 8;

// DOM Elements
const catalogGrid = document.getElementById('catalogGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const availableOnlyToggle = document.getElementById('availableOnlyToggle');
const categoryButtons = document.querySelectorAll('.cat-btn');
const paginationContainer = document.getElementById('paginationContainer');
const statsTotalTools = document.getElementById('stats-total-tools');

// Modal Elements
const bookingModal = document.getElementById('bookingModal');
const modalToolName = document.getElementById('modalToolName');
const modalToolId = document.getElementById('modalToolId');
const rentalDaysInput = document.getElementById('rentalDays');
const modalTotalPrice = document.getElementById('modalTotalPrice');
const bookingForm = document.getElementById('bookingForm');

// Event Listeners
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    currentPage = 1;
    renderCatalog();
});

availableOnlyToggle.addEventListener('change', (e) => {
    availableOnly = e.target.checked;
    currentPage = 1;
    renderCatalog();
});

categoryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        categoryButtons.forEach(b => {
            b.classList.remove('bg-amber-500', 'text-white');
            b.classList.add('bg-slate-100', 'text-slate-700');
        });
        e.target.classList.remove('bg-slate-100', 'text-slate-700');
        e.target.classList.add('bg-amber-500', 'text-white');
        
        currentCategory = e.target.getAttribute('data-category');
        currentPage = 1;
        renderCatalog();
    });
});

rentalDaysInput.addEventListener('input', updateModalPrice);

bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const toolId = parseInt(modalToolId.value);
    const clientName = document.getElementById('clientName').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const days = parseInt(rentalDaysInput.value);

    let tools = JSON.parse(localStorage.getItem('rentify_tools'));
    let orders = JSON.parse(localStorage.getItem('rentify_orders'));

    const toolIndex = tools.findIndex(t => t.id === toolId);
    if (toolIndex !== -1) {
        const tool = tools[toolIndex];
        const totalPrice = tool.price * days;

        // Update tool status to Rented and increment rent count for analytics
        tools[toolIndex].status = 'Rented';
        tools[toolIndex].rentCount = (tools[toolIndex].rentCount || 0) + 1;
        localStorage.setItem('rentify_tools', JSON.stringify(tools));

        // Create order record
        const newOrder = {
            id: Date.now(),
            clientName,
            clientPhone,
            toolId: tool.id,
            toolName: tool.name,
            days,
            totalPrice,
            status: 'Pending Confirmation',
            date: new Date().toLocaleDateString()
        };

        orders.unshift(newOrder);
        localStorage.setItem('rentify_orders', JSON.stringify(orders));

        closeBookingModal();
        alert('Booking confirmed successfully! The tool status is now updated.');
        renderCatalog();
    }
});

let selectedToolForBooking = null;

function openBookingModal(toolId) {
    const tools = JSON.parse(localStorage.getItem('rentify_tools'));
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

    selectedToolForBooking = tool;
    modalToolId.value = tool.id;
    modalToolName.textContent = `${tool.name} ($${tool.price}/day)`;
    rentalDaysInput.value = 1;
    updateModalPrice();

    bookingModal.classList.remove('hidden');
}

function closeBookingModal() {
    bookingModal.classList.add('hidden');
    bookingForm.reset();
}

function updateModalPrice() {
    if (!selectedToolForBooking) return;
    const days = parseInt(rentalDaysInput.value) || 1;
    const total = selectedToolForBooking.price * days;
    modalTotalPrice.textContent = `$${total.toFixed(2)}`;
}

// Render Catalog with Pagination & Filters
function renderCatalog() {
    const tools = JSON.parse(localStorage.getItem('rentify_tools'));
    statsTotalTools.textContent = tools.length + '+';

    // Filtering
    const filtered = tools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery);
        const matchesCategory = currentCategory === 'All' || tool.category === currentCategory;
        const matchesAvailability = !availableOnly || tool.status === 'Available';
        return matchesSearch && matchesCategory && matchesAvailability;
    });

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTools = filtered.slice(start, start + ITEMS_PER_PAGE);

    catalogGrid.innerHTML = '';

    if (paginatedTools.length === 0) {
        emptyState.classList.remove('hidden');
        paginationContainer.innerHTML = '';
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    // Render Cards
    paginatedTools.forEach(tool => {
        let statusBadge = '';
        let btnDisabled = '';
        let btnClass = 'bg-amber-500 hover:bg-amber-600 text-white';
        let btnText = 'Book Now';

        if (tool.status === 'Available') {
            statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">Available</span>';
        } else if (tool.status === 'Rented') {
            statusBadge = '<span class="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">Rented</span>';
            btnDisabled = 'disabled';
            btnClass = 'bg-slate-200 text-slate-400 cursor-not-allowed';
            btnText = 'Rented Out';
        } else {
            statusBadge = '<span class="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-semibold">Maintenance</span>';
            btnDisabled = 'disabled';
            btnClass = 'bg-slate-200 text-slate-400 cursor-not-allowed';
            btnText = 'On Repair';
        }

        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition';
        card.innerHTML = `
            <div>
                <div class="relative h-48 bg-slate-100 overflow-hidden">
                    <img src="${tool.image}" alt="${tool.name}" class="w-full h-full object-cover">
                    <div class="absolute top-3 right-3">
                        ${statusBadge}
                    </div>
                </div>
                <div class="p-5">
                    <span class="text-[10px] uppercase tracking-wider font-semibold text-slate-400">${tool.category}</span>
                    <h3 class="font-bold text-slate-900 text-base mt-1 mb-2">${tool.name}</h3>
                    <div class="flex items-baseline space-x-1">
                        <span class="text-xl font-extrabold text-amber-600">$${tool.price}</span>
                        <span class="text-xs text-slate-500">/ day</span>
                    </div>
                </div>
            </div>
            <div class="p-5 pt-0">
                <button ${btnDisabled} onclick="openBookingModal(${tool.id})" class="w-full py-2.5 rounded-xl font-semibold text-sm transition shadow-sm ${btnClass}">
                    ${btnText}
                </button>
            </div>
        `;
        catalogGrid.appendChild(card);
    });

    // Render Pagination Buttons
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${i === currentPage ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderCatalog();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationContainer.appendChild(btn);
    }
}

// Initial Load
renderCatalog();