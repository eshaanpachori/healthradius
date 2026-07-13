import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAdminHospitalProfilesQuery, useUpdateHospitalProfileMutation } from '../../app/api.js';
import { ChevronLeft, CheckSquare, Edit3, CheckCircle2 } from 'lucide-react';

export const AdminProfiles = () => {
  const { data: profilesResp, isLoading, refetch } = useGetAdminHospitalProfilesQuery();
  const [updateProfile, { isLoading: updating }] = useUpdateHospitalProfileMutation();
  const profiles = profilesResp?.data?.hospitalProfiles || [];

  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({});

  const handleSelect = (profile) => {
    setSelected(profile);
    setFormData({
      description: profile.description || '',
      ownershipType: profile.ownershipType || 'unknown',
      specialties: (profile.specialties || []).join(', '),
      facilities: (profile.facilities || []).join(', '),
      emergencyAvailable: profile.emergencyAvailable || false,
      ambulanceNumber: profile.ambulanceNumber || '',
      insuranceAccepted: (profile.insuranceAccepted || []).join(', '),
      wheelchairAccessible: profile.wheelchairAccessible || false,
      verified: profile.verified || false,
      dataNotes: profile.dataNotes || ''
    });
  };

  const handleUpdate = async () => {
    try {
      await updateProfile({
        source: selected.source,
        hospitalId: selected.externalId,
        data: {
          ...formData,
          specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
          facilities: formData.facilities.split(',').map(s => s.trim()).filter(Boolean),
          insuranceAccepted: formData.insuranceAccepted.split(',').map(s => s.trim()).filter(Boolean)
        }
      }).unwrap();
      setSelected(null);
      refetch();
    } catch (err) {}
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <CheckSquare className="h-5 w-5 text-emerald-500" />
        <h1 className="font-extrabold text-slate-800 text-base">Hospital Profile Overrides ({profiles.length})</h1>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl" />)}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-10 bg-white border rounded-2xl">
          <CheckCircle2 className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-500 font-semibold text-sm">No custom hospital profiles created yet.</p>
          <p className="text-xs text-slate-400 mt-1">Visit a hospital's details page and submit a report to generate a manageable profile, or create one directly via the API.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <div key={profile._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {profile.source.toUpperCase()} • ID: {profile.externalId}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${profile.verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {profile.verified ? '✓ Verified' : 'Not Verified'}
                    </span>
                    {profile.verifiedAt && (
                      <span className="text-[10px] text-slate-400">Verified: {new Date(profile.verifiedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSelect(profile)}
                  className="text-xs font-bold bg-primary-500 text-white px-3.5 py-2 rounded-xl hover:bg-primary-600 flex items-center gap-1"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
              </div>

              {selected?._id === profile._id && (
                <div className="border-t pt-4 space-y-3 bg-slate-50 p-4 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                      <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full text-xs rounded-lg border bg-white p-2 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Ownership Type</label>
                      <select value={formData.ownershipType} onChange={e => setFormData({...formData, ownershipType: e.target.value})} className="w-full text-xs rounded-lg border bg-white p-2 focus:outline-none">
                        <option value="government">Government</option>
                        <option value="private">Private</option>
                        <option value="charitable">Charitable</option>
                        <option value="teaching">Teaching</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Specialties (comma-separated)</label>
                      <input type="text" value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} className="w-full text-xs rounded-lg border bg-white p-2 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Facilities (comma-separated)</label>
                      <input type="text" value={formData.facilities} onChange={e => setFormData({...formData, facilities: e.target.value})} className="w-full text-xs rounded-lg border bg-white p-2 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Ambulance Number</label>
                      <input type="text" value={formData.ambulanceNumber} onChange={e => setFormData({...formData, ambulanceNumber: e.target.value})} className="w-full text-xs rounded-lg border bg-white p-2 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Insurance (comma-separated)</label>
                      <input type="text" value={formData.insuranceAccepted} onChange={e => setFormData({...formData, insuranceAccepted: e.target.value})} className="w-full text-xs rounded-lg border bg-white p-2 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-4 flex-wrap text-xs font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.emergencyAvailable} onChange={e => setFormData({...formData, emergencyAvailable: e.target.checked})} className="rounded" />
                      Emergency Available
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.wheelchairAccessible} onChange={e => setFormData({...formData, wheelchairAccessible: e.target.checked})} className="rounded" />
                      Wheelchair Accessible
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.verified} onChange={e => setFormData({...formData, verified: e.target.checked})} className="rounded text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Mark as Verified</span>
                    </label>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Admin Data Notes</label>
                    <textarea rows={2} value={formData.dataNotes} onChange={e => setFormData({...formData, dataNotes: e.target.value})} placeholder="Internal notes about this record..." className="w-full text-xs rounded-lg border bg-white p-2 focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleUpdate} disabled={updating} className="text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
                      {updating ? 'Saving...' : 'Save Profile Overrides'}
                    </button>
                    <button onClick={() => setSelected(null)} className="text-xs font-semibold text-slate-500 px-3 py-2 rounded-xl hover:bg-slate-200">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminProfiles;
