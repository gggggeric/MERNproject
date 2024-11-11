import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import './Register.css';

// Validation schema using Yup
const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    profileImage: Yup.mixed().required('Profile image is required').nullable(),
});

const Register = () => {
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            profileImage: null,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setError(null);
            setSuccessMessage(null);

            const formData = new FormData();
            formData.append('email', values.email);
            formData.append('password', values.password);
            formData.append('userType', 'user'); // Default userType

            if (values.profileImage) {
                formData.append('profileImage', values.profileImage); // Append profile image if it's selected
            }

            try {
                const res = await axios.post('http://localhost:5001/api/auth/register', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setSuccessMessage(res.data.message);
                formik.resetForm(); // Reset form after successful registration
            } catch (err) {
                setError(err.response?.data?.message || 'Registration failed!');
            }
        },
    });

    return (
        <div className="page-container">
            <div className="form-container">
                <h2>Register</h2>
                <form onSubmit={formik.handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            required
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <p className="error-message">{formik.errors.email}</p>
                        ) : null}
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            required
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <p className="error-message">{formik.errors.password}</p>
                        ) : null}
                    </div>

                    {/* Profile Image Input */}
                    <div className="form-group">
                        <label>Profile Picture:</label>
                        <input
                            type="file"
                            name="profileImage"
                            accept="image/*"
                            onChange={(e) => formik.setFieldValue('profileImage', e.target.files[0])}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.profileImage && formik.errors.profileImage ? (
                            <p className="error-message">{formik.errors.profileImage}</p>
                        ) : null}
                    </div>

                    <button type="submit" className="submit-btn">
                        Register
                    </button>
                </form>

                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Register;
