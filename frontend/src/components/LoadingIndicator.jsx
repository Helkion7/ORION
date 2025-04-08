import { useState, useEffect } from "react";

/**
 * A Windows 98 style loading indicator
 * @param {Object} props Component props
 * @param {string} props.message - The loading message to display
 * @param {boolean} props.indeterminate - Whether the progress bar should be indeterminate
 * @param {number} props.value - The current progress value (0-100)
 * @param {boolean} props.segmented - Whether to use a segmented progress bar
 * @param {boolean} props.showSpinner - Whether to show a loading spinner icon
 */
const LoadingIndicator = ({
  message = "Loading...",
  indeterminate = true,
  value = 0,
  segmented = false,
  showSpinner = false,
}) => {
  const [progress, setProgress] = useState(indeterminate ? 40 : value);

  // Animate the progress bar if indeterminate
  useEffect(() => {
    if (!indeterminate) {
      setProgress(value);
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        // Move between 10% and 90%
        const newValue = prev + 2;
        if (newValue > 90) return 10;
        return newValue;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [indeterminate, value]);

  const progressBarClass = segmented
    ? "progress-indicator segmented"
    : "progress-indicator";

  return (
    <div className="loading-container">
      {showSpinner && (
        <div className="loading-spinner">
          <img
            src="https://i.imgur.com/q5MFFy0.png"
            alt="Loading"
            className="loading-icon"
          />
        </div>
      )}
      <div className={progressBarClass}>
        <span
          className="progress-indicator-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;
