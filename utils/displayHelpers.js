// utils/displayHelpers.js
export function getDisplayLabel(row, tableSchema, tableName) {
    switch (tableName) {
      case 'approfile_relations':
        // Show: "approfile_is → relationship → of_approfile"
        // But we only have IDs here — so we show IDs unless you join
        return `${row.approfile_is} → ${row.relationship} → ${row.of_approfile}`;
  
      case 'task_assignments':
        // Show: "Student: [student_id] → Step: [step_id]"
        return `Student: ${row.student_id} → Step: ${row.step_id}`;
  
      case 'task_steps':
        // Show: "[name] (Step #[step_order])"
        return `${row.name} (Step #${row.step_order})`;
  
      case 'approfile_relations_view':
        // This view has names! Show: "Jane → member → Team Alpha"
        return `${row.approfile_is_name} is ${row.relationship} of ${row.of_approfile_name}`;
  
      case 'task_assignment_view':
      case 'task_assignment_view2':  
        // Show: "[student_name] → [step_name] → [task_name]"
        return `${row.student_name} → ${row.step_name} → ${row.task_name}`;
  
      default:
        // Fallback: use displayField
        return row[tableSchema.displayField] || `[${row[tableSchema.idField]}]`;
    }
  }