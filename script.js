// ── State ─────────────────────────────────────────
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// ── DOM References ────────────────────────────────
const todoInput     = document.getElementById('todoInput');
const addBtn        = document.getElementById('addBtn');
const todoList      = document.getElementById('todoList');
const itemCount     = document.getElementById('itemCount');
const clearBtn      = document.getElementById('clearCompleted');
const filterBtns    = document.querySelectorAll('.filter-btn');

// ── Save to localStorage ──────────────────────────
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// ── Add Todo ──────────────────────────────────────
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) {
    todoInput.focus();
    todoInput.style.borderColor = '#e74c3c';
    setTimeout(() => (todoInput.style.borderColor = ''), 1000);
    return;
  }

  const todo = {
    id: Date.now(),
    text,
    completed: false,
  };

  todos.unshift(todo); // Add to top of list
  saveTodos();
  render();

  todoInput.value = '';
  todoInput.focus();
}

// ── Toggle Complete ───────────────────────────────
function toggleTodo(id) {
  todos = todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

// ── Delete Todo ───────────────────────────────────
function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  render();
}

// ── Clear Completed ───────────────────────────────
function clearCompleted() {
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  render();
}

// ── Filter ────────────────────────────────────────
function setFilter(filter) {
  currentFilter = filter;

  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  render();
}

function getFilteredTodos() {
  switch (currentFilter) {
    case 'active':    return todos.filter(t => !t.completed);
    case 'completed': return todos.filter(t => t.completed);
    default:          return todos;
  }
}

// ── Render ────────────────────────────────────────
function render() {
  const filtered = getFilteredTodos();

  // Update list
  if (filtered.length === 0) {
    const messages = {
      all:       '🎉 No todos yet. Add one above!',
      active:    '✅ No active todos. Great job!',
      completed: '📭 No completed todos yet.',
    };
    todoList.innerHTML = `<li class="empty-state">${messages[currentFilter]}</li>`;
  } else {
    todoList.innerHTML = filtered.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <input
          type="checkbox"
          ${todo.completed ? 'checked' : ''}
          aria-label="Mark '${escapeHtml(todo.text)}' as complete"
        />
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="delete-btn" aria-label="Delete '${escapeHtml(todo.text)}'">✕</button>
      </li>
    `).join('');
  }

  // Update footer count (based on ALL todos, not filtered)
  const activeCount = todos.filter(t => !t.completed).length;
  itemCount.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;

  // Show/hide clear button
  const hasCompleted = todos.some(t => t.completed);
  clearBtn.style.visibility = hasCompleted ? 'visible' : 'hidden';
}

// ── Utility: Prevent XSS ─────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ── Event Listeners ───────────────────────────────

// Add on button click
addBtn.addEventListener('click', addTodo);

// Add on Enter key
todoInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

// Delegate clicks on list (checkbox + delete)
todoList.addEventListener('click', e => {
  const item = e.target.closest('.todo-item');
  if (!item) return;

  const id = Number(item.dataset.id);

  if (e.target.matches('input[type="checkbox"]')) {
    toggleTodo(id);
  } else if (e.target.matches('.delete-btn')) {
    deleteTodo(id);
  }
});

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

// Clear completed
clearBtn.addEventListener('click', clearCompleted);

// ── Init ──────────────────────────────────────────
render();