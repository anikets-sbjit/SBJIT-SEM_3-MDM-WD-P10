
const STORAGE_KEY = 'aniket_money_manager_transactions';

const CATEGORIES = {
  expense: [
    { name: 'Food & Dining', icon: 'restaurant' },
    { name: 'Groceries', icon: 'shopping_cart' },
    { name: 'Shopping', icon: 'shopping_bag' },
    { name: 'Housing & Rent', icon: 'home' },
    { name: 'Transportation', icon: 'directions_car' },
    { name: 'Utilities & Bills', icon: 'receipt' },
    { name: 'Entertainment', icon: 'movie' },
    { name: 'Health & Wellness', icon: 'medical_services' },
    { name: 'Education', icon: 'school' },
    { name: 'Other Expense', icon: 'more_horiz' }
  ],
  income: [
    { name: 'Salary', icon: 'payments' },
    { name: 'Freelance & Projects', icon: 'work' },
    { name: 'Investments', icon: 'trending_up' },
    { name: 'Business', icon: 'storefront' },
    { name: 'Gifts & Bonus', icon: 'featured_seasonal_and_gifts' },
    { name: 'Other Income', icon: 'savings' }
  ]
};

const INITIAL_TRANSACTIONS = [
  {
    id: 'txn_101',
    type: 'income',
    title: 'Monthly Salary Credit',
    amount: 65000,
    category: 'Salary',
    date: getOffsetDate(-12),
    paymentMethod: 'Bank Account',
    notes: 'Primary monthly compensation'
  },
  {
    id: 'txn_102',
    type: 'expense',
    title: 'Apartment Monthly Rent',
    amount: 18000,
    category: 'Housing & Rent',
    date: getOffsetDate(-10),
    paymentMethod: 'UPI / Online',
    notes: 'Paid via bank transfer'
  },
  {
    id: 'txn_103',
    type: 'expense',
    title: 'Supermarket Grocery Run',
    amount: 4250,
    category: 'Groceries',
    date: getOffsetDate(-7),
    paymentMethod: 'Debit / Credit Card',
    notes: 'Pantry restocking'
  },
  {
    id: 'txn_104',
    type: 'income',
    title: 'UI Design Freelance Milestone',
    amount: 14500,
    category: 'Freelance & Projects',
    date: getOffsetDate(-5),
    paymentMethod: 'UPI / Online',
    notes: 'Client app design phase 1'
  },
  {
    id: 'txn_105',
    type: 'expense',
    title: 'Electricity & Wifi Utility Bills',
    amount: 2850,
    category: 'Utilities & Bills',
    date: getOffsetDate(-3),
    paymentMethod: 'UPI / Online',
    notes: 'Power & broadband bill'
  },
  {
    id: 'txn_106',
    type: 'expense',
    title: 'Weekend Dinner & Cafe',
    amount: 1650,
    category: 'Food & Dining',
    date: getOffsetDate(-1),
    paymentMethod: 'Debit / Credit Card',
    notes: 'Dinner with college friends'
  }
];

function getOffsetDate(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

let transactions = [];
let pendingDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  initDateHeader();
  loadTransactions();
  populateCategorySelect('expense');
  populateHistoryCategoryFilter();
  setDefaultDateInput();
  
  renderDashboard();
  renderHistory();
});

function initDateHeader() {
  const dateEl = document.getElementById('currentDateDisplay');
  if (dateEl) {
    const today = new Date();
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    dateEl.textContent = today.toLocaleDateString('en-US', options);
  }
}

function setDefaultDateInput() {
  const dateInput = document.getElementById('entryDate');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('pastel_money_manager_transactions');
    if (saved) {
      transactions = JSON.parse(saved);
    } else {
      transactions = [...INITIAL_TRANSACTIONS];
      saveTransactions();
    }
  } catch (err) {
    console.error('Error reading localStorage, using defaults', err);
    transactions = [...INITIAL_TRANSACTIONS];
  }
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving to localStorage', err);
  }
}

function switchTab(tabId) {
  const tabs = ['dashboard', 'add', 'history'];
  
  tabs.forEach(tab => {
    const section = document.getElementById(`tab${capitalize(tab)}`);
    const btn = document.getElementById(`tabBtn${capitalize(tab)}`);
    
    if (tab === tabId) {
      if (section) section.classList.remove('hidden');
      if (btn) {
        btn.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-white text-amber-950 shadow-sm hover:shadow-md';
      }
    } else {
      if (section) section.classList.add('hidden');
      if (btn) {
        btn.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-amber-900/80 hover:text-amber-950 hover:bg-white/70 hover:shadow-xs';
      }
    }
  });

  if (tabId === 'dashboard') {
    renderDashboard();
  } else if (tabId === 'history') {
    renderHistory();
  }
}

function goToAdd(type) {
  switchTab('add');
  setTransactionType(type);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function setTransactionType(type) {
  const typeInput = document.getElementById('entryType');
  const btnExpense = document.getElementById('btnTypeExpense');
  const btnIncome = document.getElementById('btnTypeIncome');

  typeInput.value = type;

  if (type === 'expense') {
    btnExpense.className = 'flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-amber-200 text-amber-950 shadow-sm hover:shadow';
    btnIncome.className = 'flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-stone-600 hover:text-amber-950 hover:bg-white/50';
  } else {
    btnIncome.className = 'flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-amber-200 text-amber-950 shadow-sm hover:shadow';
    btnExpense.className = 'flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-stone-600 hover:text-amber-950 hover:bg-white/50';
  }

  populateCategorySelect(type);
}

function populateCategorySelect(type) {
  const categorySelect = document.getElementById('entryCategory');
  if (!categorySelect) return;

  categorySelect.innerHTML = '';
  const list = CATEGORIES[type] || [];
  list.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.name;
    opt.textContent = cat.name;
    categorySelect.appendChild(opt);
  });
}

function populateHistoryCategoryFilter() {
  const filterSelect = document.getElementById('historyCategoryFilter');
  if (!filterSelect) return;

  const currentSelection = filterSelect.value || 'all';
  filterSelect.innerHTML = '<option value="all">All Categories</option>';

  const allCategories = new Set();
  CATEGORIES.expense.forEach(c => allCategories.add(c.name));
  CATEGORIES.income.forEach(c => allCategories.add(c.name));

  allCategories.forEach(catName => {
    const opt = document.createElement('option');
    opt.value = catName;
    opt.textContent = catName;
    filterSelect.appendChild(opt);
  });

  filterSelect.value = currentSelection;
}

function handleFormSubmit(event) {
  event.preventDefault();

  const type = document.getElementById('entryType').value;
  const amount = parseFloat(document.getElementById('entryAmount').value);
  const title = document.getElementById('entryTitle').value.trim();
  const category = document.getElementById('entryCategory').value;
  const date = document.getElementById('entryDate').value;
  const paymentMethod = document.getElementById('entryPayment').value;
  const notes = document.getElementById('entryNotes').value.trim();

  if (!amount || amount <= 0 || isNaN(amount)) {
    showToast('Please enter a valid amount', 'error');
    return;
  }

  if (!title) {
    showToast('Please provide a description', 'error');
    return;
  }

  const newTxn = {
    id: 'txn_' + Date.now(),
    type,
    title,
    amount,
    category,
    date: date || new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Other',
    notes: notes || ''
  };

  transactions.unshift(newTxn);
  saveTransactions();

  showToast(`Added ${type === 'income' ? 'Income' : 'Expense'} of ₹${formatNumber(amount)}`, 'success');

  document.getElementById('entryAmount').value = '';
  document.getElementById('entryTitle').value = '';
  document.getElementById('entryNotes').value = '';
  setDefaultDateInput();

  switchTab('dashboard');
}

function resetTransactionForm() {
  document.getElementById('transactionForm').reset();
  setTransactionType('expense');
  setDefaultDateInput();
}

function renderDashboard() {
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  const expenseCategoryTotals = {};

  transactions.forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') {
      totalIncome += amt;
      incomeCount++;
    } else {
      totalExpense += amt;
      expenseCount++;
      expenseCategoryTotals[t.category] = (expenseCategoryTotals[t.category] || 0) + amt;
    }
  });

  const netBalance = totalIncome - totalExpense;

  document.getElementById('dashboardNetBalance').textContent = `₹${formatNumber(netBalance)}`;
  document.getElementById('dashboardTotalIncome').textContent = `₹${formatNumber(totalIncome)}`;
  document.getElementById('dashboardTotalExpense').textContent = `₹${formatNumber(totalExpense)}`;

  document.getElementById('incomeCount').textContent = incomeCount;
  document.getElementById('expenseCount').textContent = expenseCount;

  const savingsRate = totalIncome > 0 
    ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))) 
    : 0;

  const savingsRatePercentEl = document.getElementById('savingsRatePercent');
  const savingsRateBarEl = document.getElementById('savingsRateBar');
  const savingsRateStatusEl = document.getElementById('savingsRateStatus');
  const savingsTipEl = document.getElementById('savingsTip');

  if (savingsRatePercentEl) savingsRatePercentEl.textContent = `${savingsRate}%`;
  if (savingsRateBarEl) savingsRateBarEl.style.width = `${savingsRate}%`;

  if (savingsRateStatusEl && savingsTipEl) {
    if (totalIncome === 0 && totalExpense === 0) {
      savingsRateStatusEl.textContent = 'No Data';
      savingsTipEl.textContent = 'Start by logging your income and expenses to track your financial health.';
    } else if (savingsRate >= 40) {
      savingsRateStatusEl.textContent = 'Excellent';
      savingsTipEl.textContent = 'Outstanding savings! You are retaining more than 40% of your earnings.';
    } else if (savingsRate >= 20) {
      savingsRateStatusEl.textContent = 'Healthy';
      savingsTipEl.textContent = 'Good financial balance. Keep steady tabs on your daily expenditures.';
    } else if (savingsRate > 0) {
      savingsRateStatusEl.textContent = 'Modest';
      savingsTipEl.textContent = 'You are saving a small portion. Look for recurring costs you can trim.';
    } else {
      savingsRateStatusEl.textContent = 'Overspending';
      savingsTipEl.textContent = 'Expenses exceed or equal your total earnings. Consider prioritizing essentials.';
    }
  }

  renderCategoryBreakdown(expenseCategoryTotals, totalExpense);

  renderRecentTransactions();
}

function renderCategoryBreakdown(catTotals, totalExpense) {
  const container = document.getElementById('dashboardCategoryList');
  const emptyEl = document.getElementById('dashboardEmptyCategories');
  if (!container || !emptyEl) return;

  const entries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0 || totalExpense === 0) {
    container.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  container.innerHTML = '';

  const topEntries = entries.slice(0, 5);

  topEntries.forEach(([catName, amount]) => {
    const pct = Math.round((amount / totalExpense) * 100);
    const icon = getCategoryIcon(catName, 'expense');

    const item = document.createElement('div');
    item.className = 'space-y-1.5 p-2 -mx-2 rounded-2xl hover:bg-yellow-50/60 transition-all duration-200';
    item.innerHTML = `
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-yellow-100 text-amber-800 flex items-center justify-center shadow-xs">
            <span class="material-symbols-outlined text-sm">${icon}</span>
          </span>
          <span class="font-semibold text-stone-800">${escapeHtml(catName)}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-amber-950">₹${formatNumber(amount)}</span>
          <span class="text-stone-400 font-medium">(${pct}%)</span>
        </div>
      </div>
      <div class="w-full bg-yellow-100/70 h-2 rounded-full overflow-hidden shadow-inner">
        <div class="bg-amber-300 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderRecentTransactions() {
  const container = document.getElementById('dashboardRecentList');
  const emptyEl = document.getElementById('dashboardEmptyRecent');
  if (!container || !emptyEl) return;

  if (transactions.length === 0) {
    container.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  container.innerHTML = '';

  const recents = transactions.slice(0, 4);

  recents.forEach(txn => {
    const isIncome = txn.type === 'income';
    const icon = getCategoryIcon(txn.category, txn.type);

    const row = document.createElement('div');
    row.className = 'py-3 px-3 rounded-2xl flex items-center justify-between gap-3 hover:bg-yellow-50/70 hover:shadow-xs hover:translate-x-1 transition-all duration-200 group cursor-default';
    row.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-2xl ${isIncome ? 'bg-yellow-100 text-amber-800' : 'bg-yellow-50 text-amber-900 border border-yellow-200'} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
          <span class="material-symbols-outlined text-xl">${icon}</span>
        </div>
        <div class="min-w-0">
          <div class="text-sm font-semibold text-amber-950 truncate">${escapeHtml(txn.title)}</div>
          <div class="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
            <span>${formatDateString(txn.date)}</span>
            <span>•</span>
            <span class="px-2 py-0.2 rounded-md bg-yellow-50 text-amber-900 text-2xs font-medium border border-yellow-100">${escapeHtml(txn.category)}</span>
          </div>
        </div>
      </div>
      <div class="text-right shrink-0">
        <div class="text-sm font-bold ${isIncome ? 'text-amber-800' : 'text-stone-800'}">
          ${isIncome ? '+' : '-'}₹${formatNumber(txn.amount)}
        </div>
        <div class="text-2xs text-stone-400 mt-0.5">${escapeHtml(txn.paymentMethod || '')}</div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderHistory() {
  const container = document.getElementById('historyListContainer');
  const emptyEl = document.getElementById('historyEmptyState');
  const countEl = document.getElementById('filteredCount');
  const summaryEl = document.getElementById('filteredSummary');

  if (!container) return;

  const searchQuery = (document.getElementById('historySearch')?.value || '').toLowerCase().trim();
  const typeFilter = document.getElementById('historyTypeFilter')?.value || 'all';
  const categoryFilter = document.getElementById('historyCategoryFilter')?.value || 'all';
  const sortFilter = document.getElementById('historySortFilter')?.value || 'date-desc';

  let filtered = transactions.filter(t => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    
    if (searchQuery) {
      const matchTitle = t.title.toLowerCase().includes(searchQuery);
      const matchNotes = (t.notes || '').toLowerCase().includes(searchQuery);
      const matchCat = t.category.toLowerCase().includes(searchQuery);
      if (!matchTitle && !matchNotes && !matchCat) return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    if (sortFilter === 'date-desc') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortFilter === 'date-asc') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortFilter === 'amount-desc') {
      return b.amount - a.amount;
    } else if (sortFilter === 'amount-asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  if (countEl) countEl.textContent = filtered.length;

  if (summaryEl) {
    const netFiltered = filtered.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
    summaryEl.innerHTML = `Net: <span class="font-bold text-amber-950">₹${formatNumber(netFiltered)}</span>`;
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  container.innerHTML = '';

  filtered.forEach(txn => {
    const isIncome = txn.type === 'income';
    const icon = getCategoryIcon(txn.category, txn.type);

    const row = document.createElement('div');
    row.className = 'p-4 sm:p-5 hover:bg-yellow-50/60 hover:shadow-xs transition-all duration-200 flex items-center justify-between gap-4 group';
    row.innerHTML = `
      <div class="flex items-center gap-3.5 min-w-0">
        <div class="w-11 h-11 rounded-2xl ${isIncome ? 'bg-yellow-100 text-amber-800' : 'bg-yellow-50 text-amber-900 border border-yellow-200'} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
          <span class="material-symbols-outlined text-xl">${icon}</span>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-bold text-amber-950 truncate">${escapeHtml(txn.title)}</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${isIncome ? 'bg-yellow-100 text-amber-800' : 'bg-yellow-50 text-amber-900 border border-yellow-200'} shadow-xs">
              ${escapeHtml(txn.category)}
            </span>
          </div>
          <div class="text-xs text-stone-500 flex items-center gap-2 mt-1 flex-wrap">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">calendar_today</span>
              ${formatDateString(txn.date)}
            </span>
            <span>•</span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">credit_card</span>
              ${escapeHtml(txn.paymentMethod || 'Other')}
            </span>
            ${txn.notes ? `<span>•</span><span class="italic text-stone-400 truncate max-w-xs">${escapeHtml(txn.notes)}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <div class="text-right">
          <div class="text-base font-extrabold ${isIncome ? 'text-amber-800' : 'text-stone-800'}">
            ${isIncome ? '+' : '-'}₹${formatNumber(txn.amount)}
          </div>
          <div class="text-2xs uppercase tracking-wider font-semibold text-stone-400">${txn.type}</div>
        </div>
        <button 
          onclick="promptDeleteTransaction('${txn.id}')" 
          class="w-9 h-9 rounded-xl text-stone-400 hover:text-amber-950 hover:bg-amber-100 hover:border-yellow-200 hover:shadow-xs hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 border border-transparent"
          title="Delete entry"
        >
          <span class="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

function resetHistoryFilters() {
  const searchInput = document.getElementById('historySearch');
  const typeSelect = document.getElementById('historyTypeFilter');
  const catSelect = document.getElementById('historyCategoryFilter');
  const sortSelect = document.getElementById('historySortFilter');

  if (searchInput) searchInput.value = '';
  if (typeSelect) typeSelect.value = 'all';
  if (catSelect) catSelect.value = 'all';
  if (sortSelect) sortSelect.value = 'date-desc';

  renderHistory();
}

function promptDeleteTransaction(id) {
  pendingDeleteId = id;
  const modal = document.getElementById('deleteModal');
  const confirmBtn = document.getElementById('btnConfirmDelete');
  
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      executeDelete(pendingDeleteId);
      closeDeleteModal();
    };
  }
  
  if (modal) modal.classList.remove('hidden');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.add('hidden');
}

function executeDelete(id) {
  if (!id) return;
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  showToast('Transaction removed', 'success');
  renderDashboard();
  renderHistory();
}

function confirmClearAll() {
  const modal = document.getElementById('clearAllModal');
  if (modal) modal.classList.remove('hidden');
}

function closeClearAllModal() {
  const modal = document.getElementById('clearAllModal');
  if (modal) modal.classList.add('hidden');
}

function executeClearAll() {
  transactions = [];
  saveTransactions();
  closeClearAllModal();
  showToast('All transactions cleared', 'info');
  renderDashboard();
  renderHistory();
}

function exportTransactionsToCSV() {
  if (transactions.length === 0) {
    showToast('No records to export', 'error');
    return;
  }

  const headers = ['ID', 'Type', 'Title', 'Amount (INR)', 'Category', 'Date', 'Payment Method', 'Notes'];
  const rows = transactions.map(t => [
    t.id,
    t.type,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.date,
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `aniket_money_records_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('CSV downloaded successfully', 'success');
}

let toastTimer = null;
function showToast(message, type = 'success') {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  const iconEl = document.getElementById('toastIcon');

  if (!toast || !msgEl || !iconEl) return;

  if (toastTimer) clearTimeout(toastTimer);

  msgEl.textContent = message;
  if (type === 'error') {
    iconEl.textContent = 'error';
    iconEl.className = 'material-symbols-outlined text-amber-800';
  } else if (type === 'info') {
    iconEl.textContent = 'info';
    iconEl.className = 'material-symbols-outlined text-amber-700';
  } else {
    iconEl.textContent = 'check_circle';
    iconEl.className = 'material-symbols-outlined text-amber-600';
  }

  toast.classList.remove('hidden');

  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function getCategoryIcon(catName, type) {
  const list = CATEGORIES[type] || [...CATEGORIES.expense, ...CATEGORIES.income];
  const found = list.find(c => c.name.toLowerCase() === (catName || '').toLowerCase());
  if (found) return found.icon;
  return type === 'income' ? 'trending_up' : 'receipt';
}

function formatNumber(num) {
  return Number(num).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDateString(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

function escapeHtml(string) {
  if (!string) return '';
  const str = String(string);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
