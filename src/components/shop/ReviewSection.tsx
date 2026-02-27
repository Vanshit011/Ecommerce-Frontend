import React, { useState, useEffect } from "react";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import StarRating from "../common/StarRating";
import { getReviewsByProduct, getProductStats, deleteReview, getProfile } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { User, Review } from "../../types";

interface RatingBreakdownItem {
  count: number;
  percentage: number;
}

interface RatingBreakdown {
  [key: number]: number | RatingBreakdownItem;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: RatingBreakdown;
}

interface ReviewSectionProps {
  productId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [reviewsRes, statsRes, profileRes] = await Promise.all([
        getReviewsByProduct(productId),
        getProductStats(productId),
        localStorage.getItem("token")
          ? getProfile().catch(() => ({ data: null }))
          : Promise.resolve({ data: null }),
      ]);

      const reviewsData = reviewsRes.data?.data || reviewsRes.data || [];
      const statsData = statsRes.data?.data || statsRes.data || null;
      const userData = profileRes.data?.data || profileRes.data || null;

      setReviews(Array.isArray(reviewsData) ? reviewsData : []);

      if (statsData) {
        setStats({
          averageRating:
            statsData.averageRating || statsData.average_rating || statsData.average || 0,
          totalReviews:
            statsData.totalReviews ||
            statsData.total_reviews ||
            statsData.count ||
            statsData.total ||
            0,
          ratingBreakdown:
            statsData.ratingBreakdown || statsData.rating_breakdown || statsData.breakdown || {},
        });
      }

      setCurrentUser(userData);
    } catch (err) {
      console.error("Error fetching reviews data:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [productId, fetchData]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(id);
        showToast("Review deleted", "success");
        fetchData();
      } catch {
        showToast("Failed to delete review", "error");
      }
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchData();
  };

  if (loading)
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <div id="reviews-section" className="mt-20 border-t border-slate-100 pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left: Stats & Action */}
        <div className="lg:col-span-1 space-y-12">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h2 className="text-3xl font-black text-slate-900 leading-tight">Customer Reviews</h2>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-8">
              Based on {stats?.totalReviews || 0} verified experiences
            </p>

            <div className="p-10 bg-blue-600 rounded-[3rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
              {/* Premium Glow effect */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 blur-[80px] rounded-full group-hover:bg-white/20 transition-all duration-700" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full" />

              <div className="relative z-10">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-7xl font-black tracking-tighter drop-shadow-md">
                    {stats?.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-blue-200 font-black text-2xl">/ 5</span>
                </div>

                <div className="flex items-center gap-3 mb-10">
                  <StarRating rating={Math.round(stats?.averageRating || 0)} size="lg" />
                  <span className="text-blue-100/60 font-bold text-[10px] uppercase tracking-widest">
                    Global Rating
                  </span>
                </div>

                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const rawData = stats?.ratingBreakdown?.[rating];
                    const count =
                      typeof rawData === "object"
                        ? (rawData as any).count || 0
                        : (rawData as number) || 0;
                    const total = stats?.totalReviews || 0;
                    const percentage =
                      typeof rawData === "object" && (rawData as any).percentage !== undefined
                        ? (rawData as any).percentage
                        : total > 0
                          ? (count / total) * 100
                          : 0;

                    return (
                      <div key={rating} className="flex items-center gap-4 group/row">
                        <div className="flex items-center gap-1 w-10">
                          <span className="text-xs font-black text-white">{rating}</span>
                          <span className="text-amber-400 text-[10px] drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                            ★
                          </span>
                        </div>

                        <div className="flex-1 h-2 bg-blue-900/20 backdrop-blur-sm rounded-full overflow-hidden border border-white/50">
                          <div
                            className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <div className="flex items-center gap-3 w-20 justify-end">
                          <span className="text-[10px] font-black text-white">{count}</span>
                          <span className="text-[10px] font-bold text-blue-200/60 group-hover/row:text-white transition-colors">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              currentUser
                ? setShowForm(true)
                : showToast("Please login to write a review", "warning")
            }
            className="w-full h-20 bg-white border-2 border-blue-600 text-blue-600 rounded-[2rem] font-black text-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xl shadow-slate-100"
          >
            Write a Review
          </button>
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-2">
          <ReviewList
            reviews={reviews}
            currentUserId={(currentUser as any)?.id || currentUser?._id}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Review Modal */}
      {showForm && (
        <ReviewForm
          productId={productId}
          existingReview={editingReview}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
        />
      )}
    </div>
  );
};

export default ReviewSection;
