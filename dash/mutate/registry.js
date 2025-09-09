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
const MutateRegistry = {
  'task-&-member': {
    'member-management': {
      sectionTitle: 'Manage Members',
      cards: [
        {
          name: 'Add Member',
          description: 'Create a new member profile',
          action: 'add-member-dialogue'
          menuType:'module-loader' //section-mutation // back-button
          work:'create-member'//create-task // send-message // display-data //...
          subject:'members' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...
          
        },
        {
          name: 'Assign Task',
          description: 'Assign a task to a member',
          action: 'assign-task-dialogue'
          menuType:'module-loader' //section-mutation // back-button
          work:'create-member'//create-task // send-message // display-data //...
          subject:'members' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Edit Member',
          description: 'Update member details',
          action: 'edit-member-dialogue'
          menuType:'module-loader' //section-mutation // back-button
          work:'create-member'//create-task // send-message // display-data //...
          subject:'members' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Remove Member',
          description: 'Delete a member from the system',
          action: 'remove-member-dialogue'
          menuType:'module-loader' //section-mutation // back-button
          work:'create-member'//create-task // send-message // display-data //...
          subject:'members' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'View History',
          description: 'See member task history',
          action: 'view-member-history'
          menuType:'module-loader' //section-mutation // back-button
          work:'create-member'//create-task // send-message // display-data //...
          subject:'members' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Export Data',
          description: 'Download member data',
          action: 'export-member-data'
          menuType:'module-loader' //section-mutation // back-button
          work:'create-member'//create-task // send-message // display-data //...
          subject:'members' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        }
      ]
    },
    'task-management': {
      sectionTitle: 'Manage Tasks',
      cards: [
        {
          name: 'Create Task',
          description: 'Start a new task',
          action: 'create-task-dialogue'
          menuType:'module-loader' //section-mutation // back-button
          work:'create-member'//create-task // send-message // display-data //...
          subject:'members' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Assign Task',
          description: 'Assign task to member',
          action: 'assign-task-dialogue'
          menuType:'module-loader' //section-mutation // back-button
          work:'assign-task'//create-task // send-message // display-data //...
          subject:'???  hard to say as members & tasks' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Edit Task',
          description: 'Modify task details',
          action: 'edit-task-dialogue'
          menuType:'module-loader' //section-mutation // back-button
          work:'edit-task'//create-task // send-message // display-data //...
          subject:'tasks' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Delete Task',
          description: 'Remove a task',
          action: 'delete-task-dialogue'
          menuType:'module-loader' //section-mutation // back-button
          work:'delete-task'//create-task // send-message // display-data //...
          subject:'tasks' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Task Overview',
          description: 'View all tasks',
          action: 'view-tasks'
          menuType:'module-loader' //section-mutation // back-button
          work:'display-data'//create-task // send-message // display-data //...
          subject:'tasks' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

        },
        {
          name: 'Move Student',
          description: 'Change the step the student is on',
          action: 'move-student-step'
          menuType:'module-loader' //section-mutation // back-button
          work:'move-student'//create-task // send-message // display-data //...
          subject:'students & tasks ????  This category isn't going to work' // tasks // knowledge // approfiles // authors // students //managers // abstract // groups//...

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


