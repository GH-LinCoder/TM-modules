// sectionCradGenerator.js
// needs container

mutation.cards.forEach(cardData => {
  const card = generateCard(cardData);
  sectionContainer.appendChild(card);
});

//there is an previous version on file - no there isn't. (is it at the Lab?)

function generateCard({ name, description, action }) {
  const card = document.createElement('div');
  card.classList.add('dashboard-card');
  card.dataset.action = action;  // <--- applies new data-action
  card.innerHTML = `
    <h3>${name}</h3>
    <p>${description}</p>
  `;
  return card;
}


//  OR

function generateCard({ name, description, action, icon, style, backTarget }) {
  const card = document.createElement('div');
  card.classList.add('dashboard-card');
  card.dataset.action = action;

  if (backTarget) {
    card.dataset.backTarget = backTarget;
    card.classList.add('back-card'); // optional styling hook
  }

  if (style) {
    Object.assign(card.style, style); // inline styles from registry
  }

  card.innerHTML = `
    ${icon ? `<div class="card-icon">${icon}</div>` : ''}
    <h3>${name}</h3>
    <p>${description}</p>
  `;

  return card;
}

// OR use a style definition for different cards

function generateCard({ name, description, action }, sectionId) {
  const card = document.createElement('div');
  card.classList.add('dashboard-card');
  card.dataset.action = action;

  const cardType = CardTypeRegistry[action] || 'menu'; // default fallback
  const theme = SectionThemes[sectionId];

  if (theme) {
    card.style.backgroundColor = theme.backgroundColor;
    card.style.color = theme.fontColor;
    card.style.border = theme.borderStyles[cardType] || '1px solid #ccc';
  }

  card.innerHTML = `
    <h3>${name}</h3>
    <p>${description}</p>
  `;

  return card;
}

//style definition

const SectionThemes = {
  'task-&-member': {
    backgroundColor: '#f0f4ff',
    fontColor: '#003366',
    borderStyles: {
      work: '2px solid #0077cc',
      display: '1px dashed #999',
      menu: '1px solid #ccc',
      transmute: '2px dotted #cc6600',
      load: '2px solid #66cc66'
    }
  },
  'quick-stats': {
    backgroundColor: '#fff8f0',
    fontColor: '#663300',
    borderStyles: {
      work: '2px solid #cc3300',
      display: '1px dashed #996633',
      menu: '1px solid #ccc',
      transmute: '2px dotted #ff9900',
      load: '2px solid #339966'
    }
  }
};
