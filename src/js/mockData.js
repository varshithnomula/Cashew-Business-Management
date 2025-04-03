// Mock Data
const mockData = {
    suppliers: [
        {
            id: 1,
            name: "Kerala Cashews Ltd",
            contactPerson: "Rajesh Kumar",
            phone: "+91 9876543210",
            email: "rajesh@keralacashews.com",
            address: "Kollam, Kerala"
        },
        {
            id: 2,
            name: "Goa Nuts Exports",
            contactPerson: "Maria D'Souza",
            phone: "+91 9876543211",
            email: "maria@goanuts.com",
            address: "Panaji, Goa"
        },
        {
            id: 3,
            name: "Maharashtra Cashew Corp",
            contactPerson: "Amit Desai",
            phone: "+91 9876543212",
            email: "amit@mahacashew.com",
            address: "Ratnagiri, Maharashtra"
        }
    ],
    
    inventory: [
        {
            id: 1,
            type: "Raw",
            quantity: 1500,
            pricePerKg: 300,
            supplier: "Kerala Cashews Ltd",
            purchaseDate: "2024-03-01"
        },
        {
            id: 2,
            type: "W180",
            quantity: 300,
            pricePerKg: 700,
            processedDate: "2024-03-05"
        },
        {
            id: 3,
            type: "W240",
            quantity: 450,
            pricePerKg: 600,
            processedDate: "2024-03-06"
        }
    ],

    sales: [
        {
            id: 1,
            date: "2024-03-10",
            customer: "Sweet Delights",
            product: "W180",
            quantity: 50,
            pricePerKg: 800,
            totalAmount: 40000,
            status: "Completed"
        },
        {
            id: 2,
            date: "2024-03-12",
            customer: "Dry Fruit Mart",
            product: "W240",
            quantity: 75,
            pricePerKg: 700,
            totalAmount: 52500,
            status: "Pending"
        },
        {
            id: 3,
            date: "2024-03-15",
            customer: "Royal Sweets",
            product: "W180",
            quantity: 100,
            pricePerKg: 800,
            totalAmount: 80000,
            status: "Processing"
        }
    ],

    payments: [
        {
            id: 1,
            date: "2024-03-10",
            saleRef: "SALE001",
            amount: 40000,
            mode: "Bank Transfer",
            status: "Completed"
        },
        {
            id: 2,
            date: "2024-03-12",
            saleRef: "SALE002",
            amount: 25000,
            mode: "UPI",
            status: "Pending"
        },
        {
            id: 3,
            date: "2024-03-15",
            saleRef: "SALE003",
            amount: 80000,
            mode: "Cheque",
            status: "Processing"
        }
    ]
};

// Helper function to populate tables
function populateTables() {
    // Populate Suppliers Table
    const suppliersBody = document.querySelector('#suppliersTable tbody');
    if (suppliersBody) {
        suppliersBody.innerHTML = mockData.suppliers.map(supplier => `
            <tr>
                <td>${supplier.id}</td>
                <td>${supplier.name}</td>
                <td>${supplier.contactPerson}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.email}</td>
                <td>
                    <button class="btn-edit" onclick="editSupplier(${supplier.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteSupplier(${supplier.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Populate Sales Table
    const salesBody = document.querySelector('#salesTable tbody');
    if (salesBody) {
        salesBody.innerHTML = mockData.sales.map(sale => `
            <tr>
                <td>${sale.date}</td>
                <td>${sale.customer}</td>
                <td>${sale.product}</td>
                <td>${sale.quantity} kg</td>
                <td>₹${sale.totalAmount}</td>
                <td><span class="status-${sale.status.toLowerCase()}">${sale.status}</span></td>
            </tr>
        `).join('');
    }

    // Populate Payments Table
    const paymentsBody = document.querySelector('#paymentsTable tbody');
    if (paymentsBody) {
        paymentsBody.innerHTML = mockData.payments.map(payment => `
            <tr>
                <td>${payment.date}</td>
                <td>${payment.saleRef}</td>
                <td>₹${payment.amount}</td>
                <td>${payment.mode}</td>
                <td><span class="status-${payment.status.toLowerCase()}">${payment.status}</span></td>
            </tr>
        `).join('');
    }

    // Populate form dropdowns
    const supplierSelect = document.getElementById('supplierSelect');
    if (supplierSelect) {
        supplierSelect.innerHTML = mockData.suppliers.map(supplier => `
            <option value="${supplier.id}">${supplier.name}</option>
        `).join('');
    }

    const customerSelect = document.getElementById('customerSelect');
    if (customerSelect) {
        customerSelect.innerHTML = `
            <option value="1">Sweet Delights</option>
            <option value="2">Dry Fruit Mart</option>
            <option value="3">Royal Sweets</option>
        `;
    }

    const saleSelect = document.getElementById('saleSelect');
    if (saleSelect) {
        saleSelect.innerHTML = mockData.sales.map(sale => `
            <option value="${sale.id}">SALE00${sale.id} - ${sale.customer} (₹${sale.totalAmount})</option>
        `).join('');
    }
}

// Form handling functions
function toggleForm(formId) {
    const form = document.getElementById(formId);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function handleSupplierSubmit(event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById('supplierName').value,
        address: document.getElementById('address').value,
        contactPerson: document.getElementById('contactPerson').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value
    };
    console.log('New Supplier:', formData);
    // Add to mockData and refresh table
    mockData.suppliers.push({
        id: mockData.suppliers.length + 1,
        ...formData
    });
    populateTables();
    toggleForm('supplierForm');
    event.target.reset();
}

function handleInventorySubmit(event) {
    event.preventDefault();
    const formData = {
        supplierId: document.getElementById('supplierSelect').value,
        quantity: document.getElementById('quantity').value,
        pricePerKg: document.getElementById('pricePerKg').value,
        purchaseDate: document.getElementById('purchaseDate').value
    };
    console.log('New Inventory:', formData);
    // Add to mockData and refresh
    mockData.inventory.push({
        id: mockData.inventory.length + 1,
        ...formData
    });
    populateTables();
    toggleForm('inventoryForm');
    event.target.reset();
}

function handleSaleSubmit(event) {
    event.preventDefault();
    const formData = {
        customerId: document.getElementById('customerSelect').value,
        product: document.getElementById('productSelect').value,
        quantity: document.getElementById('saleQuantity').value,
        pricePerKg: document.getElementById('salePrice').value,
        date: new Date().toISOString().split('T')[0]
    };
    console.log('New Sale:', formData);
    // Add to mockData and refresh
    mockData.sales.push({
        id: mockData.sales.length + 1,
        ...formData,
        totalAmount: formData.quantity * formData.pricePerKg,
        status: 'Pending'
    });
    populateTables();
    toggleForm('salesForm');
    event.target.reset();
}

function handlePaymentSubmit(event) {
    event.preventDefault();
    const formData = {
        saleId: document.getElementById('saleSelect').value,
        amount: document.getElementById('paymentAmount').value,
        mode: document.getElementById('paymentMode').value,
        date: new Date().toISOString().split('T')[0]
    };
    console.log('New Payment:', formData);
    // Add to mockData and refresh
    mockData.payments.push({
        id: mockData.payments.length + 1,
        ...formData,
        status: 'Processing'
    });
    populateTables();
    toggleForm('paymentForm');
    event.target.reset();
}

// Initialize tables when the page loads
document.addEventListener('DOMContentLoaded', populateTables);

// Export mock data and functions
window.mockData = mockData;
window.toggleForm = toggleForm;
window.handleSupplierSubmit = handleSupplierSubmit;
window.handleInventorySubmit = handleInventorySubmit;
window.handleSaleSubmit = handleSaleSubmit;
window.handlePaymentSubmit = handlePaymentSubmit;