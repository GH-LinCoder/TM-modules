db-petition- listeners- stacking


//appState.dbQueue — Array of Pending Petitions

// Initialize
appState.dbQueue = []; // Array of { id, action, payload, requester, timestamp }

// When a module wants data:
function requestFromDB(action, payload = {}, requester) {
  const petition = {
    id: Date.now() + Math.random().toString(36).substr(2, 9), // unique ID
    action,
    payload,
    requester,
    timestamp: Date.now()
  };

  appState.dbQueue.push(petition);
}

////////////


//Listener: Process Queue (One at a Time)

let isProcessing = false;

async function processDbQueue() {
  if (isProcessing || appState.dbQueue.length === 0) return;

  isProcessing = true;
  const petition = appState.dbQueue.shift(); // take first

  try {
    const result = await dbCentral.handleRequest(petition);

    // Deliver result to requester
    appState.dbResponses = appState.dbResponses || {};
    appState.dbResponses[petition.id] = {
      data: result,
      error: null,
      forRequester: petition.requester,
      petitionId: petition.id
    };

  } catch (error) {
    appState.dbResponses = appState.dbResponses || {};
    appState.dbResponses[petition.id] = {
      data: null,
      error: error.message,
      forRequester: petition.requester,
      petitionId: petition.id
    };
  } finally {
    isProcessing = false;
    // Process next (if any)
    setTimeout(processDbQueue, 0);
  }
}

// Trigger whenever queue changes
setInterval(() => {
  if (appState.dbQueue?.length > 0) {
    processDbQueue();
  }
}, 100);

//////////////

//How module receives response

// When requesting:
const myRequestId = Date.now() + '-task101';
requestFromDB('getTaskById', { id: 101 }, 'task-detail-module');

// Start listening for response
const checkResponse = () => {
  const response = appState.dbResponses?.[myRequestId];
  if (!response) {
    setTimeout(checkResponse, 100);
    return;
  }

  if (response.error) {
    showError(response.error);
  } else {
    renderTask(response.data);
  }

  // Optional: cleanup
  delete appState.dbResponses[myRequestId];
};

checkResponse();

//////////////

// clean-up  time-out

petition.timeout = 10000; // 10 seconds

// In processDbQueue:
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort();
  throw new Error("Request timeout");
}, petition.timeout);

try {
  const result = await dbCentral.handleRequest(petition, { signal: controller.signal });
  // ... handle success
} catch (error) {
  if (error.name === 'AbortError') {
    // handle timeout
  }
} finally {
  clearTimeout(timeoutId);
}
