import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl">404 - Page Not Found</h1>
      <Link to="/" className="text-yellow-400 mt-4 inline-block">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
