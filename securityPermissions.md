🛡️ 1. Restricting database access 


The call to the db is a request to run a function that resides on the db. The javascript sends no API query

Therefore malicious users of the client cannot alter SQL and can't evade the permissions system. They may be able to get control of the permission granting, but they can't just alter the code being sent.

The database function has the REQUIRED permissions associated with the query.
(The required permissions are stored in a table. This means there is a central place that lists all the required permissions related to each & every database accessing function)

The db checks that the user has a set of permissions sufficient to match the permissions required by the function. 

If it finds the correct permissions the query is then run. 

The restrictions are on TABLES, ROWS & COLUMNS not just tables and rows. All CRUD actions can be restricted to individual table, row or column.  


How this is achieved:

Column level specification and checking

The javascript functions that want to query the database can only do so by calling a database function. These db functions have known characteristic needs to access a specific table(s), specific columns and a specific action (CRUD). These needs are in a look-up table. 

These specifics are pre-recorded when the function is developed or the coding is changed. It is regarded as a constant and is not evaluated during execution of the function.

In javascript all that is called is the name of the database function that eventually queries the database. The javascript cannot spoof.  The function details and the required permissions are not directly known to the javascript (but can be read if the permissions are held in a table. The advantage is the JS can evaluate whether the the current user has relevant permissions & thereby avoid pointless db quesries. But the JS can't grant actual access because that is hard coded into the functions). 

TERMS & SYNTAX:


atoms:
The word 'atom' is used to mean the most basic permission which consists of an 
ACTION (SELECT, INSERT, UPDATE,DELETE) 
followed by a separator '@' 
followed by a table_name (written exactly as the actual table name). 
An optional next part is a separator '#' 
followed by a column_name (written exactly as the actual column name). 

An example:  
SELECT@task_headers#name -This is permission to read the name column of the task_headers table.
UPDATE@survey_headers  -This is permission to edit any column of survey_headers  (Perhas we could use #* ?)



molecules:
A collection of permission atoms is called a 'permission molecule'. These are stored as TEXT [ ] which is a native Postgre array.
{ atom , atom , atom }


TABLES:

permission_atoms: All possible atoms are stored in the Table permission_atoms which has 
id:uuid, 
atom:text [ ]
(There are currently 516 rows in this table based on 11 tables)

permission_molecule_required: 
id uuid,
function_name text,
permissions_required text[],
created_at,
created_by uuid
The column 'permissions_required' contains the permissions that are required to run the function as a collection of formalised atomic permissions (smallest possible permission pieces) (this collection is called ‘a permission molecule’). The format chosen is on the assumption of this being the best for fast database use. The format could be changed if another is superior.


permission_molecule_roles:
id uuid, 
role text,  
molecule text[],   
created_at, 
created_by
The column 'molecule' contains the permissions associated with the name in the 'role' column. The format is the same as in the _required table. The role column would contain terms such as EDITOR  or EDITOR@surveys  which are human understandandle and have been defined in the 'molecule' column as an array of permission atoms. This table contains default, standard roles. The admin can also add new roles with their own definitions.  (THIS NEEDS DEEPER ANALYSIS & DESIGN)


permission_user_cache
user_id uuid,
granted_permissions text[],
cached_at timestamp,
expires_at timestamp 

This table lists the permissions that each user has. It is calculated and then stored, with the option of the cache being regarded as stale after a fixed period


A database function collects the required permission molecule from the _required Table and will later compare this to the collection of granted atomic permissions. If every atomic permission in the permission molecule is within the granted permission collection, then the access is permitted. If even one atom is missing, then access is denied.


The Table ‘permission_atoms’ contains the smallest possible permission (an 'atom') in each row. This is in a controlled syntax which specifies the CRUD action, the tableName, a single column in that table. The total number of rows would therefore be 4 times the total number of columns in all the tables subject to these column level rules.(The format is a string) 

Conversion from human/work based permission specification into a machine matchable permission molecule.

When a query is received by the database there is the name of the function being called plus the paramters. The name of the function (or function id) is then used to look-up the predetermined necessary permissions that are required for handling the query.

That is how the database knows what permissions are required for the query.

That explains how permissions are defined and compared.


Next we examine how the granted permissions are to be found:


Permissions are granted in two parts. This uses an existing system within the app called ‘appros’ and their ‘relations’. 

How to determine what permissions the user has:


An 'appro' is the name of a simple name tag that resides in the app_profiles table. It consists of an 
id:uuid, 
a name:text, 
a description:text and 
often, but not always, a column entry containing a foreign key id:uuid. This foreign key is only present if the appro represents 
1) an authenticated user
2) a task 
3) A survey 
(appros have many other columns which are not relevant here)

Appros can be connected to each other (‘related to each other’) via a link called a relationship. (Relationships are edges and appros are nodes.) This relating of appros is used in the app for various things, one of which will be the granting of permissions.

When a relationship is used to relate 2 appros the relationship (which is usually represented by a single word such as ‘member’ ) can form a phrase in poor English such as   "John IS member OF TestGroup". Where John is an authenticated user represented by his appro and TestGroup is an abstract entity representing some group probably involved with tests.

To clearly differentiate permissions from these other uses, there is a restricted and controlled syntax in the relationships that grant permissions (see later)

The permissions relationship syntax specifies the type of permission followed by optional restrictions by general type and then by specific limitations.

The relationship is applied to the person and a target. The target could be the appro that represents a specific task or a specific survey or an appro that defines a broad group. The first two can be resolved as referring to specific rows in a table and the possible sub-tables. The last one (the abstract target) either is one that is recognised by the system as having a meaning or if not the permission will be denied.

The syntax used within the relationship is such that it can be easily parsed into a permission molecule (a collection of atomic permissions). Also many common roles will already have been parsed into permission molecules and stored in the database.

The permission relations are stored with all the other relations such that any appro can be used to find all its relations. But for permissions we use a permissions_view which extracts just those relations that are permissions.    

With a userId the permissions_view can be searched and the permissions granted to that user can be collected.  

The complication is that some permissions may be vicarious. User ‘John’ may have permissions by way of being in a group that has cascading permissions (being part of that group may mean inheriting those rights). Therefore, some iterative searching is required.

Having iteratively searched the permissions_view, the permissions are assembled from what may be several permission molecules or even permission atoms. 

The final part in defining the granted permission is to examine the appro at the end of the relation.



The node-edge relationship system called ‘appros’ where  [appro_is] -- [relationship] -- [of_appro ] assigns permission sets over the [of_appro], where [of_appro] can be anything within the system.

The of_appro sets the limit of the permission by for example being the appro of a specific survey. In this case whatever the permissions were they only apply to survey with id== the appro survey_header_id


🎨 Creating a permission and turning into a machine readable form (The Slow Process)
The complex process of creating parsing and storing permissions is done once during creation of the permission which is the system's core caching strategy.
 
 Syntax Construction (UX)
Admin selects permissions via sequential dropdowns/lists. With forced syntax.  Limits choices based on structure of the involved tables
 
 Visual Feedback 
The UI shows permissions being removed (faded out).  Visually subtracts atomic permissions to clarify the narrowing scope, improving administrative safety. Could be color coded to the sections of the relationship syntax  SUBJECT@ - one color MAJOR-RESOURCE - other color
 
 Parsing at Definition
The full path string (e.g., EDITOR@surveys#questions) is saved and immediately parsed. Some default values will already exist in a table, others can be added as invented. This is to speed-up processing of often used compound permissions.  javascript writes to a table that stores the molecule for fast access


📜  The Permission Syntax
All authority is in structured syntax, stored in the permissions_molecules table with a fk link from the relationship in the relationships table. (All relationships are constrained to be unique in name. Permission relationships also have unique syntax & only these can be used to relate permissions):

Appro_is -> relationship -> of_appro
Where relationship indicates that it is a PERMISSION relationship by having a name beginning and ending with double curly braces {{   followed by UPPER CASE for the overall role such as EDITOR, followed by the separator '@' followed by the major group of resources it covers such as ‘TASKS’ or ‘SURVEYS’ again in UPPER CASE. -??? Or is this the table name in lower case & with underscores such as task_header  ?  NOT SURE  ???????  (NEEDS MORE ANALYSIS & PLANNING)

If the permission is to be restricted to a specific part this is shown after the separator # and specifies (in lower case) the specific resource to be limited to such as ‘automations’ 

The @MAJOR-RESOURCE is a restriction of scope, but contains every subgroup. (The permission cascades down & includes all lower levels)

The  #restricted resource also restricts the permission but excludes subgroups. (Therefore @SURVEYS#quesions  is giving permission only for survey questions, not answers or automations.)

  {{ ROLE @ table_name # restricted to this column }}  

can the part after the '@' be uppercase?  table_names are always lower case. But can we use UPPER CASE for generic resource such as TASKS ?  


Permission on the left cascades down.

EDITOR without any further references applies to all sections

EDITOR @ TASKS breaches the syntax explained elsewhere
EDITOR_TASKS  would be more in line with syntax. 

EDITOR@TASKS#automations syntax error no such column
EDITOR@automations   would be for the table 'automations'  ('automations isn't a column)

EDITOR@SURVEYS#questions syntax error 'SURVEYS' isn't a tableName,
EDITOR@questions fits sysntax

Role (e.g., EDITOR, ADMIN, READER): The broad capability being granted.
'@' Separator: Followed by LIMIT of scope which cascades to lower scope
'#' Separator: Followed by LIMIT of scope which does not cascade to lower scope

The following are not atoms and therefore not allowed
INSERT@TASK#description#name,  (not atomic as there is no db thing called TASK)  ?  INSERT@TASK_HEADER#description,name? (still not atomic as the columns are a combination)

These are atomic:
INSERT@task_header#description
INSERT@task_header#name


Anything to the right of # is a restriction to that specific item

In addition when this relationship is applied it has a subject (the person being granted the permissions - the appro_is) and an object (the of_appro).  The role is specific to the of_appro.  If the of_appro is a task, then the permission is only relevant to that single task.

The of_appro could be ‘All tasks’ or ‘All surveys’ or ‘The App’ etc. These have to be appros known to the functions as having specific meaning. Relating to a new or arbitrary appro will be rejected.

To ensure that permissions are clearly visible and to avoid confusion with other appro relations, the relationships for permissions use restricted syntax and symbols to differentiate them.

Permissions relationships start and end with double curly braces {{   }}  and have enforced UPPERCASE and lowercase with enforced separators. Any relationship that does not parse will be treated as not granting permissions. Therefore if [John] IS [member] of [Admin], John does not get admin permissions. 

However, if a permission relationship were EDITOR@TASK which isn’t atomic we can manually convert that into atomic form. It may be possible to encode the method for automatic conversion.  This can be slowly generated at the time of inventing this role. It can then be stored as a TEXT array of the atoms (a molecule of permissions (a collection of atoms) )

This syntax and how to interpret it needs further study and testing.


⚡  Runtime Authorization (The Fast Gate)
The system relies on speed at the point of action.
Aggregation
On user login the page to be displayed is probably 'myDash' which will need to access the database to find the surveys, tasks & relations for this user. Therefore, we need to collect this user's permissions. (We may have standard default permissions that are assumed such that these initial database queries can be carried out without detailed checking of permissions)

At some point the actual permissions will need to be assembled. 

Recursive CTE: A PostgreSQL function traverses the appro_relations graph (handling groups and bundles) to aggregate all stored Atomic Permission Arrays into a single user_permissions_array. This is stored in the permission_user_cache

Function Metadata
The permision_molecule_required table holds the CRUD , tables and columns the function needs to access. That table holds the permission molecule for that function.

Comparison 
Fast array lookup compares the function permission molecule required with the atomic permissions cache for the user. All the required atoms have to be present in the user cache molecule.

🔄 5. Key System Features
Positive Permissions Only: The system avoids negative permissions (NOT...), relying on the path syntax to define the inclusion set.
Inheritance: Handled robustly by the Recursive CTE traversing custom AUTH_GRANT relationships.

Atomic Definitions: The atomic_permissions table provides a clear, auditable definition of every legal database action (CRUD@table_name#column_name), ensuring security consistency between the frontend guide and the backend gate.
The appro relations are used for more than permissions. 



Implementation

Data Structures, The Aggregation Function (The Translator/Recursion), and The Enforcement Layer (The Gate).
1. Data Structures (The Tables)
Tables to store the permission policies and the assignment cache:


2. The Aggregation Function (The Recursive CTE)
This is the most complex part, executed when the system needs to know all of a user's permissions. This logic is bundled into a single, high-performance PostgreSQL function.
Goal: Take a user_id and return a single, complete user_permissions_array (a flat list of all effective atomic permission strings).

A. The Recursive CTE (Graph Traversal)
The function uses a Recursive CTE (defined using WITH RECURSIVE) to handle inheritance:
Anchor Permissions: Finds all direct permissions granted to the user_id and all permission granting groups that grant permission to the user.
Recursion: Continuously joins back to the appro_relations table to find groups within groups (group:A is a permission receiver  from group:B), stopping only when no new permission granters are found.

Aggregation: During this traversal, the CTE joins to the permissions_molecules table to fetch the atomic_atoms_array (the cached TEXT[ ] column) for every assigned permission relationship.

B. The Final Output
The function uses PostgreSQL's array functions to efficiently flatten and combine all the retrieved atomic permission arrays into one single list of unique strings.


4. The Enforcement Layer (The Fast Gate)
This is the final security check, which must be executed instantly every time a user attempts a database operation.

A. The Security Function (The Gate)
A simple, fast function (e.g., check_user_permission(user_id, required_atom_string)) is defined:
It calls the Aggregation Function (or references a cache of its result).
It checks if the required_atom_string is present in the returned user_permissions_array.
It returns TRUE or FALSE.

B. Row-Level Security (RLS)
This is the security mechanism that uses the function above:
Apply RLS policies directly to the data tables (e.g., task_headers, survey_questions).
The RLS policy uses the security function to enforce access before any data is returned or modified.
Example RLS Policy on survey_headers:
CREATE OR REPLACE POLICY survey ON survey_headers FOR ALL USING ( check_user_permission(current_user_id()) );    --??????
Identical rule on every table subject to user access.  Exact wording to be designed. 

This ensures that the security check is run for every single query, and it cannot be bypassed by client-side code.

The first check would be if (!isAuthenticated_user) return denied. 
 The permissions_molecules table is an intermediate store. 

When a permission structure is first defined with EDITOR_SURVEYS@survey_headers (This is prior to anyone being assigned this role/relationship, the code is converted into the collection of permission atoms and stored in the permissions_molecules table. 

Then when this relationship is applied to a person and a target object, the relationship does not need to be parsed because that stage was done at the moment of creation of the relationship. Instead the rows in the permission_molecules can be read into an array. This set of permission atoms is then assigned to whatever of_appro it is connected to.

This breaks the processing into different stages.

Define a relationship (without specifying who or over what), parse and store so now it is just a look-up when handling the stage of Subject - that relationship - object.


All tasks & surveys have an auto-generated appro which has the task or survey id. Therefore if the permission has been set as appro_is → permission_relationship -> of_appro(task) then we refer to this if userId==appro_is , relationship if of type ‘permissions’ and of_appro has an id.  Does the row id == appro id ?
But if the appro is just an abstract ‘All Tasks’ name with its own appro ID, how does the db make use of that?
Does the db function have codified certain standard appro names?  “All”  “All Tasks” “All Surveys” “All (some new invention) ?”  Or is it related to the RLS permissions which we name the same as those apropos? An “All” rule, an “All_tasks” rule ? 
(NEEDS FURTHER ANALYSIS & PLAN)

----end------
