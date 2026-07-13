import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAdminReportsQuery, useUpdateReportStatusMutation } from '../../app/api.js';
import { ChevronLeft, AlertOctagon, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_COLORS = {
  open: 'bg-red-50 text-red-700 border-red-200',
  investigating: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-slate-100 text-slate-500 border-slate-200'
};

export const AdminReports = () => {
  const { data: reportsResp, isLoading, refetch } = useGetAdminReportsQuery();
  const [updateStatus, { isLoading: updating }] = useUpdateReportStatusMutation();
  const reports = reportsResp?.data?.reports || [];

  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [newStatus, setNewStatus] = useState('investigating');

  const handleUpdate = async (reportId) => {
    try {
      await updateStatus({ reportId, status: newStatus, adminNote }).unwrap();
      setSelectedReport(null);
      setAdminNote('');
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
        <AlertOctagon className="h-5 w-5 text-rose-500" />
        <h1 className="font-extrabold text-slate-800 text-base">User Submitted Reports ({reports.length})</h1>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-10 bg-white border rounded-2xl">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No reports submitted. All clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[report.status]}`}>
                      {report.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                      {report.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">Hospital: {report.hospitalId} ({report.source})</p>
                  <p className="text-xs text-slate-600">{report.message}</p>
                  <p className="text-[10px] text-slate-400">
                    By: {report.user?.name || 'Guest'} • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedReport(report); setNewStatus(report.status); setAdminNote(report.adminNote || ''); }}
                  className="text-xs font-bold bg-primary-500 text-white px-3.5 py-2 rounded-xl hover:bg-primary-600 shrink-0"
                >
                  Review & Update
                </button>
              </div>

              {selectedReport?._id === report._id && (
                <div className="border-t pt-4 space-y-3 bg-slate-50 p-4 rounded-xl">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">New Status</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value)}
                      className="text-sm rounded-xl border border-slate-200 bg-white p-2 font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Admin Resolution Note</label>
                    <textarea
                      rows={2}
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="Describe action taken..."
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(report._id)}
                      disabled={updating}
                      className="text-xs font-bold bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 disabled:opacity-50"
                    >
                      {updating ? 'Saving...' : 'Save Update'}
                    </button>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-xs font-semibold text-slate-500 px-3 py-2 rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>
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
export default AdminReports;
