import React, { useState, useEffect, useRef } from "react";
import StarRating from "../common/StarRating";
import { useToast } from "../../context/ToastContext";
import { createReview, updateReview } from "../../services/api";

const ReviewForm = ({ productId, existingReview, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden"; // Lock scroll

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset"; // Unlock scroll
    };
  }, [onCancel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      showToast("Please select a rating", "error");
      return;
    }

    try {
      setLoading(true);
      if (existingReview) {
        await updateReview(existingReview.id, { rating, comment });
        showToast("Review updated successfully", "success");
      } else {
        await createReview(productId, { rating, comment });
        showToast("Review submitted successfully", "success");
      }
      onSuccess();
    } catch (err) {
      console.error("Error submitting review:", err);
      showToast(err.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-slide-up"
      >
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
        >
          ✕
        </button>

        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {existingReview ? "Edit Review" : "Share Your Experience"}
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              {existingReview ? "Update your feedback" : "Tell us what you think"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">
                Overall Rating
              </label>
              <div className="flex justify-center bg-slate-50 py-6 rounded-3xl border border-slate-100">
                <StarRating rating={rating} setRating={setRating} interactive={true} size="xl" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike? How was the quality?"
                className="w-full h-40 px-6 py-5 bg-slate-50 rounded-3xl border border-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none text-slate-700 font-medium leading-relaxed"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-16 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center shadow-xl shadow-indigo-100 disabled:bg-indigo-300 disabled:transform-none"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                ) : existingReview ? (
                  "Update Feedback"
                ) : (
                  "Post Review"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
