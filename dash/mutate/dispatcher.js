To be put into the handleAdminClicks  ??


  function handleDashboardClick(query) {
  const { section, action } = query;
  const mutation = dashboardMutationRegistry[section]?.[action];

  if (mutation) {
    mutateDashboardSection(section, mutation);
  } else {
    loadModuleFromRegistry(action);
  }
}
