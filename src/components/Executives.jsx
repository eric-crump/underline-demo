"use client";
import { useState, useEffect } from "react";
import { fetchWebServiceData } from "@/utils/webServiceApi";

/**
 * Web Service Data Component
 * Fetches and displays data from a web service endpoint via secure backend proxy
 * Headers and API keys are never exposed to the frontend - handled securely server-side
 * 
 * @param {Object} props.executivesData - Web service configuration from Contentstack
 * @param {string} props.executivesData.webServiceId - Web service ID (used to fetch config server-side)
 * @param {string} props.executivesData.componentKey - Component key identifier
 */
export default function Executives({ executivesData }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExecutives = async () => {
      // Handle missing or invalid executivesData gracefully
      if (!executivesData) {
        setError("No web service configuration found");
        setLoading(false);
        return;
      }

      if (!executivesData.webServiceId) {
        setError("Web service not configured. Please select a web service in Contentstack.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch via secure backend proxy - headers/keys handled server-side
        const response = await fetchWebServiceData(executivesData.webServiceId);

        // Handle response format
        if (response && response.success && response.data) {
          const data = response.data;

          // Handle different response formats
          if (data.success && Array.isArray(data.data)) {
            setData(data.data);
          } else if (Array.isArray(data)) {
            setData(data);
          } else if (data.data && Array.isArray(data.data)) {
            setData(data.data);
          } else {
            // If data exists but isn't in expected format, try to extract array
            const possibleArray = data.data || data;
            if (Array.isArray(possibleArray)) {
              setData(possibleArray);
            } else {
              console.warn('Unexpected response format:', data);
              setError("Received data in an unexpected format");
            }
          }
        } else {
          console.warn('Invalid response format:', response);
          setError("Invalid response from server");
        }
      } catch (err) {
        console.error('Error fetching web service data:', err);
        // Use the error message from the API utility, or provide a fallback
        const errorMessage = err.message || 'Failed to load data. Please check your web service configuration.';
        setError(errorMessage);
        // Ensure we always set loading to false, even on error
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutives();
  }, [executivesData]);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="container mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-semibold mb-1">Unable to Load Data</p>
            <p className="text-yellow-700 text-sm">{error}</p>
            <p className="text-yellow-600 text-xs mt-2">
              This section will not be displayed until the web service is properly configured.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="mb-8">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-center">No data found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {data.map((executive, index) => (
            <div
              key={executive.id || index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-3/4 w-full overflow-hidden bg-gray-100 relative">
                {executive.imageUrl ? (
                  <img
                    src={executive.imageUrl}
                    alt={executive.name}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-24 h-24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {executive.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {executive.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

