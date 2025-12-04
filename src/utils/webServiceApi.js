/**
 * API utility for fetching data from web services via secure backend proxy
 * Headers and API keys are never exposed to the frontend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-e8736.up.railway.app';

/**
 * Fetch data from a web service via the secure backend proxy
 * @param {string} webServiceId - The unique web service ID
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function fetchWebServiceData(webServiceId) {
  try {
    if (!webServiceId) {
      throw new Error('Web service ID is required');
    }

    const response = await fetch(`${API_URL}/api/web-services/${webServiceId}/fetch`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch web service data';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // If response isn't JSON, use status text
        errorMessage = response.statusText || `HTTP ${response.status}`;
      }

      // Provide user-friendly error messages based on status code
      if (response.status === 404) {
        errorMessage = 'Web service not found. Please check your configuration.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid web service configuration.';
      } else if (response.status >= 500) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error.message && error.status) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Web service fetch error:', error);
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    
    console.error('Web service fetch error:', error);
    throw error;
  }
}

