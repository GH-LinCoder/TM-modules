//possible look-up table for how different cards should be styled

const const CardVisualRegistry = {
  uiType: {
    'load-work': { border: '2px solid', fontWeight: 'bold' },
    'menu-transmute': { border: '2px dotted', opacity: 0.95 },
    'menu-display': { border: '1px dashed', fontStyle: 'italic' },
    'back-nav': { border: '1px solid', fontSize: '0.9rem' }
  },
  workDomain: {
    'tasks': { bgColor: '#fffbe6', borderColor: '#facc15' },
    'assignments': { bgColor: '#ffe4e6', borderColor: '#f87171' },
    'approfiles': { bgColor: '#e0f2fe', borderColor: '#38bdf8' },
    'howto': { bgColor: '#ede9fe', borderColor: '#8b5cf6' }
  },
  dataType: {
    'students': { fontColor: '#16a34a' },
    'managers': { fontColor: '#4f46e5' },
    'authors': { fontColor: '#7e22ce' }
  }
};
 = {
  uiType: {
    'load-work': { border: '2px solid', fontWeight: 'bold' },
    'menu-transmute': { border: '2px dotted', opacity: 0.95 },
    'menu-display': { border: '1px dashed', fontStyle: 'italic' },
    'back-nav': { border: '1px solid', fontSize: '0.9rem' }
  },
  workDomain: {
    'tasks': { bgColor: '#fffbe6', borderColor: '#facc15' },
    'assignments': { bgColor: '#ffe4e6', borderColor: '#f87171' },
    'approfiles': { bgColor: '#e0f2fe', borderColor: '#38bdf8' },
    'howto': { bgColor: '#ede9fe', borderColor: '#8b5cf6' }
  },
  dataType: {
    'students': { fontColor: '#16a34a' },
    'managers': { fontColor: '#4f46e5' },
    'authors': { fontColor: '#7e22ce' }
  }
};

// OR

const CardStyleRegistry = {
  'assign-task-dialogue': {
    type: 'work',
    bgColor: '#fffbe6',
    border: '2px solid #facc15',
    fontColor: '#92400e'
  },
  'view-member-history': {
    type: 'display',
    bgColor: '#e0f2fe',
    border: '1px dashed #38bdf8',
    fontColor: '#0369a1'
  },
  'go-back': {
    type: 'nav',
    bgColor: '#f3f4f6',
    border: '1px solid #9ca3af',
    fontColor: '#374151'
  }
};

