// utils/tableSchema.js
export const TABLE_SCHEMAS = {
    // APPROFILES — People, Tasks, Groups, Abstract Concepts
    app_profiles: {
      label: "Approfiles (People, Tasks, Groups)",
      displayField: "name",
      idField: "id",
      defaultAs: "approfile",
      description: "Profiles for users, tasks, groups, and abstract concepts"
    },
  /*
    // RELATIONSHIPS — The actual relations between approfiles
    approfile_relations: {
      label: "Approfile Relations",
      displayField: "relationship_display", // We'll compute this
      idField: "id",
      defaultAs: "relationship",
      description: "Which approfile is related to which other, via what bridge"
    },
  */
    // RELATIONSHIP TYPES — The dictionary of allowed relationship names
    relationships: {
      label: "Relationship Types (Bridge Dictionary)",
      displayField: "name",
      idField: "id",
      defaultAs: "bridge",
      description: "Reference table of all recognized relationship types"
    },
  
    // TASK ASSIGNMENTS — Who is assigned to what task/step
 /*
    task_assignments: {
      label: "Task Assignments (Student ↔ Task Step)",
      displayField: "assignment_display", // We'll compute this
      idField: "id",
      defaultAs: "assignment",
      description: "Tracks who (student) is on which task step"
    },
 */ 
/*
    // TASK STEPS — Individual steps within tasks
    task_steps: {
      label: "Task Steps",
      displayField: "step_display", // We'll compute this
      idField: "id",
      defaultAs: "step",
      description: "The many steps that a task comprises"
    },
  */
    // TASK HEADERS — The main task containers (name, description)
    task_headers: {
      label: "Task Headers (Tasks)",
      displayField: "name",
      idField: "id",
      defaultAs: "task",
      description: "The name & description of created tasks"
    },
  
    // VIEWS — For easier selection
  
    approfile_relations_view: {
      label: "Approfile Relationships (View)",
      displayField: "view_display", // We'll compute this
      idField: "relation_id",
      defaultAs: "relationship",
      description: "View: approfile_is_name is relationship of of_approfile_name"
    },
  
    task_assignment_view: {
      label: "Task Assignments (View)",
      displayField: "view_display", // We'll compute this
      idField: "assignment_id",
      defaultAs: "assignment",
      description: "View: student_name → step_name → task_name"
    }
  };