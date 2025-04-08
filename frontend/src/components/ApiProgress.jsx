import { useState, useEffect } from "react";
import axios from "axios"; // Add missing import

/**
 * A component to show progress of API operations
 * This component can be placed in the layout to show overall API activity
 */
const ApiProgress = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    // Track API requests in progress
    const requestInterceptor = axios.interceptors.request.use((config) => {
      setRequestCount((prev) => prev + 1);
      setIsVisible(true);
      setProgress(30); // Start progress
      return config;
    });

    // Track API responses
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        setRequestCount((prev) => Math.max(0, prev - 1));
        setProgress(100); // Complete progress
        setTimeout(() => {
          if (requestCount <= 1) {
            setIsVisible(false);
          }
        }, 500);
        return response;
      },
      (error) => {
        setRequestCount((prev) => Math.max(0, prev - 1));
        setProgress(100); // Complete progress even on error
        setTimeout(() => {
          if (requestCount <= 1) {
            setIsVisible(false);
          }
        }, 500);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [requestCount]);

  if (!isVisible) return null;

  return (
    <div className="api-progress">
      <div className="progress-indicator">
        <span
          className="progress-indicator-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ApiProgress;
