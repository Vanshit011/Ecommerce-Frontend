import React from "react";
import StarRating from "../common/StarRating";
import { Review, User } from "../../types";

interface ReviewListProps {
  reviews: Review[];
  currentUserId: string | undefined;
  onEdit: (review: Review) => void;
  onDelete: (id: string) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, currentUserId, onEdit, onDelete }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">
          No reviews yet. Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const userObj = typeof review.user === "object" ? (review.user as User) : null;
        const reviewUserId = userObj ? userObj._id || (userObj as any).id : (review.user as string);
        const isOwner = currentUserId && reviewUserId === currentUserId;

        return (
          <div
            key={(review as any).id || review._id}
            className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 text-blue-600 font-black text-sm">
                  {userObj?.firstName?.charAt(0) || userObj?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    {userObj
                      ? userObj.firstName
                        ? `${userObj.firstName} ${userObj.lastName || ""}`.trim()
                        : userObj.name || "User"
                      : "User"}
                  </h4>
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {(() => {
                        const dateStr = review.createdAt || (review as any).created_at;
                        if (!dateStr) return "Just now";
                        const date = new Date(dateStr);
                        return isNaN(date.getTime())
                          ? "Recently"
                          : date.toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            });
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {isOwner && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(review)}
                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(((review as any).id || review._id) as string)}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <p className="text-slate-600 leading-relaxed font-medium pl-16">{review.comment}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
