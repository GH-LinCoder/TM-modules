
mutation.cards.forEach(cardData => {
  const card = generateCard(cardData);
  sectionContainer.appendChild(card);
});

//there is an previous version on file

function generateCard({ name, description, action }) {
  const card = document.createElement('div');
  card.classList.add('dashboard-card');
  card.dataset.action = action;
  card.innerHTML = `
    <h3>${name}</h3>
    <p>${description}</p>
  `;
  return card;
}
