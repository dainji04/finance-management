const storageKey = 'chi-tieu-local-data-v1';
const defaultData = {
  categories: [
    { id: crypto.randomUUID(), name: 'Ăn uống', color: '#f5222d', budget: 5000000 },
    { id: crypto.randomUUID(), name: 'Di chuyển', color: '#fa8c16', budget: 2000000 },
    { id: crypto.randomUUID(), name: 'Mua sắm', color: '#722ed1', budget: 4000000 }
  ],
  expenses: [],
  incomes: [],
  debts: [],
  profile: { displayName: 'Bạn', name: '', email: '', phone: '' }
};

let state = loadState();
const monthPicker = document.getElementById('monthPicker');

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return defaultData;
    const parsed = JSON.parse(saved);
    return { ...defaultData, ...parsed, categories: parsed.categories || defaultData.categories, expenses: parsed.expenses || [], incomes: parsed.incomes || [], debts: parsed.debts || [], profile: parsed.profile || defaultData.profile };
  } catch {
    return defaultData;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(date) {
  return new Date(date).toISOString().slice(0, 7);
}

function getSelectedMonth() {
  return monthPicker.value || monthKey(new Date());
}

function renderTabs() {
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.panel').forEach((panel) => panel.classList.remove('active'));
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });
}

function renderCategoryOptions() {
  const select = document.getElementById('expenseCategory');
  select.innerHTML = state.categories.map((category) => `<option value="${category.id}">${category.name}</option>`).join('');
}

function renderOverview() {
  const month = getSelectedMonth();
  const expenseTotal = state.expenses.filter((item) => monthKey(item.date) === month).reduce((sum, item) => sum + item.amount, 0);
  const incomeTotal = state.incomes.filter((item) => monthKey(item.date) === month).reduce((sum, item) => sum + item.amount, 0);
  document.getElementById('expenseTotal').textContent = formatCurrency(expenseTotal);
  document.getElementById('incomeTotal').textContent = formatCurrency(incomeTotal);
  document.getElementById('balanceTotal').textContent = formatCurrency(incomeTotal - expenseTotal);

  const list = document.getElementById('budgetList');
  list.innerHTML = state.categories.map((category) => {
    const amount = state.expenses.filter((item) => item.categoryId === category.id && monthKey(item.date) === month).reduce((sum, item) => sum + item.amount, 0);
    const percent = category.budget ? Math.min(Math.round((amount / category.budget) * 100), 100) : 0;
    return `<div class="item"><div><strong>${category.name}</strong><div class="muted">${formatCurrency(amount)} / ${formatCurrency(category.budget)}</div></div><div class="badge" style="background:${percent >= 100 ? '#ef4444' : '#1677ff'}">${percent}%</div></div>`;
  }).join('');
}

function renderExpenses() {
  const list = document.getElementById('expenseList');
  if (!state.expenses.length) {
    list.innerHTML = '<div class="muted">Chưa có chi tiêu nào.</div>';
    return;
  }
  list.innerHTML = state.expenses.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((item) => {
    const category = state.categories.find((entry) => entry.id === item.categoryId);
    return `<div class="item"><div><strong>${category?.name || 'Không xác định'}</strong><div class="muted">${item.note || 'Không có ghi chú'}</div></div><div><strong>${formatCurrency(item.amount)}</strong><div class="muted">${item.date}</div></div></div>`;
  }).join('');
}

function renderCategories() {
  const list = document.getElementById('categoryList');
  list.innerHTML = state.categories.map((category) => `<div class="item"><div><span class="badge" style="background:${category.color}">${category.name}</span><div class="muted">Ngân sách: ${formatCurrency(category.budget)}</div></div><button class="small-btn" data-remove-category="${category.id}">Xóa</button></div>`).join('');
}

function renderIncomes() {
  const list = document.getElementById('incomeList');
  if (!state.incomes.length) {
    list.innerHTML = '<div class="muted">Chưa có tiền vào nào.</div>';
    return;
  }
  list.innerHTML = state.incomes.slice().sort((a, b) => b.date.localeCompare(a.date)).map((item) => `<div class="item"><div><strong>${item.type}</strong><div class="muted">${item.note || 'Không có ghi chú'}</div></div><div><strong>${formatCurrency(item.amount)}</strong><div class="muted">${item.date}</div></div></div>`).join('');
}

function renderDebts() {
  const list = document.getElementById('debtList');
  if (!state.debts.length) {
    list.innerHTML = '<div class="muted">Chưa có công nợ nào.</div>';
    return;
  }
  const summary = [];
  state.debts.forEach((entry) => {
    const existing = summary.find((item) => item.person === entry.person);
    if (existing) {
      existing.balance += entry.type === 'borrow' ? entry.amount : -entry.amount;
    } else {
      summary.push({ person: entry.person, balance: entry.type === 'borrow' ? entry.amount : -entry.amount });
    }
  });
  list.innerHTML = summary.filter((item) => item.balance !== 0).map((item) => `<div class="item"><div><strong>${item.person}</strong><div class="muted">${item.balance >= 0 ? 'Còn nợ' : 'Đã trả'}</div></div><div class="badge" style="background:${item.balance >= 0 ? '#ef4444' : '#10b981'}">${formatCurrency(item.balance)}</div></div>`).join('');
}

function renderProfile() {
  document.getElementById('profileDisplayName').value = state.profile.displayName || '';
  document.getElementById('profileName').value = state.profile.name || '';
  document.getElementById('profileEmail').value = state.profile.email || '';
  document.getElementById('profilePhone').value = state.profile.phone || '';
}

function renderAll() {
  renderCategoryOptions();
  renderOverview();
  renderExpenses();
  renderCategories();
  renderIncomes();
  renderDebts();
  renderProfile();
}

function bindEvents() {
  document.getElementById('expenseForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.expenses.unshift({
      id: crypto.randomUUID(),
      date: document.getElementById('expenseDate').value || todayISO(),
      categoryId: document.getElementById('expenseCategory').value,
      amount: Number(document.getElementById('expenseAmount').value),
      note: document.getElementById('expenseNote').value
    });
    saveState();
    event.target.reset();
    renderAll();
  });

  document.getElementById('categoryForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.categories.unshift({
      id: crypto.randomUUID(),
      name: document.getElementById('categoryName').value,
      color: document.getElementById('categoryColor').value,
      budget: Number(document.getElementById('categoryBudget').value || 0)
    });
    saveState();
    event.target.reset();
    renderAll();
  });

  document.getElementById('incomeForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.incomes.unshift({
      id: crypto.randomUUID(),
      type: document.getElementById('incomeType').value,
      amount: Number(document.getElementById('incomeAmount').value),
      date: document.getElementById('incomeDate').value || todayISO(),
      note: document.getElementById('incomeNote').value
    });
    saveState();
    event.target.reset();
    renderAll();
  });

  document.getElementById('debtForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.debts.unshift({
      id: crypto.randomUUID(),
      type: document.getElementById('debtType').value,
      person: document.getElementById('debtPerson').value,
      amount: Number(document.getElementById('debtAmount').value),
      note: document.getElementById('debtNote').value,
      date: todayISO()
    });
    saveState();
    event.target.reset();
    renderAll();
  });

  document.getElementById('profileForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.profile = {
      displayName: document.getElementById('profileDisplayName').value,
      name: document.getElementById('profileName').value,
      email: document.getElementById('profileEmail').value,
      phone: document.getElementById('profilePhone').value
    };
    saveState();
    renderAll();
  });

  document.getElementById('categoryList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-category]');
    if (!button) return;
    state.categories = state.categories.filter((category) => category.id !== button.dataset.removeCategory);
    saveState();
    renderAll();
  });

  monthPicker.value = monthKey(new Date());
  monthPicker.addEventListener('change', renderOverview);

  const installBtn = document.getElementById('installBtn');
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.style.display = 'inline-block';
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
}

renderTabs();
bindEvents();
registerServiceWorker();
renderAll();
