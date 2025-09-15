//   ./ui/toast.js

console.log('toast.js loaded');


export function showToast(message, type = 'info', duration = 3000) {
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
  