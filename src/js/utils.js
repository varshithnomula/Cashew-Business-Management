// Utility functions for API interactions

// Show loading indicator on tables
function showLoading(tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center p-4"><div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div> Loading data...</td></tr>';
  }
}

// Show error in table
function showError(tableId, message) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-4 text-red-500">
      <svg class="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
      ${message}
    </td></tr>`;
  }
}

// Fetch with retry logic
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let retries = 0;
  
  // Set default options
  const defaultOptions = {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  // Merge options
  const fetchOptions = { ...defaultOptions, ...options };
  
  while (retries < maxRetries) {
    try {
      console.log(`Fetching ${url}, attempt ${retries + 1}/${maxRetries}`);
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) throw error;
      
      // Wait longer between each retry
      const delay = retries * 1000; // 1s, 2s, 3s...
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts`);
}

// Check server health
async function checkServerHealth() {
  try {
    // First try the health endpoint if it exists
    const response = await fetch('http://localhost:3000/api/health', { 
      method: 'GET',
      mode: 'cors',
      headers: { 'Accept': 'application/json' },
      // Short timeout to avoid long waiting
      signal: AbortSignal.timeout(2000)
    });
    
    if (!response.ok) throw new Error('API server health check failed');
    return true;
  } catch (healthError) {
    try {
      // If health endpoint fails, try the suppliers endpoint as fallback
      console.log('Health endpoint unavailable, trying alternative endpoint');
      const fallbackResponse = await fetch('http://localhost:3000/api/suppliers', {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(2000)
      });
      
      if (!fallbackResponse.ok) throw new Error('API server is down');
      return true;
    } catch (error) {
      console.error('Server connection issues:', error);
      showServerDownBanner();
      return false;
    }
  }
}

// Create server down banner
function showServerDownBanner() {
  // Remove existing banner if any
  const existingBanner = document.getElementById('server-down-banner');
  if (existingBanner) existingBanner.remove();
  
  // Create new banner
  const banner = document.createElement('div');
  banner.id = 'server-down-banner';
  banner.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50';
  banner.innerHTML = `
    <div class="flex items-center justify-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
      Server connection issue. Some features may be unavailable.
      <button onclick="this.parentNode.parentNode.remove()" class="ml-4 bg-white bg-opacity-20 px-2 py-1 rounded text-sm">Dismiss</button>
    </div>
  `;
  document.body.prepend(banner);
}

// Export utilities
window.appUtils = {
  showLoading,
  showError,
  fetchWithRetry,
  checkServerHealth,
  showServerDownBanner
}; 