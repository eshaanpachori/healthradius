import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetHospitalDetailsQuery,
  useGetReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useReportReviewMutation,
  useSubmitReportMutation
} from '../app/api.js';
import { selectCurrentUser, selectIsAuthenticated } from '../features/auth/authSlice.js';
import RatingStars from '../components/common/RatingStars.jsx';
import ReviewForm from '../components/reviews/ReviewForm.jsx';
import ReviewList from '../components/reviews/ReviewList.jsx';
import { DetailsSkeleton, ReviewsSkeleton } from '../components/common/Skeletons.jsx';
import {
  Phone,
  Globe,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Building,
  Activity,
  Heart,
  ChevronLeft,
  Calendar,
  ShieldCheck,
  Bug,
  BadgeAlert
} from 'lucide-react';

export const Details = () => {
  const { source, hospitalId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Read search location from session to calculate distance if available
  const [coords] = useState(() => {
    try {
      const saved = sessionStorage.getItem('healthradius_coords');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const { data: detailsResp, isLoading: detailsLoading, isError: detailsError } = useGetHospitalDetailsQuery({
    source,
    hospitalId,
    lat: coords?.latitude,
    lng: coords?.longitude
  });
  const hospital = detailsResp?.data?.hospital;

  // Reviews query
  const [reviewsSort, setReviewsSort] = useState('newest');
  const { data: reviewsResp, isLoading: reviewsLoading } = useGetReviewsQuery({
    source,
    hospitalId,
    sort: reviewsSort
  });

  const [createReview, { isLoading: createReviewLoading }] = useCreateReviewMutation();
  const [updateReview, { isLoading: updateReviewLoading }] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [reportReview] = useReportReviewMutation();
  const [submitReport, { isLoading: submitReportLoading }] = useSubmitReportMutation();

  const [activeTab, setActiveTab] = useState('info'); // info, reviews
  const [editingReview, setEditingReview] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportCategory, setReportCategory] = useState('incorrect_phone');
  const [reportMessage, setReportMessage] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  const [reviewError, setReviewError] = useState('');

  if (detailsLoading) return <DetailsSkeleton />;
  if (detailsError || !hospital) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="font-extrabold text-slate-800 text-lg">Hospital Details Not Found</h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">
          We couldn't retrieve the details for this hospital. It might have been deactivated or provider credentials may be expired.
        </p>
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold bg-primary-500 text-white px-4 py-2.5 rounded-xl">
          <ChevronLeft className="h-4 w-4" /> Back to Search
        </Link>
      </div>
    );
  }

  const handleReviewSubmit = async (reviewData) => {
    try {
      setReviewError('');
      if (editingReview) {
        await updateReview({ reviewId: editingReview._id, data: reviewData }).unwrap();
        setEditingReview(null);
      } else {
        await createReview({ source, hospitalId, data: reviewData }).unwrap();
      }
    } catch (err) {
      setReviewError(err.data?.message || 'Failed to submit your review.');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportSuccess('');
    if (!reportMessage.trim()) return;

    try {
      await submitReport({
        source,
        hospitalId,
        data: { category: reportCategory, message: reportMessage.trim() }
      }).unwrap();
      setReportSuccess('Thank you. Your feedback report has been received for validation.');
      setReportMessage('');
      setTimeout(() => setShowReportForm(false), 3000);
    } catch (err) {}
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      {/* Top Breadcrumb Nav */}
      <div>
        <Link to={coords ? `/search?lat=${coords.latitude}&lng=${coords.longitude}` : '/'} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
          <ChevronLeft className="h-4.5 w-4.5" /> Back to Search Results
        </Link>
      </div>

      {/* Main Details Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Essential details & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            
            {/* Header info */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                {hospital.verified ? (
                  <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified platform details
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                    Community Reported Data
                  </span>
                )}
                {hospital.isDemo && (
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    Demo Mode Record
                  </span>
                )}
              </div>
              
              <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                {hospital.name}
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{hospital.description}</p>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-100">
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <Building className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-700 block">Ownership Structure</span>
                  <span className="capitalize">{hospital.ownershipType || 'Unknown'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <Activity className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-700 block">Emergency ER Care</span>
                  <span>{hospital.emergencyAvailable ? 'Available 24/7' : 'Not Available / Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-4 border-b border-slate-200/80">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'info' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400'
                }`}
              >
                Hospital Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'reviews' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400'
                }`}
              >
                Community Reviews ({reviewsResp?.data?.stats?.totalCount || 0})
              </button>
            </div>

            {/* TAB CONTENTS: Specifications */}
            {activeTab === 'info' && (
              <div className="space-y-6 pt-2">
                
                {/* Specialties */}
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Medical Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {hospital.categories?.length > 0 ? (
                      hospital.categories.map((s, idx) => (
                        <span key={idx} className="bg-slate-50 border border-slate-200/50 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-medium">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold italic">Not Available</span>
                    )}
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Equipment & Facilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {hospital.facilities?.length > 0 ? (
                      hospital.facilities.map((f, idx) => (
                        <span key={idx} className="bg-slate-50 border border-slate-200/50 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-medium">
                          {f}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold italic">Not Available</span>
                    )}
                  </div>
                </div>

                {/* Insurance & Accessibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Insurance Partner Networks</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {hospital.insuranceAccepted?.length > 0 ? (
                        hospital.insuranceAccepted.map((ins, idx) => (
                          <span key={idx} className="bg-primary-50/50 text-primary-800 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-primary-100/50">
                            {ins}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-450 italic font-semibold">Not Specified</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Access Parameters</h3>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      hospital.wheelchairAccessible
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {hospital.wheelchairAccessible ? '♿ Wheelchair Accessible Layout' : 'No Wheelchair Access Verified'}
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENTS: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 pt-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Platform Feedback</h3>
                  
                  {/* Reviews sorting */}
                  <select
                    value={reviewsSort}
                    onChange={(e) => setReviewsSort(e.target.value)}
                    className="text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-slate-700"
                  >
                    <option value="newest">Newest first</option>
                    <option value="highest-rated">Highest ratings</option>
                  </select>
                </div>

                {reviewsLoading ? (
                  <ReviewsSkeleton />
                ) : (
                  <ReviewList
                    reviewsData={reviewsResp?.data}
                    currentUser={currentUser}
                    onEdit={(rev) => {
                      setEditingReview(rev);
                      document.getElementById('review-form-container')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onDelete={async (id) => {
                      try {
                        await deleteReview(id).unwrap();
                      } catch (err) {}
                    }}
                    onReport={async (id, reason) => {
                      try {
                        await reportReview({ reviewId: id, message: reason }).unwrap();
                        alert('Review content flagged for administrator validation.');
                      } catch (err) {}
                    }}
                    isActionLoading={false}
                  />
                )}

                {/* Form to submit reviews */}
                <div id="review-form-container" className="pt-6 border-t border-slate-105">
                  <h4 className="font-bold text-slate-800 text-sm mb-4">
                    {editingReview ? 'Modify Your Submitted Review' : 'Add Your Experience Review'}
                  </h4>
                  {isAuthenticated ? (
                    <ReviewForm
                      initialData={editingReview}
                      onSubmit={handleReviewSubmit}
                      isSubmitting={createReviewLoading || updateReviewLoading}
                      error={reviewError ? { data: { message: reviewError } } : null}
                    />
                  ) : (
                    <div className="text-center p-5 bg-slate-50 border border-slate-200/50 rounded-2xl">
                      <p className="text-xs text-slate-500 font-semibold">You must be logged in to post reviews.</p>
                      <Link to="/login" className="mt-2.5 inline-block text-xs font-bold bg-primary-500 text-white px-4.5 py-2 rounded-xl">
                        Log In Now
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Right Column: Contact info & Custom updates */}
        <div className="space-y-6">
          
          {/* Card: Contact info */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-2">
              Contact & Hours
            </h3>
            
            {hospital.distanceKm !== undefined && (
              <div className="text-xs bg-slate-50 border p-3 rounded-2xl flex items-center justify-between font-semibold">
                <span className="text-slate-500">Selected Distance</span>
                <span className="text-slate-800">{hospital.distanceKm} km away</span>
              </div>
            )}

            <div className="space-y-3.5 pt-2">
              {hospital.phone && (
                <a
                  href={`tel:${hospital.phone}`}
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-2.5 px-4 rounded-xl text-xs"
                >
                  <Phone className="h-4 w-4 text-primary-500" />
                  Call: {hospital.phone}
                </a>
              )}

              {hospital.website && (
                <a
                  href={hospital.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-2.5 px-4 rounded-xl text-xs"
                >
                  <Globe className="h-4 w-4 text-primary-500" />
                  Visit Website
                </a>
              )}

              {hospital.location && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.latitude},${hospital.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-primary-500/10"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
              )}
            </div>

            {/* Opening Hours list */}
            {hospital.openingHours?.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weekly opening Hours</span>
                <div className="space-y-1">
                  {hospital.openingHours.map((line, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-slate-600 font-medium">
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card: Verification log metadata */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-2">
              Platform trust
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-450">Verification Date</span>
                <span className="font-semibold text-slate-800">
                  {hospital.appProfile?.verifiedAt
                    ? new Date(hospital.appProfile.verifiedAt).toLocaleDateString()
                    : 'Not Verified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Information Freshness</span>
                <span className="font-semibold text-slate-800">
                  {hospital.appProfile?.lastInformationReviewAt
                    ? new Date(hospital.appProfile.lastInformationReviewAt).toLocaleDateString()
                    : 'Standard Feed'}
                </span>
              </div>
              {hospital.appProfile?.dataNotes && (
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  <span className="font-bold text-slate-700 not-italic block mb-0.5">Editor Notes</span>
                  "{hospital.appProfile.dataNotes}"
                </div>
              )}
            </div>

            {/* Submit correction reports button */}
            <div className="pt-2 border-t border-slate-100">
              {showReportForm ? (
                <form onSubmit={handleReportSubmit} className="space-y-2.5 pt-2">
                  {reportSuccess && (
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] font-bold">
                      {reportSuccess}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label htmlFor="report-cat" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Report Subject</label>
                    <select
                      id="report-cat"
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="w-full text-xs rounded-lg border bg-slate-50 p-1.5"
                    >
                      <option value="incorrect_phone">Incorrect Phone Number</option>
                      <option value="incorrect_address">Incorrect Address</option>
                      <option value="incorrect_hours">Incorrect Hours</option>
                      <option value="closed">Hospital is permanently closed</option>
                      <option value="other">Other Information Issue</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="report-msg" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                      id="report-msg"
                      rows={2}
                      value={reportMessage}
                      onChange={(e) => setReportMessage(e.target.value)}
                      placeholder="Specify the correct hospital details here..."
                      className="w-full text-xs rounded-lg border bg-slate-50 p-1.5 text-slate-800 focus:outline-none"
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-2 py-1 text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitReportLoading}
                      className="px-3 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowReportForm(true)}
                  className="w-full flex items-center justify-center gap-1.5 text-slate-500 hover:text-amber-650 transition-colors border border-slate-205 border-dashed py-2.5 rounded-xl text-xs font-bold"
                >
                  <Bug className="h-4 w-4" />
                  Report Incorrect Details
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Details;
