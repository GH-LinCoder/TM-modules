// ./js/sortThisList.js

// Reusable sorting components
class SortThisList {
  constructor(container, config) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) throw new Error('Container not found');

    this.config = {
      title: 'List',
      data: [],
      sortBy: 'sort_int',     // for newest/oldest
      sortByKey: 'name',       // for a-z/z-a
      type: 'people',          // 'people', 'assignments', 'tasks'
      ...config
    };

    this.sortOrder = 'newest'; // 'newest', 'oldest', 'a-z', 'z-a'

    this.init();
  }

  init() {
    // Set title
    const titleEl = this.container.querySelector('[data-title]');
    if (titleEl) titleEl.textContent = this.config.title;

    // Set up sort buttons
    const controls = this.container.querySelector('[data-sort-controls]');
    if (controls) {
      controls.addEventListener('click', (e) => {
        const btn = e.target.closest('.sort-btn');
        if (btn && btn.dataset.sort) {
          this.setSortOrder(btn.dataset.sort);
        }
      });
    }

    // Initial render
    this.render();
  }

  setSortOrder(order) {
    const validOrders = ['newest', 'oldest', 'a-z', 'z-a'];
    if (!validOrders.includes(order)) return;

    this.sortOrder = order;

    // Update active button
    this.container.querySelectorAll('.sort-btn').forEach(btn => {
      const isActive = btn.dataset.sort === order;
      btn.classList.toggle('bg-indigo-600', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('shadow-lg', isActive);
      btn.classList.toggle('scale-105', isActive);
      btn.classList.toggle('bg-gray-200', !isActive);
      btn.classList.toggle('text-gray-700', !isActive);
      btn.classList.toggle('hover:bg-indigo-100', !isActive);
      btn.classList.toggle('hover:text-indigo-600', !isActive);
    });

    this.render();
  }

  sortData(data) {
    const items = [...data];
    const { sortBy, sortByKey } = this.config;

    return items.sort((a, b) => {
      switch (this.sortOrder) {
        case 'newest':
          return (b[sortBy] || 0) - (a[sortBy] || 0);
        case 'oldest':
          return (a[sortBy] || 0) - (b[sortBy] || 0);
        case 'a-z':
          const aValue = String(a[sortByKey] || '').toLowerCase();
          const bValue = String(b[sortByKey] || '').toLowerCase();
          return aValue.localeCompare(bValue);
        case 'z-a':
          const xValue = String(a[sortByKey] || '').toLowerCase();
          const yValue = String(b[sortByKey] || '').toLowerCase();
          return yValue.localeCompare(xValue);
        default:
          return (b[sortBy] || 0) - (a[sortBy] || 0);
      }
    });
  }

  renderListItem(item) {
    const { type } = this.config;

    switch (type) {
      case 'people':
        return `
          <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <span class="font-semibold text-lg">${item.name || 'Unknown'}</span>
            <span class="text-sm font-medium px-2 py-1 rounded-full ${
              item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }">${item.status || 'Unknown'}</span>
          </div>
        `;

      case 'assignments':
        return `
          <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <span class="font-semibold text-lg">${item.title || 'No title'}</span>
            <span class="text-sm text-gray-500">Due: ${item.dueDate || 'N/A'}</span>
          </div>
        `;

      case 'tasks':
        return `
          <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <span class="font-semibold text-lg">${item.title || 'No title'}</span>
            <span class="text-sm font-medium px-2 py-1 rounded-full ${
              item.priority === 'High'
                ? 'bg-red-100 text-red-700'
                : item.priority === 'Medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
            }">${item.priority || 'Low'}</span>
          </div>
        `;

      default:
        return `
          <div class="bg-white p-4 rounded-xl shadow-sm">
            <span class="font-semibold">${String(Object.values(item)[1] || '')}</span>
          </div>
        `;
    }
  }

  render() {
    const container = this.container.querySelector('[data-items-container]');
    if (!container) return;

    const sortedData = this.sortData(this.config.data);

    if (sortedData.length === 0) {
      container.innerHTML = `<div class="text-center text-gray-500 py-10">No items to display.</div>`;
      return;
    }

    container.innerHTML = sortedData
      .map((item, index) => {
        // Use uuid if available, fallback to index
        const key = item.id || item.uuid || `item-${index}`;
        return `<div data-item-key="${key}">${this.renderListItem(item)}</div>`;
      })
      .join('');
  }

  // Update data and re-render
  setData(data) {
    this.config.data = data;
    this.render();
  }
}