import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginUserMutation, useAddFavoriteMutation } from '../app/api.js';
import { setCredentials, selectPendingFavorite, clearPendingFavorite } from '../features/auth/authSlice.js';
import { AlertCircle, Lock, Mail } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const [loginUser, { isLoading, error: apiError }] = useLoginUserMutation();
  const [addFav] = useAddFavoriteMutation();
  const pendingFav = useSelector(selectPendingFavorite);

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email.trim() || !password) {
      setValidationError('Please fill in all credentials fields.');
      return;
    }

    try {
      const resp = await loginUser({ email: email.trim(), password }).unwrap();
      
      if (resp.success) {
        const { token, user } = resp.data;
        dispatch(setCredentials({ token, user }));
        
        // Execute pending guest actions if any exist
        if (pendingFav) {
          try {
            await addFav({ source: pendingFav.source, hospitalId: pendingFav.hospitalId }).unwrap();
          } catch (favErr) {}
          dispatch(clearPendingFavorite());
        }

        // Redirect appropriately
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setValidationError(err.data?.message || 'Login failed. Invalid email or password.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-205/80 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Log In to HealthRadius</h2>
          <p className="text-xs text-slate-500 font-semibold">Access reviews, favorites, and directory corrections</p>
        </div>

        {/* Errors display */}
        {(validationError || apiError) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <p>{validationError || apiError?.data?.message || 'Invalid credentials'}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 font-medium text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            {isLoading ? 'Processing Authentications...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 font-semibold pt-2">
          New to HealthRadius?{' '}
          <Link to="/register" className="text-primary-650 hover:underline font-bold">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
};
export default Login;
