import React from "react";

const CategoryForm = ({
    editId,
    newCategory,
    setNewCategory,
    parentId,
    setParentId,
    handleSubmit,
    isSubmitting,
    handleCancelEdit,
    flattenedCategories
}) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-5">
                {editId ? " Edit Category" : " Add New Category"}
            </h3>

            <form onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category Name
                </label>
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Electronics"
                    className="w-full px-3 py-3 rounded-lg border border-slate-300 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Parent Category (Optional)
                </label>
                <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-3 rounded-lg border border-slate-300 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                    <option value="">None (Root Category)</option>
                    {flattenedCategories.map((cat) => (
                        <option key={cat.id || cat._id} value={cat.id || cat._id}>
                            {cat.displayName}
                        </option>
                    ))}
                </select>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        {isSubmitting
                            ? "Processing..."
                            : editId
                                ? "Update Category"
                                : "Add Category"}
                    </button>

                    {editId && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-3 rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors border border-slate-300"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
