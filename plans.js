//  ./plans.js

import { executeIfPermitted } from "./registry/executeIfPermitted";


console.log('plans.js loaded');


// plans appro id fab5776c-d7e9-4d2a-b52e-85b19ba9ae53
//aims appro id ada3685a-7f9d-4cfd-b96f-8272e12e468e
export function render(panel, petition = {}) {
    console.log('plans Render(', panel, petition, ')');
    readAppro(panel)


     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
    panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}</p>`;
}

async function readAppro(panel)
{ const aimsApproId = 'fab5776c-d7e9-4d2a-b52e-85b19ba9ae53';
const plansAppro = await executeIfPermitted(null, 'readApprofileById',{approfileId: aimsApproId});
console.log('plansAppro',plansAppro);


panel.innerHTML =        `<div class="rounded-lg p-6 shadow-md border relative  whitespace-pre-line"> ${plansAppro.description}</div>
<div class="rounded-lg p-6 shadow-md border relative  whitespace-pre-line"><i>If you were using the app to create and manage your own organisation. You would edit this plan by editing the appro that stores this description: "Plans of the Organisation" with id: fab5776c-d7e9-4d2a-b52e-85b19ba9ae53</i></div>`

    panel.innerHTML += getTemplateHTML();

}


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `<style>

  h1, h2, h3 {
    color: #004080;
  }
  code {
    background: #f4f4f4;
    padding: 2px 6px;
    border-radius: 4px;
  }
  blockquote {
    border-left: 3px solid #ccc;
    padding-left: 1rem;
    color: #555;
    margin: 1rem 0;
  }
  .section {
    margin-bottom: 2rem;
  }
p{
padding: 0.75rem 1.25rem;
}
  .relationship-flow {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2rem auto;
    gap: 1rem;
  }

  .flow-box {
    padding: 0.75rem 1.25rem;
    background-color: #d7dde4;
    border: 2px solid #004080;
    border-radius: 6px;
    font-weight: bold;
    text-align: center;
    
    color: #004080;
  }

  .arrow {
    font-size: 1.5rem;
    color: #666;
  }

  .task-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
    border: 2px solid #004080;
    border-radius: 8px;
    background-color: #e6f0ff;
  }

  .task-header {
    font-weight: bold;
    color: #004080;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .meta-label {
    font-size: 0.75rem;
    color: #666;
    margin-bottom: 0.25rem;
  }

  .step-group {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .step-box {
    flex: 1;
    min-width: 100px;
    background-color: #f9fcff;
    border: 1.5px solid #004080;
    border-radius: 6px;
    padding: 0.5rem;
    text-align: center;
  }

  .step-title {
    font-weight: bold;
    color: #004080;
    margin-bottom: 0.25rem;
  }

  .meta-label-small {
    font-size: 0.65rem;
    color: #888;
  }

  .step-box.ghost {
    background-color: #f0f0f0;
    border-style: dashed;
    color: #999;
  }
</style>
<div class="section">
  <h1>System Philosophy</h1>
</div>
<div class="section">
  <h2>From abstract thoughts to data base tables</h2>
<p>The T&M app is part of a suite of software to build organisations.</p>
<lu><b>
<li>Hierarchy</li>
<li>task management</li>
<li>Knowledge</li>
<li>Communications</li>
<li>Memberships</li>
</b></lu>


  <p>We have three categories called <i>Persons</i>, <i>Tracking</i>, and <i>Bridging.</i></p>
  <p>'Persons' have as their core data structure the 'approfile' (app profile). 'Tracking' has as its core data structure 'tasks' and the linked sub-structure 'steps'. Bridging has as its core data structure 'task_assignments'.</p>
  <p>So on one side we have persons, on the other side we have tracking and what links them is bridging.</p>
</div>

<div class="section">
  <h2>Relationship Flow</h2>
  <div class="relationship-flow">
    <div class="flow-box">Persons</div>
    <div class="arrow">→</div>
    <div class="flow-box">Bridging</div>
    <div class="arrow">→</div>
    <div class="flow-box">Tracking</div>
  </div>
</div>  

<div class="section">
  <p>Persons are represented by approfiles. When a person gets bridged to tracking they are linked. As an example an 'approfile' is linked via 'task_assignments' to a 'task'.</p>

  <div class="relationship-flow">
    <div class="flow-box">Approfile</div>
    <div class="arrow">→</div>
    <div class="flow-box">Assignment</div>
    <div class="arrow">→</div>
    <div class="flow-box">Task</div>
  </div>
</div>  

<div class="section">
  <h2>From abstract thoughts to abstract approfiles</h2>
  <p>This is where it gets weird. Persons are represented by approfiles, but groups can also be represented by approfiles. When a group gets bridged to tracking they are linked in the same way as a person. As an example an 'approfile' for a group can also be linked via 'task_assignments' to a 'task'.</p>
<p> A group is an example of an abstract profile, no longer limited to representing a human being or even a group of humans. An abstract approfile can represent a webpage or an essay or a youTube channel.
</p>
<p>Any abstract approfile, whether a group or a webpage, like any human represented by an approfile, can be assigned to a task.</p>
<p>It is weird to be able to assign a webpage to a task, it is even weirder that we then refer to the webpage as the 'student', but bear with it.</p>
  <div class="relationship-flow">
    <div class="flow-box">Abstract Approfile</div>
    <div class="arrow">→</div>
    <div class="flow-box">Assignment</div>
    <div class="arrow">→</div>
    <div class="flow-box">Task</div>
  </div>
</div>  

<div class="section">
  <p>In the process of assignment we bring into existence a category 'student' we may also bring into existence the category 'manager'. These may be fleeting categories. It is easy to understand the category of 'student' if the task is a training course.
  The person being trained is the student, and the person responsible for grading the student is the manager.</p>
  <p>But the system allows an abstract idea, such as a planned party or an, as yet, unwritten essay, to be assigned to a task, and we continue to use the term 'student' for the approfile representing the abstract idea.</p>
<p>It is important to understand that a 'task' can be a training course, or it can be a record of an external training course, but it can also be step by step instructions on how to create a webpage or a system to track the progress of some entirely external process.</p>
  <p>Inside 'tracking' we have two closely related data types 'tasks' and 'steps'. Steps are a sub category of tasks. Steps cannot exist alone. Tasks always have at least 3 steps.</p>


  <div class="task-container">
    <div class="task-header">Task</div>
    <div class="meta-label">name</div>
    <div class="meta-label">description</div>
    <div class="step-group">
      <div class="step-box">
        <div class="step-title">Abandoned</div>
        <div class="meta-label-small">name</div>
        <div class="meta-label-small">description</div>
      </div>
      <div class="step-box">
        <div class="step-title">Completed</div>
        <div class="meta-label-small">name</div>
        <div class="meta-label-small">description</div>
      </div>
    </div>
  </div>
</div>

  <h2>From abstract thoughts to relationships between abstract thoughts</h2>

  <p>In addition to being able to place any approfile on a task, approfiles can also be related to each other</p>
  <p>Relations or relationships are a powerful tool in building hierarchy and management. Any approfile can be related to any other approfile</p>


  <div class="relationship-flow">
    <div class="flow-box">This Approfile is</div>
    <div class="arrow">→</div>
    <div class="flow-box">relationship</div>
    <div class="arrow">→</div>
    <div class="flow-box">of this approfile</div>
  </div>
</div>  


  <div class="task-container">
    <div class="task-header">Subsidiary</div>
    <div class="meta-label">The relationship binding the two approfiles together</div>
    <div class="meta-label">The first approfile belongs to the second as a subsidiary of the second</div>
    <div class="step-group">
      <div class="step-box">
        <div class="step-title">Approfile_is</div>
        <div class="meta-label-small">The first approfile</div>
        <div class="meta-label-small">Read this as the approfile which is...</div>
      </div>
      <div class="step-box">
        <div class="step-title">of_approfile</div>
        <div class="meta-label-small">The second Approfile</div>
        <div class="meta-label-small">Read the relationship and then 'of' this second approfile </div>
      </div>
    </div>
  </div>
</div>

<h2>Any approfile can be assigned or related</h2>
<p>An approfile can be related to any other approfile via the relationship system, the approfile can also be assigned to a task via the assignments system.
</p><p>Tasks all have approfiles and so tasks can also be related to other tasks or to humans or to groups. Relating a task to a person is different to assigning that person to the task.</p>
<p>Tasks can be related, via the relationship system to other tasks. In this way tasks can be grouped or mutually exclusive or successors/predecesors of othe tasks.</p>
<p>Relating a task to an abstract approfile such as a group or a webpage, allows the user to quickly find all tasks related to a particular project.</p>
<p>The approfile relation system also makes it easy to find all the humans involved in a group of human or in a group of tasks.</p>
<p>The approfile relationship system is a powerful tool in building the organisation and in organising.</p>
`}


//petitioner

// is passed when the adminListeners() function calls appState.setQuery({callerContext: action});
//it has to be called prior to passing it in the query{} object when we call this module
//in adminListeners.js, when we call appState.setQuery(), we need to have added petitioner: petition
//then we can access it here in the render() function
//we can also add a default value of 'unknown' if it is not passed
//so we can see where we are when we open the a new page

//the call here isn't from adminListeners it is from the menu button in the dashboard
//so we need to also assign petitioner: {Module:'dashboard', Section:'menu', Action:'howTo'} when we call this module from the menu button
//we can do this in the dashboardListeners.js file
//we can also add a default value of 'unknown' if it is not passed