/**
 * API utility for form submission to the Groundwork backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-e8736.up.railway.app';

/**
 * Submit form data to the backend API
 * @param {string} formId - The unique form ID
 * @param {Record<string, any>} data - Form field values mapped to their field names
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitForm(formId, data) {
  try {
    const response = await fetch(`${API_URL}/api/forms/${formId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Submission failed' }));
      throw new Error(error.error || 'Failed to submit form');
    }

    return response.json();
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}

/**
 * Check API health
 * @returns {Promise<{status: string, timestamp: string}>}
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    return response.json();
  } catch (error) {
    console.error('API health check error:', error);
    throw error;
  }
}

