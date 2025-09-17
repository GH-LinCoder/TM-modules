//  ./registry/dbSchema.js  // list of all availabe database columns

export const dbSchema = {






////////////////////////////////                      APPROFILES                 ////////////////////////////////


profiles:{ //read only copy of user.auth(). Synched with user.auth()

            
              "id": {
                "data_type": "uuid",
                "is_primary_key": true,
                "is_nullable": "NO",
                "column_default": null
              },
              "email": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "website": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "username": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "full_name": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "avatar_url": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "created_at": {
                "data_type": "timestamp with time zone",
                "is_nullable": "YES",
                "column_default": "now()"
              },
              "updated_at": {
                "data_type": "timestamp with time zone",
                "is_nullable": "YES",
                "column_default": null
              }
},

app_profiles:{ // profile of users, tasks, groups, and abstract concepts. Updated by profiles & by taskheaders & software


              "id": {
                "data_type": "uuid",
                "is_primary_key": true,
                "is_nullable": "NO",
                "column_default": "gen_random_uuid()"
                
              },
              "name": {
                "data_type": "text",
                "is_nullable": "NO",
                "column_default": null
              },
              "email": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "notes": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "phone": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "sort_int": {
                "data_type": "bigint",
                "is_nullable": "NO",
                "column_default": null
              },
              "avatar_url": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "created_at": {
                "data_type": "timestamp with time zone",
                "is_nullable": "YES",
                "column_default": null
              },
              "updated_at": {
                "data_type": "timestamp with time zone",
                "is_nullable": "YES",
                "column_default": null
              },
              "description": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "auth_user_id": {
                "data_type": "uuid",
                "is_nullable": "YES",
                "column_default": null,
                "foreign_table_name": "profiles",
                "foreign_column_name": "id",
                "on_update": "CASCADE",
                "on_delete": "RESTRICT"
              },
              "external_url": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "task_header_id": {
                "data_type": "uuid",
                "is_nullable": "YES",
                "column_default": null,
                "foreign_table_name": "task_headers",
                "foreign_column_name": "id",
                "on_update": "CASCADE",
                "on_delete": "RESTRICT"
              }
},


approfile_relations:{ // store of which approfile is related to which other

              "id": {
                "data_type": "uuid",
                "is_primary_key": true,
                "is_nullable": "NO",
                "column_default": "gen_random_uuid()"
              },
              "sort_int": {
                "data_type": "bigint",
                "is_nullable": "NO",
                "column_default": null
              },
              "created_at": {
                "data_type": "timestamp with time zone",
                "is_nullable": "NO",
                "column_default": "now()"
              },
              "approfile_is": {
                "data_type": "uuid",
                "is_nullable": "NO",
                "column_default": null,
                "foreign_table_name": "app_profiles",
                "foreign_column_name": "id",
                "on_update": "NO ACTION",
                "on_delete": "NO ACTION"                
              },
              "of_approfile": {
                "data_type": "uuid",
                "is_nullable": "NO",
                "column_default": null,    
                "foreign_table_name": "app_profiles",
                "foreign_column_name": "id",
                "on_update": "CASCADE",
                "on_delete": "CASCADE"
              },
              "relationship": {
                "data_type": "text",
                "is_nullable": "NO",
                "column_default": null,
                "foreign_table_name": "relationships",
                "foreign_column_name": "name",
                "on_update": "CASCADE",
                "on_delete": "CASCADE"
              }
},


relationships:{ // a reference table of all recognised relationships

              "id": {
                "data_type": "uuid",
                "is_primary_key": true,
                "is_nullable": "NO",
                "column_default": "gen_random_uuid()"
              },
              "name": {
                "data_type": "text",
                "is_nullable": "NO",
                "column_default": null
              },
              "category": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "created_at": {
                "data_type": "timestamp without time zone",
                "is_nullable": "YES",
                "column_default": "CURRENT_TIMESTAMP"
              },
              "description": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              }
},

approfile_relationships: //view
    {
          "rel_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "created_at": {
            "data_type": "timestamp with time zone",
            "is_nullable": "YES",
            "column_default": null
          },
          "relation_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "approfile_is": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "of_approfile": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "relationship": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "rel_description": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "approfile_is_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "of_approfile_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          }
},


////////////////////////////////                      TASKS                    ////////////////////////////////


task_assignments: { // who or what is on a task

      "id": {
        "data_type": "uuid",
        "is_primary_key": true,
        "is_nullable": "NO",
        "column_default": "uuid_generate_v4()"
      },
      "step_id": {
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": null,
        "foreign_table_name": "task_steps",
        "foreign_column_name": "id",
        "on_update": "CASCADE",
        "on_delete": "CASCADE"
      },
      "sort_int": {
        "data_type": "integer",
        "is_nullable": "NO",
        "column_default": null
      },
      "manager_id": {
        "data_type": "uuid",
        "is_nullable": "YES",
        "column_default": null
      },
      "student_id": {
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": null
      },
      "assigned_at": {
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "(now() AT TIME ZONE 'utc'::text)"
      },
      "abandoned_at": {
        "data_type": "timestamp with time zone",
        "is_nullable": "YES",
        "column_default": null
      },
      "completed_at": {
        "data_type": "timestamp with time zone",
        "is_nullable": "YES",
        "column_default": null
      },
      "task_header_id": {
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": null,
        "foreign_table_name": "task_headers",
    "foreign_column_name": "id",
    "on_update": "NO ACTION",
    "on_delete": "CASCADE"      
        }
},



task_steps:{ // the many steps that a task comprises


      "id": {
        "data_type": "uuid",
        "is_primary_key": true,
        "is_nullable": "NO",
        "column_default": "uuid_generate_v4()"
      },
      "name": {
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      "sort_int": {
        "data_type": "integer",
        "is_nullable": "NO",
        "column_default": null
      },
      "author_id": {
        "data_type": "uuid",
        "is_nullable": "YES",
        "column_default": null
      },
      "created_at": {
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "(now() AT TIME ZONE 'utc'::text)"
      },
      "step_order": {
        "data_type": "integer",
        "is_nullable": "NO",
        "column_default": "1"
      },
      "description": {
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      "external_url": {
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },

      "task_header_id": {
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": null,
        "foreign_table_name": "task_headers",
        "foreign_column_name": "id",
        "on_update": "NO ACTION",
        "on_delete": "CASCADE"

      }
},


task_headers:{ // the name & description of created tasks

      "id": {
        "data_type": "uuid",
        "is_primary_key": true,
        "is_nullable": "NO",
        "column_default": "uuid_generate_v4()"
      },
      "name": {
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      "sort_int": {
        "data_type": "integer",
        "is_nullable": "NO",
        "column_default": null
      },
      "author_id": {
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": null
      },
      "created_at": {
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "(now() AT TIME ZONE 'utc'::text)"
      },
      "description": {
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      "external_url": {
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      }
},




task_assignment_view: {
        "step_id": {
          "data_type": "uuid",
          "is_nullable": "YES",
          "column_default": null
        },
        "step_name": {
          "data_type": "text",
          "is_nullable": "YES",
          "column_default": null
        },
        "task_name": {
          "data_type": "text",
          "is_nullable": "YES",
          "column_default": null
        },
        "manager_id": {
          "data_type": "uuid",
          "is_nullable": "YES",
          "column_default": null
        },
        "step_order": {
          "data_type": "integer",
          "is_nullable": "YES",
          "column_default": null
        },
        "student_id": {
          "data_type": "uuid",
          "is_nullable": "YES",
          "column_default": null
        },
        "assigned_at": {
          "data_type": "timestamp with time zone",
          "is_nullable": "YES",
          "column_default": null
        },
        "abandoned_at": {
          "data_type": "timestamp with time zone",
          "is_nullable": "YES",
          "column_default": null
        },
        "completed_at": {
          "data_type": "timestamp with time zone",
          "is_nullable": "YES",
          "column_default": null
        },
        "manager_name": {
          "data_type": "text",
          "is_nullable": "YES",
          "column_default": null
        },
        "student_name": {
          "data_type": "text",
          "is_nullable": "YES",
          "column_default": null
        },
        "assignment_id": {
          "data_type": "uuid",
          "is_nullable": "YES",
          "column_default": null
        },
        "task_header_id": {
          "data_type": "uuid",
          "is_nullable": "YES",
          "column_default": null
        },
        "task_description": {
          "data_type": "text",
          "is_nullable": "YES",
          "column_default": null
        }
      }
}







/*   replaced by task_assignment_view (see above) 20:04 Sept 15 2025
//because this older one doesn't have step number or name
task_assignment_details: //view
    {

          "task_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "manager_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "student_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "assigned_at": {
            "data_type": "timestamp with time zone",
            "is_nullable": "YES",
            "column_default": null
          },
          "abandoned_at": {
            "data_type": "timestamp with time zone",
            "is_nullable": "YES",
            "column_default": null
          },
          "completed_at": {
            "data_type": "timestamp with time zone",
            "is_nullable": "YES",
            "column_default": null
          },
          "manager_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "student_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "assignment_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "task_header_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "task_description": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          }
},
  
      
tasks_with_steps: //view
    {

          "step_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "task_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "task_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "step_order": {
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": null
          },
          "step_description": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          }
},
////////////////////////////////                      APP EVENTS LOGS                    ////////////////////////////////


app_event_labels:{

        "id": {
          "data_type": "uuid",
          "is_primary_key": true,
          "is_nullable": "NO",
          "column_default": "gen_random_uuid()"
        },
        "code": {
          "data_type": "text",
          "is_nullable": "NO",
          "column_default": null
        },
        "name": {
          "data_type": "text",
          "is_nullable": "NO",
          "column_default": null
        },
        "sort_int": {
          "data_type": "bigint",
          "is_nullable": "NO",
          "column_default": null
        },
        "description": {
          "data_type": "text",
          "is_nullable": "YES",
          "column_default": null
        }
}, 



app_event_log:{ //trigger from most other tables and function

              "sort_int": {
                "data_type": "integer",
                "is_primary_key": true,
                "is_nullable": "NO",
                "column_default": null
              },
              "created_at": {
                "data_type": "timestamp with time zone",
                "is_nullable": "NO",
                "column_default": "now()"
              },
              "event_name": {
                "data_type": "text",
                "is_nullable": "NO",
                "column_default": "'If db there is an entry_i_u_d else human error'::text",
                "foreign_table_name": "app_event_labels",
                "foreign_column_name": "name",
                "on_update": "RESTRICT",
                "on_delete": "RESTRICT"
              },
              "description": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "event_i_u_d": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              },
              "source_row_id": {
                "data_type": "uuid",
                "is_nullable": "YES",
                "column_default": null
              },
              "source_table_name": {
                "data_type": "text",
                "is_nullable": "YES",
                "column_default": null
              }
},

//


//

unified_event_log: //view
    {
          "sort_int": {
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": null
          },
          "created_at": {
            "data_type": "timestamp with time zone",
            "is_nullable": "YES",
            "column_default": null
          },
          "event_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "description": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "event_i_u_d": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "resolved_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "source_row_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "source_table_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "resolved_description": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          }
},


////////////////////////////////                      PERMISSIONS                    ////////////////////////////////


role_permissions:{  //not yet in use 21:26 Sept 11 2025

              "role": {
                "data_type": "USER-DEFINED",
                "is_nullable": "NO",
                "column_default": null
              },
              "sort_int": {
                "data_type": "integer",
                "is_nullable": "NO",
                "column_default": null
              },
              "permission": {
                "data_type": "USER-DEFINED",
                "is_nullable": "NO",
                "column_default": null
              }
},

user_roles:{ //not yet in use 21:26 Spet 11 2025


              "role": {
                "data_type": "USER-DEFINED",
                "is_nullable": "NO",
                "column_default": null
              },
              "user_id": {
                "data_type": "uuid",
                "is_nullable": "NO",
                "column_default": null
              },
              "sort_int": {
                "data_type": "integer",
                "is_nullable": "NO",
                "column_default": null
              }
},

user_permissions: {
    "id": {
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null
    },
    "rowid": {
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null
    },
    "userid": {
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null
    },
    "canread": {
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false"
    },
    "columnid": {
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "columns",
      "foreign_column_name": "id",
      "on_update": "NO ACTION",
      "on_delete": "NO ACTION"
    },
    "expireat": {
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": null
    },
    "cancreate": {
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false"
    },
    "candelete": {
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false"
    },
    "canupdate": {
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false"
    },
    "createdat": {
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "CURRENT_TIMESTAMP"
    },
    "grantedby": {
      "data_type": "uuid",
      "is_nullable": "YES",
      "column_default": null
    }
  },





////////////////////////////////                  KNOWLEDGE                    ////////////////////////////////


knowledge:{ // not yet built 21:26 Spet 11 2025


},

////////////////////////////////                      VIEWS                    ////////////////////////////////



unique_students:{   //view

          "email": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "student_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "student_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          }
},

unique_managers: //view
    { 

          "email": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "manager_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "manager_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          }
},

unique_authors: //view
    {
          "email": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          },
          "author_id": {
            "data_type": "uuid",
            "is_nullable": "YES",
            "column_default": null
          },
          "author_name": {
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null
          }
      
},

    






} //end of dbSchema


////////////////////////////////////  FUNCTIONS    //////////////////////////////////

export const dbFunctions = {
    insert_new_uuid_into_app_profiles_auth_user_id: {
      schema: "public",
      returns: "trigger",
      parameters: [],
      definition: `CREATE OR REPLACE FUNCTION public.insert_new_uuid_into_app_profiles_auth_user_id()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
  BEGIN
    INSERT INTO public.app_profiles (auth_user_id, name)
    VALUES (
      NEW.id,
      NEW.username
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    RETURN NEW;
  END;
  $function$`
    },
  
    new_task_headers_create_steps: {
      schema: "public",
      returns: "trigger",
      parameters: [],
      definition: `CREATE OR REPLACE FUNCTION public.new_task_headers_create_steps()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
  BEGIN
    INSERT INTO public.task_steps (
      task_header_id,
      name,
      description,
      step_order
    ) VALUES
    (
      NEW.id,
      'abandoned',
      'The student or someone else determined that the task is not going to be completed',
      1
    ),
    (
      NEW.id,
      'completed',
      'The manager or someone considers the task to have been successful.',
      2
    ),
    (
      NEW.id,
      'Edit this...',
      'Edit this...',
      3
    );
    RETURN NEW;
  END;
  $function$`
    },
  
    insert_task_into_app_profiles: {
      schema: "public",
      returns: "trigger",
      parameters: [],
      definition: `CREATE OR REPLACE FUNCTION public.insert_task_into_app_profiles()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
  BEGIN
    INSERT INTO public.app_profiles (name, description, task_header_id)
    VALUES (
      NEW.name, NEW.description, NEW.id
    )
    ON CONFLICT (task_header_id) DO NOTHING;
    RETURN NEW;
  END;
  $function$`
    },
  
    authorize: {
      schema: "public",
      returns: "boolean",
      parameters: ["requested_permission app_permission"],
      definition: `CREATE OR REPLACE FUNCTION public.authorize(requested_permission app_permission)
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  DECLARE
    bind_permissions int;
    user_role public.app_role;
  BEGIN
    SELECT (auth.jwt() ->> 'user_role')::public.app_role INTO user_role;
  
    SELECT count(*)
    INTO bind_permissions
    FROM public.role_permissions
    WHERE role_permissions.permission = requested_permission
      AND role_permissions.role = user_role;
  
    RETURN bind_permissions > 0;
  END;
  $function$`
    },
  
    sync_auth_local_to_usersAuth: {
      schema: "public",
      returns: "trigger",
      parameters: [],
      definition: `CREATE OR REPLACE FUNCTION public."sync_auth_local_to_usersAuth"()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
  BEGIN
  
  END;
  $function$`
    },
  
    log_all_events: {
      schema: "public",
      returns: "trigger",
      parameters: [],
      definition: `CREATE OR REPLACE FUNCTION public.log_all_events()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
  DECLARE
    event_i_u_d TEXT;
    row_id UUID;
  BEGIN
    CASE TG_OP
      WHEN 'INSERT' THEN
        event_i_u_d := 'INSERT';
        row_id := NEW.id;
      WHEN 'UPDATE' THEN
        event_i_u_d := 'UPDATE';
        row_id := NEW.id;
      WHEN 'DELETE' THEN
        event_i_u_d := 'DELETE';
        row_id := OLD.id;
    END CASE;
  
    INSERT INTO public.app_event_log (
      event_i_u_d,
      source_table_name,
      source_row_id,
      created_at
    )
    VALUES (
      event_i_u_d,
      TG_TABLE_NAME,
      row_id,
      NOW()
    );
  
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END;
  $function$`
    },
  
    insert_new_uuid_into_app_profiles_task_header_id: {
      schema: "public",
      returns: "trigger",
      parameters: [],
      definition: `CREATE OR REPLACE FUNCTION public.insert_new_uuid_into_app_profiles_task_header_id()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
  BEGIN
    INSERT INTO public.app_profiles (task_header_id, name)
    VALUES (
      NEW.id,
      NEW.name
    )
    ON CONFLICT (task_header_id) DO NOTHING;
    RETURN NEW;
  END;
  $function$`
    }
  };

  /*  or this format

functions:[
    {
      "schema_name": "public",
      "function_name": "insert_new_uuid_into_app_profiles_auth_user_id",
      "definition": "CREATE OR REPLACE FUNCTION public.insert_new_uuid_into_app_profiles_auth_user_id()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\r\nBEGIN\r\n  INSERT INTO public.app_profiles (auth_user_id, name)\r\n  VALUES (\r\n    NEW.id,\r\n    NEW.username  \r\n  )\r\n  ON CONFLICT (auth_user_id) DO NOTHING;\r\n  RETURN NEW;\r\nEND;\r\n$function$\n",
      "parameters": "",
      "returns": "trigger"
    },
    {
      "schema_name": "public",
      "function_name": "new_task_headers_create_steps",
      "definition": "CREATE OR REPLACE FUNCTION public.new_task_headers_create_steps()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$BEGIN\r\n  -- Insert default task steps with new column name\r\n  INSERT INTO public.task_steps (\r\n    task_header_id, \r\n    name, \r\n    description, \r\n    step_order\r\n  ) VALUES \r\n  (\r\n    NEW.id, \r\n    'abandoned', \r\n    'The student or someone else determined that the task is not going to be completed', \r\n    1\r\n  ),\r\n  (\r\n    NEW.id, \r\n    'completed', \r\n    'The manager or someone considers the task to have been successful.', \r\n    2\r\n  ),\r\n  (\r\n    NEW.id, \r\n    'Edit this...', \r\n    'Edit this...', \r\n    3\r\n  );\r\n  \r\n  RETURN NEW;\r\nEND;$function$\n",
      "parameters": "",
      "returns": "trigger"
    },
    {
      "schema_name": "public",
      "function_name": "insert_task_into_app_profiles",
      "definition": "CREATE OR REPLACE FUNCTION public.insert_task_into_app_profiles()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\r\nBEGIN\r\n  INSERT INTO public.app_profiles (name, description, task_header_id)\r\n  VALUES (\r\n    NEW.name, NEW.description, NEW.id  \r\n  )\r\n  ON CONFLICT (task_header_id) DO NOTHING;\r\n  RETURN NEW;\r\nEND;\r\n$function$\n",
      "parameters": "",
      "returns": "trigger"
    },
    {
      "schema_name": "public",
      "function_name": "authorize",
      "definition": "CREATE OR REPLACE FUNCTION public.authorize(requested_permission app_permission)\n RETURNS boolean\n LANGUAGE plpgsql\n STABLE SECURITY DEFINER\n SET search_path TO ''\nAS $function$\r\ndeclare\r\n  bind_permissions int;\r\n  user_role public.app_role;\r\nbegin\r\n  -- Fetch user role once and store it to reduce number of calls\r\n  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;\r\n\r\n  select count(*)\r\n  into bind_permissions\r\n  from public.role_permissions\r\n  where role_permissions.permission = requested_permission\r\n    and role_permissions.role = user_role;\r\n\r\n  return bind_permissions > 0;\r\nend;\r\n$function$\n",
      "parameters": "requested_permission app_permission",
      "returns": "boolean"
    },
    {
      "schema_name": "public",
      "function_name": "sync_auth_local_to_usersAuth",
      "definition": "CREATE OR REPLACE FUNCTION public.\"sync_auth_local_to_usersAuth\"()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$BEGIN\r\n  \r\nEND;$function$\n",
      "parameters": "",
      "returns": "trigger"
    },
    {
      "schema_name": "public",
      "function_name": "log_all_events",
      "definition": "CREATE OR REPLACE FUNCTION public.log_all_events()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\r\nDECLARE\r\n    event_i_u_d TEXT;\r\n    row_id UUID;\r\nBEGIN\r\n    -- Determine the event type\r\n    CASE TG_OP\r\n        WHEN 'INSERT' THEN\r\n            event_i_u_d := 'INSERT';\r\n            row_id := NEW.id;\r\n        WHEN 'UPDATE' THEN\r\n            event_i_u_d := 'UPDATE';\r\n            row_id := NEW.id;\r\n        WHEN 'DELETE' THEN\r\n            event_i_u_d := 'DELETE';\r\n            row_id := OLD.id;\r\n    END CASE;\r\n\r\n    -- Insert into the event log with all required information\r\n    INSERT INTO public.app_event_log (\r\n        event_i_u_d,\r\n        source_table_name,\r\n        source_row_id,\r\n        created_at\r\n    )\r\n    VALUES (\r\n        event_i_u_d,\r\n        TG_TABLE_NAME,\r\n        row_id,\r\n        NOW()\r\n    );\r\n\r\n    -- Return appropriate value based on operation\r\n    IF TG_OP = 'DELETE' THEN\r\n        RETURN OLD;\r\n    ELSE\r\n        RETURN NEW;\r\n    END IF;\r\nEND;\r\n$function$\n",
      "parameters": "",
      "returns": "trigger"
    },
    {
      "schema_name": "public",
      "function_name": "insert_new_uuid_into_app_profiles_task_header_id",
      "definition": "CREATE OR REPLACE FUNCTION public.insert_new_uuid_into_app_profiles_task_header_id()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\r\nBEGIN\r\n  INSERT INTO public.app_profiles (task_header_id, name)\r\n  VALUES (\r\n    NEW.id,\r\n    NEW.name  \r\n  )\r\n  ON CONFLICT (task_header_id) DO NOTHING;\r\n  RETURN NEW;\r\nEND;\r\n$function$\n",
      "parameters": "",
      "returns": "trigger"
    }
  
]

*/


////////////////////////////////////////////////////// TRIGGERS   ///////////////////////////////////////////////////

export const dbTriggers = {
    insert_new_uuid_into_app_profiles_auth_user_id: {
      table: "profiles",
      function: "insert_new_uuid_into_app_profiles_auth_user_id",
      events: ["INSERT"],
      timing: "AFTER",
      orientation: "ROW",
      enabled: true
    },
  
    insert_new_uuid_into_app_profiles_task_header_id: {
      table: "task_headers",
      function: "insert_new_uuid_into_app_profiles_task_header_id",
      events: ["INSERT"],
      timing: "AFTER",
      orientation: "ROW",
      enabled: true
    },
  
    insert_task_into_app_profiles: {
      table: "task_headers",
      function: "insert_task_into_app_profiles",
      events: ["INSERT"],
      timing: "AFTER",
      orientation: "ROW",
      enabled: true
    },
  
    log_app_event_labels_events: {
      table: "app_event_labels",
      function: "log_all_events",
      events: ["INSERT", "DELETE", "UPDATE"],
      timing: "AFTER",
      orientation: "ROW",
      enabled: true
    },
  
    log_approfile_relations: {
      table: "approfile_relations",
      function: "log_all_events",
      events: ["INSERT", "DELETE", "UPDATE"],
      timing: "AFTER",
      orientation: "ROW",
      enabled: true
    },
  
    log_assignment_events: {
      table: "task_assignments",
      function: "log_all_events",
      events: ["INSERT", "DELETE", "UPDATE"],
      timing: "AFTER",
      orientation: "ROW",
      enabled: true
    },
  
    log_profiles_events: {
      table: "app_profiles",
      function: "log_all_events",
      events: ["INSERT", "DELETE", "UPDATE"],
      timing: "AFTER",
      orientation: "ROW",
      enabled: true
    },
  
    log_task_events: {
      table: "task_headers",
      function: "log_all_events",
      events: ["INSERT", "UPDATE", "DELETE"],
      timing: "AFTER",
      orientation: "ROW",
      enabled: true
    },
  
    log_task_steps: {
      table: "task_steps",
      function: "log_all_events",
      events: ["DELETE", "INSERT", "UPDATE"],
      timing: "AFTER",
      orientation: "ROW",
      enabled: true
    },
  
    log_user_permissions: {
      table: "user_permissions",
      function: "log_all_events",
      events: ["DELETE", "UPDATE", "INSERT"],
      timing: "AFTER",
      orientation: "ROW",
      enabled: true
    },
  
    on_task_headerers_created: {
      table: "task_headers",
      function: "new_task_headers_create_steps",
      events: ["INSERT"],
      timing: null, // not specified
      orientation: "ROW",
      enabled: true
    }
  };
  