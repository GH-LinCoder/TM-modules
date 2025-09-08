To be put into the handleAdminClicks  ??


  function handleDashboardClick(query) {
  const { section, action } = query;
  const mutation = MutateRegistry[section]?.[action];

  if (mutation) {
    mutateDashboardSection(section, mutation);
  } else {
    loadModuleFromRegistry(action);// this needs to be as is
  }
}

/*
dashboardMutationRegistry[section] tries to access the object for the given section (e.g. 'task-&-member').

The ?. is the optional chaining operator — it checks if the left-hand side exists before trying to access the next level.

[action] then tries to access the mutation config for that specific action (e.g. 'member-management').

What the registry returns is the part of the object following  section.action {  which is the title for the section and the definitions of the cards}

  */
