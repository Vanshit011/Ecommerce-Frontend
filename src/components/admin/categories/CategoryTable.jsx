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
      <div className="h-60 flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="overflow-x-auto -mx-6 px-6 pb-20">
        <table className="w-full border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Products
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {treeData.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-8 text-slate-500">
                  No categories found
                </td>
              </tr>
            ) : (
              paginatedTreeData.map((cat) => renderCategoryRow(cat))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing {startIndex + 1} to {Math.min(endIndex, treeData.length)} of {treeData.length}{" "}
              categories
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTable;
