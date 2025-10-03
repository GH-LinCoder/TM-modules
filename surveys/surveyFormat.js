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
                      "sort_id": {
                        "data_type": "bigint",
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
                            }
