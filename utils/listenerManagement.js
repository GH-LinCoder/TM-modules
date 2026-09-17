// ./utils/listenerManagement.js
export function createListenerController() {
  const controller = new AbortController();
  return controller;
}

export function addManagedListener(element, event, handler, controller, options = {}) {
  element.addEventListener(event, handler, { 
    ...options, 
    signal: controller.signal 
  });
}

export function removeListenersFromModule(controller) {
  if (controller) {
    controller.abort();
  }
}
