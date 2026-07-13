import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterUserMutation } from '../app/api.js';
import { setCredentials } from '../features/auth/authSlice.js';
import { AlertCircle, User, Mail, Lock } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const [registerUser, { isLoading, error: apiError }] = useRegisterUserMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim() || !email.trim() || !password) {
      setValidationError('Please fill in all registration fields.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    try {
      const resp = await registerUser({ name: name.trim(), email: email.trim(), password }).unwrap();
      if (resp.success) {
        dispatch(
          setCredentials({
            token: resp.data.token,
            user: resp.data.user
          })
        );
        navigate('/');
      }
    } catch (err) {
      setValidationError(err.data?.message || 'Registration failed. Try a different email address.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-205/80 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-500 font-semibold">Join HealthRadius directory to rate clinics and save favorites</p>
        </div>

        {/* Errors display */}
        {(validationError || apiError) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <p>{validationError || apiError?.data?.message || 'Registration error'}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 font-medium text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 font-medium text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 6 characters)"
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 font-medium text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white font-extrabold py-3 px-4 rounded-xl transition-all shadow-md shadow-primary-500/10 text-sm cursor-pointer"
          >
            {isLoading ? 'Creating Accounts...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 font-semibold pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-650 hover:underline font-bold">
            Log In here
          </Link>
        </p>

      </div>
    </div>
  );
};
export default Register;
