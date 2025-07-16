import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import TaskManager from './components/Tasks/TaskManager';

// Define API base URL here (hardcoded or import from config.js)
const API_BASE = 'http://localhost:5217';

const AuthContext = React.createContext(null);
export const useAuth = () => React.useContext(AuthContext);

function RequireAuth() {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

function RedirectIfAuth() {
  const { currentUser } = useAuth();
  if (currentUser) {
    return <Navigate to="/tasks" replace />;
  }
  return <Outlet />;
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<RedirectIfAuth />}>
            <Route path="/login" element={<Login apiBase={API_BASE} />} />
            <Route path="/signup" element={<SignUp apiBase={API_BASE} />} />
          </Route>

          {/* Protected routes */}
          <Route element={<RequireAuth />}>
            <Route path="/tasks/*" element={<TaskManager apiBase={API_BASE} />} />
          </Route>

          {/* Redirect root */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate to="/tasks" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
