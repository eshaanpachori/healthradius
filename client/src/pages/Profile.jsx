import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetProfileQuery, useUpdateProfileMutation } from '../app/api.js';
import { setCredentials, selectCurrentUser } from '../features/auth/authSlice.js';
import { AlertCircle, User, Mail, Link, Save, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const { data: profileResp, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Name and Email fields are required.');
      return;
    }

    try {
      const resp = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        avatarUrl: avatarUrl.trim()
      }).unwrap();

      if (resp.success) {
        setSuccess('Profile updated successfully.');
        dispatch(setCredentials({ token: useSelector(state => state.auth.token), user: resp.data.user }));
        refetch();
      }
    } catch (err) {
      setError(err.data?.message || 'Failed to update profile. Email might be in use.');
    }
  };

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
      
      <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Account Profile Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your public information and email subscription preferences</p>
        </div>

        {/* Success / Error Banners */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 py-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-primary-500 shadow-sm" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-xl border">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-slate-700 block">Avatar Preview</span>
              <span className="text-[10px] text-slate-450 block">Paste a public image URL below to update your picture</span>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="prof-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                id="prof-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-205 bg-slate-50 pl-10 pr-3 py-2.5 font-semibold text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="prof-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-205 bg-slate-50 pl-10 pr-3 py-2.5 font-semibold text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div className="space-y-1.5">
            <label htmlFor="prof-avatar" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Profile Image URL</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Link className="h-4.5 w-4.5" />
              </span>
              <input
                id="prof-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full text-sm rounded-xl border border-slate-205 bg-slate-50 pl-10 pr-3 py-2.5 font-semibold text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-350 text-white font-extrabold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-primary-500/10 text-sm cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
export default Profile;
