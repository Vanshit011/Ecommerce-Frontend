import React from "react";

const CategoryTable = ({
  loading,
  treeData,
  paginatedTreeData,
  renderCategoryRow,
  totalPages,
  currentPage,
  handlePageChange,
  startIndex,
  endIndex,
}) => {
  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="font-bold text-sm uppercase tracking-widest">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Category Name
              </th>
              <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Analytics
              </th>
              <th className="text-center py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Quick Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {treeData.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-20">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-300">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="font-bold text-sm">No hierarchical categories found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTreeData.map((cat) => renderCategoryRow(cat))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION SECTION */}
      {totalPages > 1 && (
        <div className="mt-auto px-10 py-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-800">{startIndex + 1}</span>-
            <span className="text-slate-800">{Math.min(endIndex, treeData.length)}</span> of{" "}
            <span className="text-slate-800">{treeData.length}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                const isSelected = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 font-black text-xs transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                        : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600 hover:bg-slate-50"
                    }`}
                  >
                    {String(pageNum).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTable;
