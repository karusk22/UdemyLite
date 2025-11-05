import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // This 'loading' state is the key to fixing the race condition.
  // It starts 'true' and becomes 'false' only after we've checked for a token.
  const [loading, setLoading] = useState(true);

  const setupUserFromToken = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      
      console.log("DECODED TOKEN:", decodedToken); // For debugging
      
      let role = 'STUDENT'; // Default role
      
      if (decodedToken.authorities) {
        if (Array.isArray(decodedToken.authorities) && decodedToken.authorities.length > 0) {
          role = decodedToken.authorities[0].replace('ROLE_', '');
        } else if (typeof decodedToken.authorities === 'string') {
          role = decodedToken.authorities.replace('ROLE_', '');
        }
      } else {
        console.warn("Could not find 'authorities' in token. Defaulting to STUDENT.");
      }

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser({ 
        token: token, 
        email: decodedToken.sub,
        role: role 
      });

    } catch (error) {
      console.error("Invalid token on setup:", error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setupUserFromToken(token);
    }
    // No matter what, we are done loading.
    setLoading(false); 
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token } = response.data;
      setupUserFromToken(token); 
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const getRole = () => {
    return user ? user.role : null;
  };

  const value = {
    user,
    login,
    register,
    logout,
    getRole,
    loading // We MUST export 'loading'
  };

  return (
    <AuthContext.Provider value={value}>
      {/* We only render children when not loading.
        An alternative is !loading && children, but this can cause flashes.
        A better pattern is used in CourseDetail.js to check the loading flag.
      */}
      {children}
    </AuthContext.Provider>
  );
};

