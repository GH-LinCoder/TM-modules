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
