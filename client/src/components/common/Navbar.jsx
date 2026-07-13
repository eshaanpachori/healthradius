import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, Heart, Shield, LogOut, User, Layers, Info } from 'lucide-react';
import { logOut, selectCurrentUser } from '../../features/auth/authSlice.js';
import { selectComparisonList } from '../../features/comparison/comparisonSlice.js';
import { useLogoutUserMutation } from '../../app/api.js';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const comparison = useSelector(selectComparisonList);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutApi] = useLogoutUserMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (err) {}
    dispatch(logOut());
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo Mark */}
            <Link to="/" className="flex items-center gap-2">
              <span className="bg-primary-500 text-white p-2 rounded-xl shadow-md shadow-primary-500/10 flex items-center justify-center">
                <span className="font-bold text-lg leading-none">HR</span>
              </span>
              <span className="font-extrabold text-xl tracking-tight text-slate-800">
                Health<span className="text-primary-600">Radius</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-6">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/') ? 'text-primary-600 border-b-2 border-primary-500' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/about') ? 'text-primary-600 border-b-2 border-primary-500' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Methodology
              </Link>
              {user && (
                <Link
                  to="/saved"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/saved') ? 'text-primary-600 border-b-2 border-primary-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Heart className="h-4 w-4 mr-1 text-rose-500 fill-rose-500" />
                  Saved
                </Link>
              )}
              <Link
                to="/compare"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/compare') ? 'text-primary-600 border-b-2 border-primary-500' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Layers className="h-4 w-4 mr-1 text-secondary-500" />
                Compare
                {comparison.length > 0 && (
                  <span className="ml-1 bg-secondary-100 text-secondary-800 text-xs px-2 py-0.5 rounded-full font-bold">
                    {comparison.length}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-all shadow-sm"
                  >
                    <Shield className="h-4 w-4 text-emerald-400" />
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4.5 py-2 rounded-xl transition-all shadow-md shadow-primary-500/10"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-3 px-4 space-y-2.5 shadow-inner">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-base font-semibold ${
              isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-base font-semibold ${
              isActive('/about') ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Methodology
          </Link>
          {user && (
            <Link
              to="/saved"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-base font-semibold ${
                isActive('/saved') ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Saved Hospitals
            </Link>
          )}
          <Link
            to="/compare"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-base font-semibold ${
              isActive('/compare') ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Compare ({comparison.length})
          </Link>

          <hr className="border-slate-100 my-2" />

          {user ? (
            <div className="space-y-2">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-semibold bg-slate-800 text-white"
                >
                  <Shield className="h-4 w-4 text-emerald-400" />
                  Admin Panel
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                <User className="h-5 w-5 text-slate-400" />
                Profile ({user.name})
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-semibold text-rose-600 hover:bg-rose-50 text-left"
              >
                <LogOut className="h-5 w-5" />
                Log Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-2.5 bg-primary-500 rounded-xl text-white font-semibold text-sm hover:bg-primary-600"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
