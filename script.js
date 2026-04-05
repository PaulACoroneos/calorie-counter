const calorieCounter = document.getElementById('calorie-counter');
const budgetNumberInput = document.getElementById('budget');
const entryDropdown = document.getElementById('entry-dropdown');
const addEntryButton = document.getElementById('add-entry');
const clearButton = document.getElementById('clear');
const output = document.getElementById('output');

const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snacks', 'exercise'];

function cleanInputString(str) {
  const regex = /[+-\s]/g;
  return str.replace(regex, '');
}

function isInvalidInput(str) {
  const regex = /\d+e\d+/i;
  return str.match(regex);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showError(message) {
  output.innerHTML = `<p class="error-message">${escapeHtml(message)}</p>`;
  output.classList.remove('hide');
}

function buildEntryHTML(category, entryNumber, name = '', calories = '') {
  const safeCategory = escapeHtml(category);
  const entryId = `${safeCategory}-${entryNumber}`;
  return `
  <div class="entry-row" id="entry-row-${entryId}">
    <div class="entry-fields">
      <label for="${entryId}-name">Entry ${entryNumber} Name</label>
      <input
        type="text"
        id="${entryId}-name"
        placeholder="Name"
        aria-label="Entry ${entryNumber} name for ${safeCategory}"
        value="${escapeHtml(name)}"
      />
      <label for="${entryId}-calories">Entry ${entryNumber} Calories</label>
      <input
        type="number"
        min="0"
        id="${entryId}-calories"
        placeholder="Calories"
        aria-label="Entry ${entryNumber} calories for ${safeCategory}"
        value="${escapeHtml(calories)}"
      />
    </div>
    <button
      type="button"
      class="delete-entry"
      aria-label="Delete entry ${entryNumber} from ${safeCategory}"
      data-entry="entry-row-${entryId}"
    >&#x2715;</button>
  </div>`;
}

function addEntry() {
  const category = entryDropdown.value;
  const targetInputContainer = document.querySelector(`#${category} .input-container`);
  const entryNumber = targetInputContainer.querySelectorAll('input[type="text"]').length + 1;
  targetInputContainer.insertAdjacentHTML('beforeend', buildEntryHTML(category, entryNumber));
  saveToLocalStorage();
}

function deleteEntry(entryRowId) {
  const row = document.getElementById(entryRowId);
  if (row) {
    row.remove();
    saveToLocalStorage();
  }
}

function calculateCalories(e) {
  e.preventDefault();
  let isError = false;

  const budgetCalories = getCaloriesFromInputs([budgetNumberInput]);
  if (budgetCalories === null) {
    isError = true;
  } else if (budgetCalories <= 0) {
    showError('Please enter a budget greater than zero.');
    return;
  }

  const mealTotals = {};
  if (!isError) {
    for (const category of MEAL_CATEGORIES) {
      const inputs = document.querySelectorAll(`#${category} input[type=number]`);
      mealTotals[category] = getCaloriesFromInputs(inputs);
      if (mealTotals[category] === null) {
        isError = true;
        break;
      }
    }
  }

  if (isError) {
    return;
  }

  const consumedCalories =
    mealTotals.breakfast + mealTotals.lunch + mealTotals.dinner + mealTotals.snacks;
  const remainingCalories = budgetCalories - consumedCalories + mealTotals.exercise;
  const isSurplus = remainingCalories < 0;
  const label = isSurplus ? 'Surplus' : 'Deficit';
  const icon = isSurplus ? '⚠️' : '✅';

  output.innerHTML = `
  <span class="${label.toLowerCase()}">${icon} ${Math.abs(remainingCalories)} Calorie ${label}</span>
  <hr>
  <p>${budgetCalories} Calories Budgeted</p>
  <p>${consumedCalories} Calories Consumed</p>
  <p>${mealTotals.exercise} Calories Burned</p>
  `;

  output.classList.remove('hide');
}

function getCaloriesFromInputs(list) {
  let calories = 0;

  for (const item of list) {
    const currVal = cleanInputString(item.value);
    const invalidInputMatch = isInvalidInput(currVal);

    if (invalidInputMatch) {
      showError(`Invalid input: "${escapeHtml(invalidInputMatch[0])}" — please enter a plain number.`);
      return null;
    }
    calories += Number(currVal);
  }
  return calories;
}

function clearForm() {
  for (const container of document.querySelectorAll('.input-container')) {
    container.innerHTML = '';
  }

  budgetNumberInput.value = '';
  output.innerHTML = '';
  output.classList.add('hide');
  clearLocalStorage();
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function saveToLocalStorage() {
  const data = {
    budget: budgetNumberInput.value,
    entries: {},
  };

  for (const category of MEAL_CATEGORIES) {
    const rows = document.querySelectorAll(`#${category} .entry-row`);
    data.entries[category] = Array.from(rows).map((row) => ({
      name: row.querySelector('input[type="text"]')?.value ?? '',
      calories: row.querySelector('input[type="number"]')?.value ?? '',
    }));
  }

  localStorage.setItem('calorieCounterData', JSON.stringify(data));
}

function clearLocalStorage() {
  localStorage.removeItem('calorieCounterData');
}

function loadFromLocalStorage() {
  const raw = localStorage.getItem('calorieCounterData');
  if (!raw) return;

  try {
    const data = JSON.parse(raw);

    if (data.budget) {
      budgetNumberInput.value = data.budget;
    }

    for (const category of MEAL_CATEGORIES) {
      const entries = data.entries?.[category];
      if (!Array.isArray(entries)) continue;

      const targetInputContainer = document.querySelector(`#${category} .input-container`);
      entries.forEach((entry, index) => {
        targetInputContainer.insertAdjacentHTML(
          'beforeend',
          buildEntryHTML(category, index + 1, entry.name, entry.calories)
        );
      });
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    clearLocalStorage();
  }
}

// ── Event listeners ───────────────────────────────────────────────────────────

addEntryButton.addEventListener('click', addEntry);
calorieCounter.addEventListener('submit', calculateCalories);
clearButton.addEventListener('click', clearForm);

calorieCounter.addEventListener('input', saveToLocalStorage);

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-entry')) {
    deleteEntry(e.target.dataset.entry);
  }
});

loadFromLocalStorage();