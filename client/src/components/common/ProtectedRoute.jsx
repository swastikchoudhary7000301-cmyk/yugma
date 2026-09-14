import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const location = useLocation();

  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="route-loading">
        <div className="route-loading-card">
          <div className="route-loading-logo">
            Y
          </div>

          <div className="route-loading-spinner" />

          <h2>Loading Yugma...</h2>

          <p>
            Preparing your professional
            network.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;