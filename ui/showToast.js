//   ./ui/toast.js

console.log('toast.js loaded');

export function showToast(message, type = 'info', duration = 10000) {
  // Ensure a container exists
  let container = document.getElementById('informationSection');//is this too low on the display?? Could put in summary area
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px', // spacing between toasts
      zIndex: 9999
    });
    document.body.appendChild(container);
  }

  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  toast.textContent = message;

  Object.assign(toast.style, {
    backgroundColor: {
      success: '#4CAF50',
      error: '#F44336',
      info: '#2196F3',
      warning: '#FF9800'
    }[type] || '#333',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '4px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    fontSize: '14px',
    opacity: '0',
    transition: 'opacity 0.3s ease'
  });

  // Add to container
  container.appendChild(toast);

  // Fade in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}



/*
export function showToast(message, type = 'info', duration = 10000) {
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;
  
    // Style the toast container
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: {
        success: '#4CAF50',
        error: '#F44336',
        info: '#2196F3',
        warning: '#FF9800'
      }[type] || '#333',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '4px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      zIndex: 9999,
      fontSize: '14px',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    });
  
    document.body.appendChild(toast);
  
    // Fade in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });
  
    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }
  */