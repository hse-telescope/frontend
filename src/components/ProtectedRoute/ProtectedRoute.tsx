
import React, { useEffect, useState } from "react";
// import { BrowserRouter as Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    // const navigate = useNavigate();
  
    useEffect(() => {
      const checkAuth = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setIsAuthenticated(false);
          return;
        }
  
        try {
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
        }
      };
  
      checkAuth();
    }, []);
  
    if (isAuthenticated === null) {
      return <div>Loading...</div>;
    }
  
    // if (!isAuthenticated) {
    //   return <Navigate to="/auth" replace />;
    // }
  
    return <>{children}</>;
  };
  
  export default ProtectedRoute;