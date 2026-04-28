// ./ui/toast.js
console.log('toast.js loaded');

export function showToast(message, type = 'info', duration = 10000) {
  // Ensure a single container exists (fixed to viewport)
  let container = document.getElementById('toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: '140px',
      left: '50px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',  // Align toasts to right edge
      gap: '12px',  // Reasonable spacing
      zIndex: 9999,
      maxWidth: '800px',
      pointerEvents: 'none'  // Let clicks pass through container
    });
    document.body.appendChild(container);
  }

  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  toast.textContent = message;
  toast.style.pointerEvents = 'auto';  // Enable clicks on toast itself

  Object.assign(toast.style, {
    backgroundColor: {
      success: '#4CAF50',
      error: '#F44336',
      info: '#2196F3',
      warning: '#FF9800'
    }[type] || '#333',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontSize: '14px',
    opacity: '0',
    transform: 'translateX(20px)',  // Start slightly off-screen right
    transition: 'opacity 0.3s ease, transform 0.3s ease'
  });

  // Add to container
  container.appendChild(toast);

  // Fade in + slide in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';  // Slide out right
    setTimeout(() => {
      toast.remove();
      // Clean up container if empty
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, duration);
}