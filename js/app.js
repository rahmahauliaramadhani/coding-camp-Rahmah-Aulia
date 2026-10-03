let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['Food', 'Transport', 'Fun'];
let budgetLimit = localStorage.getItem('budgetLimit') || 0;
let currentTheme = localStorage.getItem('theme') || 'light';
let chartInstance = null;

const balanceEl = document.getElementById('total-balance');
const formEl = document.getElementById('transaction-form');
const nameInput = document.getElementById('item-name');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const listEl = document.getElementById('transaction-list');
const sortFilter = document.getElementById('sort-filter');
const themeToggle = document.getElementById('theme-toggle');
const limitInput = document.getElementById('budget-limit');
const alertEl = document.getElementById('limit-alert');
const newCatInput = document.getElementById('new-category');
const addCatBtn = document.getElementById('add-category-btn');

function init() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    limitInput.value = budgetLimit > 0 ? budgetLimit : '';
    renderCategories();
    updateUI();
}

function renderCategories() {
    categorySelect.innerHTML = '';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat; opt.textContent = cat;
        categorySelect.appendChild(opt);
    });
}

function updateUI() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('budgetLimit', budgetLimit);

    const total = transactions.reduce((acc, item) => acc + item.amount, 0);
    balanceEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;

    if (budgetLimit > 0 && total > budgetLimit) alertEl.classList.remove('hidden');
    else alertEl.classList.add('hidden');

    renderList();
    renderChart();
}

function renderList() {
    listEl.innerHTML = '';
    let sorted = [...transactions];
    const mode = sortFilter.value;
    
    if (mode === 'amount-high') sorted.sort((a, b) => b.amount - a.amount);
    else if (mode === 'amount-low') sorted.sort((a, b) => a.amount - b.amount);
    else if (mode === 'category') sorted.sort((a, b) => a.category.localeCompare(b.category));
    else sorted.reverse();

    sorted.forEach(item => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <small style="background:#eee; padding:2px 6px; border-radius:4px; color:#333;">${item.category}</small>
            </div>
            <div>
                <strong>Rp ${item.amount.toLocaleString('id-ID')}</strong> 
                <button class="btn-delete" onclick="deleteTransaction(${item.id})">🗑️</button>
            </div>
        `;
        listEl.appendChild(li);
    });
}

function renderChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    const dataMap = {};
    categories.forEach(c => dataMap[c] = 0);
    transactions.forEach(t => { 
        if(dataMap[t.category] !== undefined) dataMap[t.category] += t.amount; 
    });

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(dataMap),
            datasets: [{ 
                data: Object.values(dataMap), 
                backgroundColor: ['#4faf50', '#ff9800', '#2196f3', '#9c27b0', '#e91e63', '#00bcd4'] 
            }]
        },
        options: { responsive: true }
    });
}

formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!nameInput.value.trim() || !amountInput.value) return alert('Semua field wajib diisi!');
    
    transactions.push({ 
        id: Date.now(), 
        name: nameInput.value.trim(), 
        amount: parseFloat(amountInput.value), 
        category: categorySelect.value 
    });
    formEl.reset(); 
    updateUI();
});

window.deleteTransaction = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateUI();
};

addCatBtn.addEventListener('click', () => {
    const val = newCatInput.value.trim();
    if(val && !categories.includes(val)) { 
        categories.push(val); 
        newCatInput.value = ''; 
        renderCategories(); 
        updateUI(); 
    }
});

limitInput.addEventListener('input', (e) => { budgetLimit = parseFloat(e.target.value) || 0; updateUI(); });
sortFilter.addEventListener('change', renderList);
themeToggle.addEventListener('click', () => { 
    currentTheme = currentTheme === 'light' ? 'dark' : 'light'; 
    document.documentElement.setAttribute('data-theme', currentTheme); 
    localStorage.setItem('theme', currentTheme); 
});

init();