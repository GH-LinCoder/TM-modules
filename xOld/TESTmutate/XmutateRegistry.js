// ./dash/mutate/registry.js
console.log('mutate/registry.js');

/*interogate it by first selecting the SECTION , check that exists and then by SECTION
//  const mutation = MutateRegistry[section]?.[action];
//----------------------  
  mutation.cards.forEach(cardData => {
  const card = generateCard(cardData);
  sectionContainer.appendChild(card);
});

*/


const sectionDefinitionRegistry = {
  'task-&-member': {
    'quick-stats': {
      sectionTitle: 'Quick Stats',
      description: 'Summaries:Click for details',
      cards: [
        {
          cardDataAction:'data-action="members-stats"',
          heading: 'Members', 
          dataDisplay:'data-value=members-count',
          description: 'Registered users',
          menuType:'module-loader', //section-mutation // back-button
          work:'display-data',//create-task // send-message // display-data //...
          subject:'members', //table? // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...
          
        },
        {
          cardDataAction:'data-action="assignments-stats"',
          heading: 'Assignments', 
          dataDisplay:'data-value=assignments-count',
          description: 'students, managers & assigned tasks',
          menuType:'module-loader', //section-mutation // back-button
          work:'display-data',//create-task // send-message // display-data //...
          subject:'assignments', //table? // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...
          
        },

        {
          cardDataAction:'data-action="tasks-stats"',
          heading: 'Tasks', 
          dataDisplay:'data-value=tasks-count',
          description: 'Available tasks',
          menuType:'module-loader', //section-mutation // back-button
          work:'display-data',//create-task // send-message // display-data //...
          subject:'tasks', //table? // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...
          
        },

        {
          cardDataAction:'data-action="authors-stats"',
          heading: 'Authors', 
          dataDisplay:'data-value=authors-count-unique',
          description: 'Registered users',
          menuType:'module-loader', //section-mutation // back-button
          work:'display-data',//create-task // send-message // display-data //...
          subject:'members', //table? // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...
          
        }

    // the above is as complicated as including the entire html code:    

/*
 <!-- Members -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="members-stats">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Members</h3>
      <p class="text-2xl font-bold text-blue-900" data-value="members-count">?</p>
      <p class="text-xs text-blue-600">Registered users</p>
      <p class="text-xs text-blue-400 mt-1" data-delta="members-month">+? new this month</p>
    </div>
// just take out the inline styling and make them CSS classes? 


<!-- Members Card -->
<div class="card card-members" data-action="members-stats">
  <h3 class="card-title">Members</h3>
  <p class="card-value" data-value="members-count">?</p>
  <p class="card-subtitle">Registered users</p>
  <p class="card-delta" data-delta="members-month">+? new this month</p>
</div>

//CSS

.card {
  background-color: #eff6ff; /* bg-blue-50 */
  border: 1px solid #bfdbfe; /* border-blue-200 */
  border-radius: 0.5rem;     /* rounded-lg */
  padding: 1rem;             /* p-4 */
}

.card-members .card-title {
  font-size: 0.875rem;       /* text-sm */
  font-weight: 500;          /* font-medium */
  color: #1d4ed8;            /* text-blue-700 */
  margin-bottom: 0.25rem;    /* mb-1 */
}

.card-members .card-value {
  font-size: 1.5rem;         /* text-2xl */
  font-weight: 700;          /* font-bold */
  color: #1e3a8a;            /* text-blue-900 */
}

.card-members .card-subtitle {
  font-size: 0.75rem;        /* text-xs */
  color: #2563eb;            /* text-blue-600 */
}

.card-members .card-delta {
  font-size: 0.75rem;        /* text-xs */
  color: #60a5fa;            /* text-blue-400 */
  margin-top: 0.25rem;       /* mt-1 */
}


//or

//////////////////////////////////////////////////////
const cardDefinitions = [
  {
    id: "members",
    title: "Members",
    description: "Registered users",
    deltaText: "+? new this month",
    dataBindings: {
      value: "members-count",
      delta: "members-month"
    },
    style: {
      theme: "blue"
    },
    action: "members-stats"
  },
  {
    id: "assignments",
    title: "Assignments",
    description: "Students, managers & assigned tasks",
    deltaText: "+? this week",
    dataBindings: {
      value: "assignments-count",
      delta: "assignments-week"
    },
    style: {
      theme: "red"
    },
    action: "assignments-stats"
  },
  {
    id: "tasks",
    title: "Tasks",
    description: "Available tasks",
    deltaText: "+? added this month",
    dataBindings: {
      value: "tasks-count",
      delta: "tasks-month"
    },
    style: {
      theme: "yellow"
    },
    action: "tasks-stats"
  }
];



//render:

function renderCard(cardDef, data) {
  const card = document.createElement("div");
  card.className = `card card-${cardDef.style.theme}`;
  card.setAttribute("data-action", cardDef.action);

  card.innerHTML = `
    <h3 class="card-title">${cardDef.title}</h3>
    <p class="card-value">${data[cardDef.dataBindings.value] ?? "?"}</p>
    <p class="card-description">${cardDef.description}</p>
    <p class="card-delta">${data[cardDef.dataBindings.delta] ?? cardDef.deltaText}</p>
  `;

  return card;
}

//loop and append

cardDefinitions.forEach(def => {
  const card = renderCard(def, liveData);
  dashboard.appendChild(card);
});

//with css

.card {
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid;
}

.card-blue {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

.card-red {
  background-color: #fee2e2;
  border-color: #fecaca;
  color: #b91c1c;
}

.card-yellow {
  background-color: #fef9c3;
  border-color: #fde68a;
  color: #ca8a04;
}

///////////////////////////////////////////////




const MutateRegistry = {
  'task-&-member': {
    'member-management': {
      sectionTitle: 'Manage Members',
      cards: [
        {
          name: 'Add Member',
          description: 'Create a new member profile',
          action: 'add-member-dialogue',
          menuType:'module-loader', //section-mutation // back-button
          work:'create-member',//create-task // send-message // display-data //...
          subject:'members' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...
          
        },
        {
          name: 'Assign Task',
          description: 'Assign a task to a member',
          action: 'assign-task-dialogue',
          menuType:'module-loader', //section-mutation // back-button
          work:'create-member',//create-task // send-message // display-data //...
          subject:'members', // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Edit Member',
          description: 'Update member details',
          action: 'edit-member-dialogue',
          menuType:'module-loader', //section-mutation // back-button
          work:'create-member',//create-task // send-message // display-data //...
          subject:'members', // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Remove Member',
          description: 'Delete a member from the system',
          action: 'remove-member-dialogue',
          menuType:'module-loader', //section-mutation // back-button
          work:'create-member',//create-task // send-message // display-data //...
          subject:'members', // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        }
      ]
    },
    'task-management': {
      sectionTitle: 'Manage Tasks',
      cards: [
        {
          name: 'Create Task',
          description: 'Start a new task',
          action: 'create-task-dialogue',
          menuType:'module-loader', //section-mutation // back-button
          work:'create-member',//create-task // send-message // display-data //...
          subject:'members' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Assign Task',
          description: 'Assign task to member',
          action: 'assign-task-dialogue',
          menuType:'module-loader', //section-mutation // back-button
          work:'assign-task',//create-task // send-message // display-data //...
          subject:'???  hard to say as members & tasks' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Edit Task',
          description: 'Modify task details',
          action: 'edit-task-dialogue',
          menuType:'module-loader', //section-mutation // back-button
          work:'edit-task',//create-task // send-message // display-data //...
          subject:'tasks' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Delete Task',
          description: 'Remove a task',
          action: 'delete-task-dialogue',
          menuType:'module-loader', //section-mutation // back-button
          work:'delete-task',//create-task // send-message // display-data //...
          subject:'tasks' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Task Overview',
          description: 'View all tasks',
          action: 'view-tasks',
          menuType:'module-loader', //section-mutation // back-button
          work:'display-data',//create-task // send-message // display-data //...
          subject:'tasks' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Move Student',
          description: 'Change the step the student is on',
          action: 'move-student-step',
          menuType:'module-loader', //section-mutation // back-button
          work:'move-student',//create-task // send-message // display-data //...
          subject:'students & tasks ????  This category isnt going to work' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        }
      ]
    }
  }
};

// OR 

{
  name: '← Back to Members',
  description: 'Return to member management',
  action: 'go-back',
  backTarget: 'member-management',
  icon: '🔙',
  style: { backgroundColor: '#eee', color: '#333' }
}

//or

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


