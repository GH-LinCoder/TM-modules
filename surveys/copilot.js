import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';

export function renderQuestionEditor(container, questionData = {}) {
  container.innerHTML = ''; // Clear previous content

  const questionBlock = document.createElement('div');
  questionBlock.className = 'question-editor space-y-6 p-4 border rounded bg-white shadow';

  // Question text input
  questionBlock.innerHTML = `
    <label class="block text-lg font-semibold text-gray-800">Question</label>
    <input type="text" class="question-text w-full p-2 border rounded" maxlength="256" value="${questionData.text || ''}" />
    <p class="text-xs text-gray-500 question-text-counter">0/256 characters</p>

    <div class="answers space-y-4 mt-4"></div>
    <button class="add-answer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Add Answer</button>
  `;

  container.appendChild(questionBlock);

  const answersContainer = questionBlock.querySelector('.answers');
  const addAnswerBtn = questionBlock.querySelector('.add-answer');

  // Character counter
  const questionInput = questionBlock.querySelector('.question-text');
  const counter = questionBlock.querySelector('.question-text-counter');
  questionInput.addEventListener('input', e => {
    counter.textContent = `${e.target.value.length}/256 characters`;
  });

  // Add initial answers
  (questionData.answers || []).forEach(answer => {
    addAnswerBlock(answersContainer, answer);
  });

  // Add new answer
  addAnswerBtn.addEventListener('click', () => {
    addAnswerBlock(answersContainer);
  });

  // Clipboard updates
  onClipboardUpdate(() => {
    answersContainer.querySelectorAll('.answer-block').forEach(updateAnswerDropdowns);
  });
}

//////////////////

function addAnswerBlock(container, answerData = {}) {
  const block = document.createElement('div');
  block.className = 'answer-block border p-4 rounded bg-gray-50 space-y-3';

  block.innerHTML = `
    <input type="text" class="answer-text w-full p-2 border rounded" maxlength="256" placeholder="Answer text" value="${answerData.text || ''}" />
    <p class="text-xs text-gray-500 answer-text-counter">0/256 characters</p>

    <select class="answer-mode w-full p-2 border rounded">
      <option value="null">No Action</option>
      <option value="assign">Assign Task</option>
      <option value="relate">Relate to Approfile</option>
    </select>

    <div class="assign-task-group hidden">
      <select class="task-dropdown w-full p-2 border rounded">
        <option value="">Select task from clipboard</option>
      </select>
    </div>

    <div class="relate-group hidden space-y-2">
      <select class="approfile-dropdown w-full p-2 border rounded">
        <option value="">Select approfile from clipboard</option>
      </select>
      <select class="relationship-dropdown w-full p-2 border rounded">
        <option value="">Select relationship from clipboard</option>
      </select>
    </div>
  `;

  container.appendChild(block);

  // Character counter
  const input = block.querySelector('.answer-text');
  const counter = block.querySelector('.answer-text-counter');
  input.addEventListener('input', e => {
    counter.textContent = `${e.target.value.length}/256 characters`;
  });

  // Mode switching
  const modeSelect = block.querySelector('.answer-mode');
  const assignGroup = block.querySelector('.assign-task-group');
  const relateGroup = block.querySelector('.relate-group');

  modeSelect.addEventListener('change', () => {
    const mode = modeSelect.value;
    assignGroup.classList.toggle('hidden', mode !== 'assign');
    relateGroup.classList.toggle('hidden', mode !== 'relate');
  });

  updateAnswerDropdowns(block);
}

////////////

function updateAnswerDropdowns(block) {
  const taskDropdown = block.querySelector('.task-dropdown');
  const approfileDropdown = block.querySelector('.approfile-dropdown');
  const relationshipDropdown = block.querySelector('.relationship-dropdown');

  // Clear existing
  taskDropdown.innerHTML = '<option value="">Select task from clipboard</option>';
  approfileDropdown.innerHTML = '<option value="">Select approfile from clipboard</option>';
  relationshipDropdown.innerHTML = '<option value="">Select relationship from clipboard</option>';

  const tasks = getClipboardItems({ as: 'task' });
  const approfiles = getClipboardItems({ as: 'other' });
  const relationships = getClipboardItems({ as: 'relationship' });

  tasks.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.entity.id;
    opt.textContent = `${item.entity.name} (${item.entity.id})`;
    taskDropdown.appendChild(opt);
  });

  approfiles.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.entity.id;
    opt.textContent = `${item.entity.name} (${item.entity.id})`;
    approfileDropdown.appendChild(opt);
  });

  relationships.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.entity.id;
    opt.textContent = `${item.entity.name} (${item.entity.id})`;
    relationshipDropdown.appendChild(opt);
  });
}


