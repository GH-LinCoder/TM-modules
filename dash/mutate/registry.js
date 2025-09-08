// ./dash/mutate/registry.js
console.log('mutate/registry.js');

//interogate it by first selecting the SECTION , check that exists and then by SECTION
//  const mutation = MutateRegistry[section]?.[action];
//


const MutateRegistry = {
  'task-&-member': {
    'member-management': {
      sectionTitle: 'Manage Members',
      cards: [
        {
          name: 'Add Member',
          description: 'Create a new member profile',
          action: 'add-member-dialogue'
        },
        {
          name: 'Assign Task',
          description: 'Assign a task to a member',
          action: 'assign-task-dialogue'
        },
        {
          name: 'Edit Member',
          description: 'Update member details',
          action: 'edit-member-dialogue'
        },
        {
          name: 'Remove Member',
          description: 'Delete a member from the system',
          action: 'remove-member-dialogue'
        },
        {
          name: 'View History',
          description: 'See member task history',
          action: 'view-member-history'
        },
        {
          name: 'Export Data',
          description: 'Download member data',
          action: 'export-member-data'
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
        },
        {
          name: 'Assign Task',
          description: 'Assign task to member',
          action: 'assign-task-dialogue'
        },
        {
          name: 'Edit Task',
          description: 'Modify task details',
          action: 'edit-task-dialogue'
        },
        {
          name: 'Delete Task',
          description: 'Remove a task',
          action: 'delete-task-dialogue'
        },
        {
          name: 'Task Overview',
          description: 'View all tasks',
          action: 'view-tasks'
        },
        {
          name: 'Export Tasks',
          description: 'Download task data',
          action: 'export-task-data'
        }
      ]
    }
  }
};
