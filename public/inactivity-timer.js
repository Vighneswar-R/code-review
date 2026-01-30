const inactivityTimeout = 15 * 60 * 1000; // 15 minutes in milliseconds
let inactivityTimer;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(logout, inactivityTimeout);
};

const logout = () => {
  window.location.replace('/');
  console.log('User logged out due to inactivity');
};

const handleUserActivity = () => {
  resetInactivityTimer();
};

document.addEventListener('mousemove', handleUserActivity);
document.addEventListener('keydown', handleUserActivity);

// Start the inactivity timer when the page loads
resetInactivityTimer();
