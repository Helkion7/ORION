import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="window" style={{ width: "400px", margin: "50px auto" }}>
      <div className="title-bar">
        <div className="title-bar-text">Error</div>
        <div className="title-bar-controls">
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h2>Page Not Found</h2>
          <p>The page you are looking for does not exist.</p>
          <img
            src="https://i.imgur.com/q5MFFy0.png"
            alt="Error"
            style={{ width: "64px", margin: "20px" }}
          />
          <div className="button-row" style={{ justifyContent: "center" }}>
            <Link to="/">
              <button className="default">Return to Home</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
