747 words - the older version was entered into the app as a task "CODE The project - a technical brief"
Technical Brief: [Project myOrg]. Updated 15:30 Sept 6 2026

0. The Human Philosophy (The "Why")

Purpose: A web app that is "An Operating System for an organization." 
A platform to encourage and facilitate the building & management of new organizations from volunteers who share in the management. 

Values: Participation. Surveys, tasks, and messaging are designed to make every part-time volunteer feel like a vital member of the group. 

What it is not.
It isn't Discord or X or Facebook or Trello or Monday.com or click-up. It isn't for professional full time workers who have specific tasks and existing organised structure.

Engagement Engine: The app provides "The Next Interesting Action." and a reason to recruit others. It encourages participation, learning how the system works and taking on the management of the organisation.

Goal: To allow humans who have a shared interest, but no means of action, to turn into an organised group that self manages.


1. The Core Architecture

    Stack: Vanilla JS, Vite, Tailwind, Supabase (Postgres).

    Scale: 50k LOC, 3k hours. High complexity, generic engine-based design.

    State & Navigation: Single-page app driven by a "Petition" system. This is a short set of data attributes that indicate what Module & which Section of that module is sending the request, what Action it wants to have happen, and where the Destination is for the html to be injected.

        Listener: Intercepts clicks, reads data-** attributes.

        Dispatcher: Updates appState, checks a registry, and executes render(userId, payload).

        Module Injection: Standardized export functions for UI/logic injection.

        Click → Petition → appState → state-change → flexmain → registryLoadModule → module.render()


2. The Data Model: "Appros"

    Definition: Every entity (Human, Task, Survey, Group, Abstract Concept) has an Appro (Profile). An Appro is a universal identity object representing any entity in the system — human, task, survey, group, or abstract concept.

    Relations: A node-edge map connecting Appros to define the organization's structure.

    Visualization (Noun/Verb/Rule/Work):

        Noun: Identity relations (John is a member of Team X).

        Verb: Active assignments (Mary is assigned to Task Y).

        Rule: Permissions/Bundles (John has bundled Permissions Z).

        Work: Automation logic (Task A spawns Survey B). - not yet implemented

3. Automation & Logic Engine

    Components: Tasks: Multi-step workflows that can trigger predetermined code such as spawning another task or survey

    Surveys: Data collection points that can trigger predetermined code such as spawning another task or survey

    Execution: Actions are triggered by user interaction (answering a survey/completing a step).

    Database Spawning: Automation calls RPC functions in the DB. Logic is executed server-side via Postgres to ensure integrity.

4. Security & Permissions

    Dual-Layer System:

        System Actions (permission_judge): Security-definer functions that validate request context (User + Appro + Task + Step) regardless of user-level permissions.

        User Actions (is_permitted): RLS-backed checks against a lookup table. Accessed via JS executeIfPermitted().

    Granularity: Permissions are function-specific (e.g., readTaskHeader_SELECT)but can be bundled.

    Bundles: Sets of granular permissions grouped into an "Appro Bundle" for easier administration. Bundles are stored as a bundle for admin reference, and as flattened content at creation into the permission_relations table for read-time performance.

5. Messaging & Knowledge

    Notes/Messaging: Integrated module allowing for categorized tagging and filtered publication. Tags are the primary metadata for search and discovery. Also for bug reports.

6. Development Status & Current Focus

    Status: MVP reached. App deployed. One external user. 

    Current Milestone: Built bundled Permission system. Connected to payment processors. Built task & survey display and ability to self assign from all available tasks & surveys. Created referral system for users to recruit others and to track marketing effectiveness.   

    Next Tasks: 

STUDENT MANAGEMENT
Complete the `move student` system using request buttons on displayOneTask and the kanban style display of `moveStudentManager`

NEW SYSTEMS
Trust-security rating all participants on 'trust' and all resources on 'security'
Revert system that allows rollback to earlier state for all important tables
4 eyes workflow where every action by anyone is subject to review and possible rollback by someone else


BUNDLES
 Testing the bundles actually grant the needed permissions and no more than needed. 
 Classifying all work tasks as bundles of permissions.
 Simplifying the grant and management of permissions

SUPERSTRUCTURE
Build more 'superstructure' the tasks and surveys that funnel site visitors into automated categories and subsequent automated tasks and further surveys.

CUSTOMERS
Attract potential customers to experience the app. They see how it automates onboarding and how the customer could benefit from having their own instance of the app.  


Detailed ai instructions are available in `copilot-instructions.md`