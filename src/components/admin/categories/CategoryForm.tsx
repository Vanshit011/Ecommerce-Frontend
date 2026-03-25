import React from "react";

interface CategoryFormProps {
  editId: string | null;
  newCategory: string;
  setNewCategory: (val: string) => void;
  parentId: string;
  setParentId: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  handleCancelEdit: () => void;
  flattenedCategories: any[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  editId,
  newCategory,
  setNewCategory,
  parentId,
  setParentId,
  handleSubmit,
  isSubmitting,
  handleCancelEdit,
  flattenedCategories,
}) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* MODAL HEADER */}
      <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-slate-50">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {editId ? "Update Category" : "New Category"}
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Category Information
          </p>
        </div>
        <button
          onClick={handleCancelEdit}
          className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6 overflow-y-auto max-h-[70vh]">
        {/* CATEGORY NAME */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            Category Name *
          </label>
          <div className="relative group">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Electronics, Fashion..."
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
            <div className="absolute inset-0 rounded-2xl border-2 border-blue-600 opacity-0 group-focus-within:opacity-10 pointer-events-none transition-opacity" />
          </div>
        </div>

        {/* PARENT SELECTION */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            Organization (Parent Category)
          </label>
          <div className="relative group">
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="">Root Category (None)</option>
              {flattenedCategories.map((cat) => (
                <option key={cat.id || cat._id} value={cat.id || cat._id}>
                  {cat.displayName}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-blue-600 opacity-0 group-focus-within:opacity-10 pointer-events-none transition-opacity" />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {editId ? "Update Category" : "Add Category"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
