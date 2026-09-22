
const STORAGE_KEY = 'budget-app-state'
let state = null;


function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}


// Начало месяца
function startMonth(monthlyBudget, daysInMonth) {
    const dailyBudget = monthlyBudget / daysInMonth;

    state = {
        monthlyBudget: monthlyBudget,
        daysInMonth: daysInMonth,
        dailyBudget: dailyBudget,
        currentDay: 1,

        // На карте
        cardBalance: monthlyBudget,

        // Доступно
        // Перенос
        available: dailyBudget,

        // Потрачено сегодня
        spentToday: 0,

        // Осталось на день
        remainingToday: dailyBudget,

        active: true
    };

    saveState();
}

// Добавить расход
function addExpense(amount) {
    state.cardBalance -= amount;
    state.spentToday += amount;
    state.available -= amount;
    state.remainingToday = state.dailyBudget - state.spentToday;

    saveState();
}

// Добавить доход
function addIncome(amount) {
    state.cardBalance += amount;
    state.available += amount;

    saveState();
}

// Завершить день
function endDay() {
    state.available = state.available + state.dailyBudget;

    state.spentToday = 0;
    state.remainingToday = state.dailyBudget;

    // Новый день
    state.currentDay += 1;

    saveState();
}

// Завершить месяц
function endMonth() {
    state = null;
    localStorage.removeItem(STORAGE_KEY);
}


function formatMoney(n) {
    const rounded = Math.round(n * 100) / 100;
    return rounded.toLocaleString('ru-RU') + ' ₽';
}

function clearInputs() {
    document.getElementById('amountInput').value = '';
}


function render() {
    const startView = document.getElementById('startView');
    const mainView = document.getElementById('mainView');

    if (!state || !state.active) {
        startView.classList.remove('hidden');
        mainView.classList.add('hidden');
        return;
    }

    startView.classList.add('hidden');
    mainView.classList.remove('hidden');

    document.getElementById('dayInfo').textContent =
        `День ${state.currentDay} из ${state.daysInMonth}`;

    document.getElementById('cardBalance').textContent = formatMoney(state.cardBalance);
    document.getElementById('dailyBudget').textContent = formatMoney(state.dailyBudget);
    document.getElementById('available').textContent = formatMoney(state.available);
    document.getElementById('spentToday').textContent = formatMoney(state.spentToday);
    document.getElementById('remainingToday').textContent = formatMoney(state.remainingToday);
}


document.addEventListener('DOMContentLoaded', () => {
    state = loadState();

    // Старт месяца
    document.getElementById('startForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const budget = parseFloat(document.getElementById('monthlyBudget').value);
        const days = parseInt(document.getElementById('numberOfDays').value);

        if (!budget || budget <= 0) {
            alert('Введите корректную сумму на месяц');
            return;
        }
        if (!days || days <= 0) {
            alert('Введите корректное количество дней');
            return;
        }

        startMonth(budget, days);
        render();
    });

    // Добавить расход
    document.getElementById('addExpense').addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('amountInput').value);

        if (!amount || amount <= 0) {
            alert('Введите сумму больше нуля');
            return;
        }

        addExpense(amount);
        clearInputs();
        render();
    });

    // Добавить доход
    document.getElementById('addIncome').addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('amountInput').value);

        if (!amount || amount <= 0) {
            alert('Введите сумму больше нуля');
            return;
        }

        addIncome(amount);
        clearInputs();
        render();
    });

    // Завершить день
    document.getElementById('endDay').addEventListener('click', () => {
        if (!confirm('Завершить день? Остаток перенесётся на завтра.')) return;
        endDay();
        render();
    });

    // Завершить месяц
    document.getElementById('endMonth').addEventListener('click', () => {
        if (!confirm('Завершить месяц? Все данные будут сброшены.')) return;
        endMonth();
        render();
    });

    render();
});