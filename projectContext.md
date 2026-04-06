486 words - this has been entered into the app as a task "CODE The project - a technical brief"
Technical Brief: [Project myOrg]

1. The Human Philosophy (The "Why")

Purpose: A web app that is "An Operating System for an organization." 
A platform to encourage and facilitate the building & management of new organizations from volunteers who share in the management. 

Values: Participation. Surveys, tasks, and messaging are designed to make every part-time volunteer feel like a vital member of the group. 

What it is not.
It isn't Discord or X or Facebook or Trello or Monday.com or click-up. It isn't for professional full time workers who have specific tasks and existing organised structure.

Engagement Engine: The app provides "The Next Interesting Action." and a reason to recruit others. It encourages participation, learning how the system works and taking on the management of the organisation.

Goal: To eliminate volunteer isolation, fragmentation and desertion. To allow humans who have a shared interest, but no means of action, to turn into an organised group that self manages.


1. The Core Architecture

    Stack: Vanilla JS, Vite, Tailwind, Supabase (Postgres).

    Scale: 50k LOC, 3k hours. High complexity, generic engine-based design.

    State & Navigation: Single-page app driven by a "Petition" system.

        Listener: Intercepts clicks, reads data-** attributes.

        Dispatcher: Updates appState, checks a registry, and executes render(userId, payload).

        Module Injection: Standardized export functions for UI/logic injection.

2. The Data Model: "Appros"

    Definition: Every entity (Human, Task, Survey, Group, Abstract Concept) has an Appro (Profile).

    Relations: A node-edge map connecting Appros to define the organization's structure.

    Visualization (Noun/Verb/Rule/Work):

        Noun: Identity relations (John is a member of Team X).

        Verb: Active assignments (Team X is assigned to Task Y).

        Rule: Permissions/Bundles (John has bundled Permissions Z).

        Work: Automation logic (Task A spawns Survey B).

3. Automation & Logic Engine

    Components: Tasks: Multi-step workflows that can trigger code and can spawn surveys

    Surveys: Data collection points that can trigger code and can interact with tasks.

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

    Status: MVP reached. App deployed. No external users. 

    Current Milestone: Building bundled Permission system.(March 31 2026)

    Next Tasks: 

BUNDLES
 Installing RLS rules on remaining unrestricted tables. DONE
 Testing the bundles actually grant the needed permissions and no more than needed. 
 Classifying all work tasks as bundles of permissions.

SUPERSTRUCTURE
Build more 'superstructure' the tasks and surveys that funnel site visitors into automated categories and subsequent automated tasks and further surveys.

CUSTOMERS
Attract potential customers to experience the app. They see how it automates onboarding and how the customer could benefit from having their own instance of the app.  
