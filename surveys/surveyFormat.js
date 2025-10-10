//  ./surveys/surveyFormat.js
surveyFormat =
{
    title: "string",           // Survey title (max 128 chars)
    description: "string",     // Survey description (max 2000 chars)
    questions: [
      {
        text: "string",        // Question text (max 500 chars)
        answers: [
          {
            text: "string",    // Answer text (max 200 chars)
            task: {            // Optional - only included if a task is selected
              id: "string",    // Task ID from clipboard
              name: "string"   // Task name from clipboard
            } | null,
            approfile: {       // Optional - only included if an approfile is selected
              of: "string",    // Approfile ID from clipboard
              ofName: "string", // Approfile name from clipboard
              relationship: "string" // Relationship type (default: 'member', max 50 chars)
            } | null
          }
        ]
      }
    ]
  },

/*  possible TABLE
  surveyResponses
  id UUID PRIMARY KEY,
  respondent_id UUID NOT NULL,
  survey_id UUID NOT NULL,
  question_id UUID NOT NULL,
  answer_id UUID NULL,         -- NULL if feedback-only
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  response_type TEXT CHECK (response_type IN ('automation', 'feedback')),
  automation_id UUID NULL,     -- Only for automation responses
  feedback_text TEXT NULL,     -- Only for feedback responses

  name TEXT NULL,              -- Optional: name of automation or feedback label
  description TEXT NULL        -- Optional: Markdown-formatted description

  
*/


            "survey_headers" = {
              "id": {
                "data_type": "uuid",
                "is_nullable": "NO",
                "column_default": "gen_random_uuid()"
              },
              "name": {
                "data_type": "text",
                "is_nullable": "NO",
                "column_default": null
              },
              "author_id": {
                "data_type": "uuid",
                "is_nullable": "YES",
                "column_default": "gen_random_uuid()"
              },
              "created_at": {
                "data_type": "timestamp with time zone",
                "is_nullable": "NO",
                "column_default": "now()"
              },
              "automations": {
                "data_type": "boolean",
                "is_nullable": "YES",
                "column_default": null
              },
              "description": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "last_updated_at": {
                "data_type": "timestamp with time zone",
                "is_nullable": "YES",
                "column_default": null
              }
            },
                    "survey_questions"= {
                      "id": {
                        "data_type": "uuid",
                        "is_nullable": "NO",
                        "column_default": "gen_random_uuid()"
                      },
                      "name": {
                        "data_type": "text",
                        "is_nullable": "NO",
                        "column_default": null
                      },
                      "question_number": {
                        "data_type": "int",
                        "is_nullable": "NO",
                        "column_default": null
                      },
                      "author_id": {
                        "data_type": "uuid",
                        "is_nullable": "YES",
                        "column_default": "gen_random_uuid()"
                      },
                      "created_at": {
                        "data_type": "timestamp with time zone",
                        "is_nullable": "NO",
                        "column_default": "now()"
                      },
                      "automations": {
                        "data_type": "boolean",
                        "is_nullable": "YES",
                        "column_default": null
                      },
                      "description": {
                        "data_type": "text",
                        "is_nullable": "YES",
                        "column_default": null
                      },
                      "last_updated_at": {
                        "data_type": "timestamp with time zone",
                        "is_nullable": "YES",
                        "column_default": null
                      },
                      "survey_header_id": {
                        "data_type": "uuid",
                        "is_nullable": "NO",
                        "column_default": null
                      }
                    },

                            "survey_answers"= {
                              "id": {
                                "data_type": "uuid",
                                "is_nullable": "NO",
                                "column_default": "gen_random_uuid()"
                              },
                              "name": {
                                "data_type": "text",
                                "is_nullable": "NO",
                                "column_default": null
                              },
                              "automation": {
                                "data_type": "boolean",
                                "is_nullable": "YES",
                                "column_default": null
                              },
                              "created_at": {
                                "data_type": "timestamp with time zone",
                                "is_nullable": "NO",
                                "column_default": "now()"
                              },
                              "description": {
                                "data_type": "text",
                                "is_nullable": "YES",
                                "column_default": null
                              },
                              "last_updated_at": {
                                "data_type": "timestamp with time zone",
                                "is_nullable": "YES",
                                "column_default": null
                              },
                              "survey_question_id": {
                                "data_type": "uuid",
                                "is_nullable": "NO",
                                "column_default": null
                              }
                            },

                                  "automations"= {
                                    "id": {
                                      "data_type": "uuid",
                                      "is_nullable": "NO",
                                      "column_default": "gen_random_uuid()"
                                    },
                                    "name": { 
                                      "data_type": "text",
                                      "is_nullable": "YES",
                                      "column_default": null
                                    },
                                    "description": {
                                      "data_type": "text",
                                      "is_nullable": "YES",
                                      "column_default": null
                                    },
                                    // task related data
                                    "to_step": {  // if changing where the student is on the task
                                      "data_type": "integer",
                                      "is_nullable": "YES",
                                      "column_default": null
                                    },
                                    "from_step": {  // if changing where the student is on the task
                                      "data_type": "integer",
                                      "is_nullable": "YES",
                                      "column_default": null
                                    },

                                    "student_id": { // to be able to move or assign a student on a task
                                      "data_type": "uuid",
                                      "is_nullable": "YES",
                                      "column_default": "gen_random_uuid()"
                                    },
                                    "task_step_id": { //where to put the student
                                      "data_type": "uuid",
                                      "is_nullable": "YES",
                                      "column_default": "gen_random_uuid()"
                                    },

                                    //relation based data
                                    "appro_is_id": {
                                      "data_type": "uuid",
                                      "is_nullable": "YES",
                                      "column_default": "gen_random_uuid()"
                                    },
                                    "relationship": { // if creating a relation
                                      "data_type": "text",
                                      "is_nullable": "YES",
                                      "column_default": null
                                    },
                                    "of_appro_id": {
                                      "data_type": "uuid",
                                      "is_nullable": "YES",
                                      "column_default": "gen_random_uuid()"
                                    },

                                    "appro_relations_id": { // if updating an existing relation
                                      "data_type": "uuid",
                                      "is_nullable": "YES",
                                      "column_default": null
                                    },

                                    "survey_answer_id": { // source of trigger if a survey
                                      "data_type": "uuid",
                                      "is_nullable": "YES",
                                      "column_default": "gen_random_uuid()"
                                    },

                                    "task_header_id": {// source of trigger if a task
                                      "data_type": "uuid",
                                      "is_nullable": "YES",
                                      "column_default": "gen_random_uuid()"
                                    },

                                    "created_at": {
                                      "data_type": "timestamp with time zone",
                                      "is_nullable": "NO",
                                      "column_default": "now()"
                                    },
                                                                      
                                    "last_updated_at": {
                                      "data_type": "timestamp with time zone",
                                      "is_nullable": "YES",
                                      "column_default": null
                                    },
 
                                  },



                                "survey_view" =  // VIEW read only
                                    {
                                      "column_name": "survey_id",
                                      "data_type": "uuid",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "survey_name",
                                      "data_type": "text",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "survey_description",
                                      "data_type": "text",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "author_id",
                                      "data_type": "uuid",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "survey_created_at",
                                      "data_type": "timestamp with time zone",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "question_id",
                                      "data_type": "uuid",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "question_text",
                                      "data_type": "text",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "question_description",
                                      "data_type": "text",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "question_number",
                                      "data_type": "integer",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "answer_id",
                                      "data_type": "uuid",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "answer_text",
                                      "data_type": "text",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "answer_description",
                                      "data_type": "text",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "answer_number",
                                      "data_type": "integer",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "automation_id",
                                      "data_type": "uuid",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "automation_name",
                                      "data_type": "text",
                                      "is_nullable": "YES"
                                    },
                                    {
                                      "column_name": "automation_number",
                                      "data_type": "integer",
                                      "is_nullable": "YES"
                                    }
                                                                    