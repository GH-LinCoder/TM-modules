let autoPetition= {
  user: {
    authId: null,
    approId: null
  },

  existing: {
    automationId: null,
    assignmentId: null
  },

  source: {
    type: null,        // 'task' | 'survey' | 'relate' | 'unrelate' | 'message' | 'future'
    header: null,      // task_header_id | survey_header_id | null
    secondary: null,    // task_step_id | survey_question_id | null
    tertiary:null
  },

   target_data: { target:{
    type: 'relate',        // same enum as above
    header: 'approfile_relations',     // task_header_id | survey_header_id | appro_is | null
    secondary:null,    // task_step_id | survey_question_id | relationship | of_appro | null
  }, payload:{//example
        appro_is_id: target_appro_is_id,
        relationship:target_relationship,
        of_appro_id:target_of_appro_id,
              }
            }
}