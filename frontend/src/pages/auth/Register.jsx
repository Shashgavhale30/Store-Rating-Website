import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import InputField from '../../components/auth/InputField';
import PasswordInput from '../../components/auth/PasswordInput';
import authService from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'USER' // Default role
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  // Real-time validation logic
  const validateField = (name, value) => {
    let errorMsg = null;
    if (name === 'name') {
      if (!value) errorMsg = 'Name is required';
      else if (value.length < 20 || value.length > 60) errorMsg = 'Name must be 20-60 characters';
    }
    if (name === 'email') {
      if (!value) errorMsg = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(value)) errorMsg = 'Please enter a valid email';
    }
    if (name === 'address') {
      if (!value) errorMsg = 'Address is required';
      else if (value.length > 400) errorMsg = 'Address max 400 characters';
    }
    if (name === 'password') {
      const uppercaseRegex = /[A-Z]/;
      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (!value) errorMsg = 'Password is required';
      else if (value.length < 8 || value.length > 16) errorMsg = 'Password must be 8-16 characters';
      else if (!uppercaseRegex.test(value)) errorMsg = 'Must contain at least one uppercase letter';
      else if (!specialCharRegex.test(value)) errorMsg = 'Must contain at least one special character';
    }
    if (name === 'confirmPassword') {
      if (value !== formData.password) errorMsg = 'Passwords do not match';
    }
    
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
    
    // If password changes, re-validate confirmPassword if it has a value
    if (name === 'password' && formData.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  const validateAll = () => {
    const isValidName = validateField('name', formData.name);
    const isValidEmail = validateField('email', formData.email);
    const isValidAddress = validateField('address', formData.address);
    const isValidPassword = validateField('password', formData.password);
    const isValidConfirm = validateField('confirmPassword', formData.confirmPassword);
    
    return isValidName && isValidEmail && isValidAddress && isValidPassword && isValidConfirm;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validateAll()) return;

    setLoading(true);
    try {
      await authService.register(formData);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Join the Store Rating Platform today">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {apiError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}
        <div className="rounded-md shadow-sm space-y-4">
          <InputField
            label="Full Name"
            id="name"
            placeholder="Must be 20-60 characters"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
          <InputField
            label="Email address"
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            label="Location / Address"
            id="address"
            placeholder="Max 400 characters"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
          />
          <PasswordInput
            label="Password"
            id="password"
            placeholder="8-16 chars, 1 uppercase, 1 special"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <PasswordInput
            label="Confirm Password"
            id="confirmPassword"
            placeholder="Must match password exactly"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white"
            >
              <option value="USER">Normal User</option>
              <option value="OWNER">Store Owner</option>
            </select>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
