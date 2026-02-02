import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getMyProducts,
} from "../../services/api";

const AdminCategories = () => {
    const { showToast } = useToast();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState("");
    const [parentId, setParentId] = useState("");
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [viewProductsFor, setViewProductsFor] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                getCategories(),
                getMyProducts(),
            ]);

            // Sort categories by latest first (assuming createdAt or _id for MongoDB)
            const sortedCategories = (catRes.data || []).sort((a, b) => {
                const dateA = new Date(a.created_at || a._id);
                const dateB = new Date(b.created_at || b._id);
                return dateB - dateA;
            });
            setCategories(sortedCategories);
            setProducts(prodRes.data || []);
        } catch {
            showToast("Failed to load categories", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setIsSubmitting(true);
        try {
            const payload = { name: newCategory };
            if (parentId) {
                payload.parentId = parentId;
            }

            if (editId) {
                await updateCategory(editId, payload);
                showToast("Category updated successfully");
            } else {
                await createCategory(payload);
                showToast("Category added successfully");
            }
            setNewCategory("");
            setParentId("");
            setEditId(null);
            fetchCategories();
        } catch {
            showToast("Failed to save category", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (cat) => {
        setEditId(cat.id || cat._id);
        setNewCategory(cat.name);
        setParentId(cat.parentId || "");
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setNewCategory("");
        setParentId("");
    };

    const handleDelete = async (id) => {
        const hasChildren = categories.some(
            (cat) => (cat.parentId || cat.parent?._id || cat.parent?.id) === id
        );

        if (hasChildren) {
            if (
                !window.confirm(
                    "This category has child categories. Deleting it may affect child categories. Continue?"
                )
            ) {
                return;
            }
        } else {
            if (!window.confirm("Delete this category?")) return;
        }

        try {
            await deleteCategory(id);
            showToast("Category deleted successfully");
            fetchCategories();
        } catch {
            showToast("Failed to delete category", "error");
        }
    };

    const toggleExpand = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const toggleViewProducts = (categoryId) => {
        setViewProductsFor(viewProductsFor === categoryId ? null : categoryId);
    };

    // Build tree structure - backend already provides children array
    const buildTree = () => {
        // Filter only root categories (those without parent or with empty parent)
        return categories.filter((cat) => {
            // Check if category has no parent
            const hasNoParent = !cat.parentId &&
                (!cat.parent ||
                    (typeof cat.parent === 'object' && !cat.parent.id && !cat.parent._id));
            return hasNoParent;
        });
    };

    const treeData = buildTree();

    // Pagination logic
    const totalPages = Math.ceil(treeData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTreeData = treeData.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setExpandedCategories(new Set()); // Reset expanded state on page change
    };

    const getProductsForCategory = (categoryId, includeChildren = true) => {
        // Get direct products for this category
        const directProducts = products.filter(
            (p) =>
                (p.categoryId ||
                    p.category?.id ||
                    p.category?._id ||
                    p.category) === categoryId
        );

        if (!includeChildren) {
            return directProducts;
        }

        // Create a flat map of all categories for easy lookup (including nested children)
        const categoryMap = new Map();
        const flattenCategories = (cats) => {
            cats.forEach(cat => {
                const catId = cat.id || cat._id;
                categoryMap.set(catId, cat);
                if (cat.children && cat.children.length > 0) {
                    flattenCategories(cat.children);
                }
            });
        };
        flattenCategories(categories);

        // Get all category IDs including children recursively
        const getAllCategoryIds = (catId) => {
            const ids = [catId];
            const category = categoryMap.get(catId);


            if (category && category.children && category.children.length > 0) {
                category.children.forEach(child => {
                    const childId = child.id || child._id;
                    ids.push(...getAllCategoryIds(childId));
                });
            }

            return ids;
        };

        const allCategoryIds = getAllCategoryIds(categoryId);

        // Get products for all category IDs (this category + all children)
        return products.filter(
            (p) => {
                const productCatId = p.categoryId || p.category?.id || p.category?._id || p.category;
                return allCategoryIds.includes(productCatId);
            }
        );
    };

    const renderCategoryRow = (cat, level = 0) => {
        const categoryId = cat.id || cat._id;
        const hasChildren = cat.children && cat.children.length > 0;
        const isExpanded = expandedCategories.has(categoryId);
        const categoryProducts = getProductsForCategory(categoryId);
        const showProducts = viewProductsFor === categoryId;

        return (
            <React.Fragment key={categoryId}>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4">
                        <div
                            className="flex items-center gap-2"
                            style={{ paddingLeft: `${level * 24}px` }}
                        >
                            {hasChildren && (
                                <button
                                    onClick={() => toggleExpand(categoryId)}
                                    className="text-slate-600 hover:text-blue-600 transition-colors"
                                >
                                    {isExpanded ? "▼" : "▶"}
                                </button>
                            )}
                            {!hasChildren && <span className="w-4"></span>}
                            <span className="font-medium text-slate-800">
                                {cat.name}
                            </span>
                            {hasChildren && (
                                <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                    {cat.children.length} {cat.children.length === 1 ? 'child' : 'children'}
                                </span>
                            )}
                        </div>
                    </td>

                    <td className="py-3 px-4">
                        <button
                            onClick={() => toggleViewProducts(categoryId)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                        >
                            {categoryProducts.length} Products
                            {categoryProducts.length > 0 && (
                                <span className="text-xs">
                                    {showProducts ? "▲" : "▼"}
                                </span>
                            )}
                        </button>
                    </td>

                    <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleEditClick(cat)}
                                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={() => handleDelete(categoryId)}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                🗑 Delete
                            </button>
                        </div>
                    </td>
                </tr>

                {/* Show products if expanded */}
                {showProducts && categoryProducts.length > 0 && (
                    <tr className="bg-slate-50">
                        <td colSpan="3" className="py-3 px-4">
                            <div
                                className="ml-8 p-4 bg-white rounded-lg border border-slate-200"
                                style={{ marginLeft: `${(level + 1) * 24}px` }}
                            >
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                    Products in {cat.name}:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {categoryProducts.map((product) => (
                                        <span
                                            key={product.id || product._id}
                                            className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm"
                                        >
                                            {product.name || product.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </td>
                    </tr>
                )}

                {/* Render children if expanded */}
                {isExpanded &&
                    hasChildren &&
                    cat.children.map((child) => renderCategoryRow(child, level + 1))}
            </React.Fragment>
        );
    };

    // Get all categories in a flat list with hierarchy indicators for dropdown
    const getAllCategoriesFlat = (cats = categories, level = 0, result = []) => {
        cats.forEach((cat) => {
            const catId = cat.id || cat._id;
            // Don't include the category being edited
            if (catId !== editId) {
                const hasChildren = cat.children && cat.children.length > 0;
                const indent = '  '.repeat(level);
                let prefix = '';

                if (level === 0) {
                    prefix = hasChildren ? '▼ ' : '• ';
                } else {
                    prefix = hasChildren ? '└─▼ ' : '└─• ';
                }

                result.push({
                    ...cat,
                    displayName: indent + prefix + cat.name,
                    level: level,
                    hasChildren: hasChildren
                });
                // Recursively add children
                if (hasChildren) {
                    getAllCategoriesFlat(cat.children, level + 1, result);
                }
            }
        });
        return result;
    };

    const flattenedCategories = getAllCategoriesFlat(treeData);

    return (
        <div className="p-5">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-blue-600">
                    Product Categories
                </h1>
                <p className="text-slate-600 mt-1">
                    Manage your product groupings and classification.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-5">
                        {editId ? "Edit Category" : "Add New Category"}
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
                            className="w-full px-3 py-3 rounded-lg border border-slate-300 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{ fontFamily: 'monospace' }}
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
                                className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
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

                {/* TABLE */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    {loading ? (
                        <div className="h-60 flex flex-col items-center justify-center gap-3 text-slate-500">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p>Loading categories...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
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
                                            <td
                                                colSpan="3"
                                                className="text-center py-8 text-slate-500"
                                            >
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
                                        Showing {startIndex + 1} to {Math.min(endIndex, treeData.length)} of {treeData.length} categories
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
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === page
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
