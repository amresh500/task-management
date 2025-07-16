// src/components/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../App';
import styles from './Login.module.css';

function Login({ apiBase }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const payload = {
      Email: formData.get('email'),
      Password: formData.get('password')
    };

    try {
      const response = await fetch(`${apiBase}/login/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }

      const data = await response.json();
      console.log('Login response:', data);

      // Assuming backend returns { token: "...", user: {...} }
      const { token } = data;

      if (!token) {
        throw new Error('Invalid login response: missing token or user data');
      }

      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(data));

      // Update auth context with user data
      login(data);

      // Navigate to protected tasks page
      navigate('/tasks');
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>Login</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email" className={styles.label}>
          Email
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={loading}
            className={styles.input}
            autoComplete="username"
          />
        </label>
        <label htmlFor="password" className={styles.label}>
          Password
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={loading}
            className={styles.input}
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className={styles.switchText}>
        Don't have an account?{' '}
        <Link to="/signup" className={styles.switchLink}>
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default Login;
