import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

// Validation schema using Yup
const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const [error, setError] = useState(null);

  // Using Formik to manage form state and validation
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        // Send the login request
        const res = await axios.post('http://localhost:5001/api/auth/login', {
          email: values.email,
          password: values.password,
        });

        // Store the JWT token in localStorage
        const token = res.data.token;
        localStorage.setItem('auth-token', token);
        console.log('Token stored:', token);

        // Decode the token to get user information
        const user = jwtDecode(token);
        console.log('Decoded User:', user);

        // Store user information in localStorage
        localStorage.setItem('user-id', user._id);
        localStorage.setItem('user-email', values.email);
        localStorage.setItem('user-type', user.userType);

        // Notify user of successful login
        alert('Logged in successfully!');

        // Redirect based on user type
        setTimeout(() => {
          if (user.userType === 'admin') {
            window.location.href = '/adminHomePage';
          } else if (user.userType === 'manufacturer') {
            window.location.href = '/manufacturerHomePage';
          } else if (user.userType === 'seller') {
            window.location.href = '/sellerHomePage';
          } else {
            window.location.href = '/userHomePage';
          }
        }, 1000);

      } catch (err) {
        console.error('Login error:', err);

        if (err.response && err.response.status === 403) {
          setError('Your account is inactive. Please contact support.');
        } else if (err.response && err.response.status === 404) {
          setError('User not found. Please check your email or register.');
        } else if (err.response && err.response.status === 400) {
          setError('Wrong password. Please try again.');
        } else {
          setError('Login failed. Please check your email or password.');
        }
      }
    },
  });

  // Google Login handler
  const responseGoogle = async (credentialResponse) => {
    const { credential } = credentialResponse;
    console.log('Sending Google ID Token:', { idToken: credential });

    try {
      const res = await axios.post('http://localhost:5001/api/auth/google/login', {
        idToken: credential,
      });
      console.log('Google login response:', res.data);

      const { token, userType, message } = res.data;

      if (!token || !userType) {
        throw new Error('User data is incomplete or missing userType.');
      }

      // Store the token and user information in localStorage
      localStorage.setItem('auth-token', token);
      console.log('Stored auth token:', token);

      const decodedUser = jwtDecode(token);
      console.log('Decoded User:', decodedUser);

      localStorage.setItem('user-email', decodedUser.email);
      localStorage.setItem('user-type', userType); // Ensure `userType` is set

      // Redirect the user based on their type
      redirectUser(userType);

      alert('Logged in successfully with Google!');
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed! Please try again.');
    }
  };

  // Redirect user based on their role
  const redirectUser = (userType) => {
    switch (userType) {
      case 'admin':
        window.location.href = '/adminHomePage';
        break;
      case 'seller':
        window.location.href = '/sellerHomePage';
        break;
      case 'manufacturer':
        window.location.href = '/manufacturerHomePage';
        break;
      default:
        window.location.href = '/userHomePage';
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.email && formik.errors.email && (
              <p className="error-message">{formik.errors.email}</p>
            )}
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.password && formik.errors.password && (
              <p className="error-message">{formik.errors.password}</p>
            )}
          </div>
          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {/* Google Login Button */}
        <GoogleLogin
          onSuccess={responseGoogle}
          onFailure={(error) => {
            console.error('Google login failed:', error);
            setError('Google login failed! Please try again.');
          }}
          style={{ marginTop: '20px' }}
        />
      </div>
    </div>
  );
};

export default Login;
