// src/components/SignUp/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../api'; // Import centralized fetch helper
import styles from './SignUp.module.css'; // Adjust the path as necessary

function SignUp({ apiBase }) { // apiBase prop is no longer needed directly due to apiFetch
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.target);
    const payload = {
      Name: formData.get('name'),
      Email: formData.get('email'),
      Password: formData.get('password'),
      Address: formData.get('address'),
      PhoneNumber: formData.get('phoneNumber'),
    };

    try {
      // Use apiFetch helper function
      const response = await apiFetch('/api/registration/userRegistration/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      e.target.reset();

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h2 className={styles.title}>Create Account</h2>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name" className={styles.label}>
          Full Name
          <input id="name" name="name" type="text" required disabled={loading} className={styles.input} />
        </label>
        <label htmlFor="email" className={styles.label}>
          Email
          <input id="email" name="email" type="email" required disabled={loading} className={styles.input} />
        </label>
        <label htmlFor="password" className={styles.label}>
          Password
          <input id="password" name="password" type="password" required disabled={loading} className={styles.input} />
        </label>
        <label htmlFor="address" className={styles.label}>
          Address
          <input id="address" name="address" type="text" required disabled={loading} className={styles.input} />
        </label>
        <label htmlFor="phoneNumber" className={styles.label}>
          Phone Number
          <input id="phoneNumber" name="phoneNumber" type="tel" required disabled={loading} className={styles.input} />
        </label>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Registering...' : 'Sign Up'}
        </button>
      </form>
      <p className={styles.switchText}>
        Already have an account?{' '}
        <Link to="/login" className={styles.switchLink}>
          Login
        </Link>
      </p>
    </div>
  );
}

export default SignUp;
