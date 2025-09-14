//  js to generate a populated statsCard.    We also have static HTML Version of this StatsCard - see /htmlStubs     

// Create a reusable function to generate a stats card
function createStatsCard({ title, value, description, iconName = null, trendValue = null, trendLabel = '', isTrendPositive = true }) {
  const iconSvg = {
    target: `<circle cx="12" cy="12" r="10" stroke="currentColor" fill="none"/><circle cx="12" cy="12" r="6" stroke="currentColor" fill="none"/><circle cx="12" cy="12" r="2" fill="currentColor"/>`,
    users: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    clock: `<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>`,
    check: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,6 12,13 2,6"/>`
  }[iconName] || '';

  return `
    <div class="stats-card bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer" 
         data-card="stats" 
         data-title="${title}">
      <div class="flex justify-between items-center mb-1">
        <h3 class="text-sm font-medium text-gray-600">${title}</h3>
        ${iconName ? `<svg class="w-4 h-4 text-gray-500" data-icon="${iconName}">${iconSvg}</svg>` : ''}
      </div>
      <p class="text-2xl font-bold" data-value>${value}</p>
      ${description ? `<p class="text-xs text-gray-500 mt-1" data-description>${description}</p>` : ''}
      ${trendValue !== null ? `
        <div class="flex items-center gap-1 mt-2">
          <span class="text-xs px-2 py-1 rounded ${isTrendPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}" data-trend>
            ${isTrendPositive ? '+' : ''}${trendValue}%
          </span>
          <span class="text-xs text-gray-500" data-trend-label>${trendLabel}</span>
        </div>
      ` : ''}
    </div>
  `;
}

// Usage example
document.getElementById('stats-container').innerHTML = `
  ${createStatsCard({
    title: "Active Tasks",
    value: 24,
    description: "Currently in progress",
    iconName: "target",
    trendValue: 25,
    trendLabel: "from last month",
    isTrendPositive: true
  })}
  ${createStatsCard({
    title: "Completed Tasks",
    value: 5,
    description: "Successfully finished",
    iconName: "check",
    trendValue: 12,
    trendLabel: "from last month",
    isTrendPositive: true
  })}
`;