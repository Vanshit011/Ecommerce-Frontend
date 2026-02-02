import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { getMyProducts, createProduct, updateProduct, deleteProduct, getCategories } from "../../services/api";

const AdminProducts = () => {
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditingId, setIsEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
    const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 10);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [meta, setMeta] = useState(null);

    const initialForm = { name: "", description: "", price: "", image: null, category: "" };
    const [formData, setFormData] = useState(initialForm);

    /*  SYNC URL PARAMS  */
    const updateURL = useCallback((params) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === "" || value === 0 || (key === "page" && value === 1) || (key === "limit" && value === 10)) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        setSearchParams(newParams, { replace: true });
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);

    // Sync from URL
    useEffect(() => {
        const p = Number(searchParams.get("page")) || 1;
        const l = Number(searchParams.get("limit")) || 10;
        const s = searchParams.get("search") || "";

        if (p !== page) setPage(p);
        if (l !== limit) setLimit(l);
        if (s !== search) {
            setSearch(s);
            setDebouncedSearch(s);
        }
    }, [searchParams]);

    // Debounce search update to URL
    useEffect(() => {
        const t = setTimeout(() => {
            if (debouncedSearch !== search) {
                updateURL({ search: search, page: 1 });
            }
        }, 500);
        return () => clearTimeout(t);
    }, [search, updateURL, debouncedSearch]);

    useEffect(() => {
        fetchProducts();
    }, [page, limit, debouncedSearch]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data || []);
        } catch (err) {
            console.error("Fetch Categories Error:", err);
        }
    };

    // Build category tree structure
    const buildCategoryTree = () => {
        return categories.filter((cat) => {
            const hasNoParent = !cat.parentId &&
                (!cat.parent ||
                    (typeof cat.parent === 'object' && !cat.parent.id && !cat.parent._id));
            return hasNoParent;
        });
    };

    // Flatten categories with hierarchy for dropdown
    const getAllCategoriesFlat = (cats = buildCategoryTree(), level = 0, result = []) => {
        cats.forEach((cat) => {
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
            if (hasChildren) {
                getAllCategoriesFlat(cat.children, level + 1, result);
            }
        });
        return result;
    };

    const flattenedCategories = getAllCategoriesFlat();

    // Flatten ALL categories (including nested children) for lookup
    const getAllCategoriesFlattened = () => {
        const result = [];
        const flatten = (cats) => {
            cats.forEach(cat => {
                result.push(cat);
                if (cat.children && cat.children.length > 0) {
                    flatten(cat.children);
                }
            });
        };
        flatten(categories);
        return result;
    };

    // Get full category path (e.g., "HP > Laptop > HP Pavilion")
    const getCategoryPath = (categoryId) => {
        if (!categoryId) return "Uncategorized";

        const allCategories = getAllCategoriesFlattened();

        const findCategoryById = (id) => {
            return allCategories.find(c => String(c.id || c._id) === String(id));
        };

        const buildPath = (catId, path = []) => {
            const category = findCategoryById(catId);
            if (!category) return path;

            path.unshift(category.name);

            // Check if category has a parent
            const parentId = category.parentId || category.parent?.id || category.parent?._id;
            if (parentId) {
                return buildPath(parentId, path);
            }

            return path;
        };

        const path = buildPath(categoryId);
        return path.length > 0 ? path.join(' > ') : "Uncategorized";
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit
            };
            const res = await getMyProducts(params);
            setProducts(res.data?.data || res.data || []);
            setMeta(res.data?.meta || null);
        } catch (err) {
            console.error("Fetch Error:", err);
            setProducts([]);
            setMeta(null);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleEditClick = (product) => {
        const categoryId = product.categoryId;
        setFormData({ ...product, image: null, category: categoryId });
        setIsEditingId(product.id || product._id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const data = new FormData();

        const appendIfValid = (key, value) => {
            if (value !== undefined && value !== null && value !== '') {
                data.append(key, value);
            }
        };

        appendIfValid("name", formData.name);
        appendIfValid("description", formData.description);
        appendIfValid("price", formData.price);

        const catId = formData.category;
        if (catId) {
            data.append("categoryId", catId);
        }

        if (formData.image) data.append("image", formData.image);

        try {
            if (isEditingId) {
                await updateProduct(isEditingId, data);
                showToast("Product updated successfully");
            } else {
                await createProduct(data);
                showToast("Product added successfully");
            }
            setShowModal(false);
            setFormData(initialForm);
            setIsEditingId(null);
            fetchProducts();
        } catch (err) {
            console.error("Save Error:", err);
            showToast("Error saving product", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(id);
                showToast("Product deleted successfully");
                fetchProducts();
            } catch (err) {
                showToast("Error deleting product", "error");
            }
        }
    };

    return (
        <div className="p-5">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-blue-600">Products List</h1>
                    <p className="text-slate-600 mt-1">Manage your store's inventory and product details.</p>
                </div>
                <button
                    onClick={() => { setIsEditingId(null); setFormData(initialForm); setShowModal(true); }}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                    + Add Product
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-x-auto">
                {loading ? (
                    <div className="h-60 flex flex-col items-center justify-center gap-3 text-slate-500">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p>Loading inventory...</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Image</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-slate-500">No products found.</td>
                                    </tr>
                                ) : (
                                    products.map(p => (
                                        <tr key={p.id || p._id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <img
                                                    src={p.image}
                                                    alt={p.name}
                                                    className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:scale-110 transition-transform"
                                                    onClick={() => setPreviewImage(p.image)}
                                                    onError={(e) => {
                                                        e.target.src = "https://via.placeholder.com/50";
                                                    }}
                                                />

                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-800">{p.name}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                                                    {getCategoryPath(p.categoryId)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-800">₹{p.price}</td>
                                            <td className="py-3 px-4 text-slate-600">{p.description?.substring(0, 50)}...</td>
                                            <td className="py-3 px-4">
                                                <div className="relative inline-block">
                                                    <button
                                                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(openMenuId === p.id ? null : p.id);
                                                        }}
                                                    >
                                                        Details
                                                    </button>

                                                    {openMenuId === p.id && (
                                                        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
                                                            <button
                                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                                onClick={() => {
                                                                    handleEditClick(p);
                                                                    setOpenMenuId(null);
                                                                }}
                                                            >
                                                                ✏️ Edit
                                                            </button>

                                                            <button
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                onClick={() => {
                                                                    handleDelete(p.id || p._id);
                                                                    setOpenMenuId(null);
                                                                }}
                                                            >
                                                                🗑 Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Section */}
                        {meta && meta.totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                                <p className="text-sm text-slate-500">
                                    Showing <span className="font-semibold text-slate-800">{((page - 1) * limit) + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(page * limit, meta.total)}</span> of <span className="font-semibold text-slate-800">{meta.total}</span> products
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Previous Page"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(meta.totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Simple logic for showing pages
                                            if (
                                                pageNum === 1 ||
                                                pageNum === meta.totalPages ||
                                                (pageNum >= page - 1 && pageNum <= page + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setPage(pageNum)}
                                                        className={`w-9 h-9 flex items-center justify-center rounded-lg border font-medium text-sm transition-all ${page === pageNum
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (
                                                pageNum === 2 ||
                                                pageNum === meta.totalPages - 1
                                            ) {
                                                return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                        disabled={page === meta.totalPages}
                                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Next Page"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] backdrop-blur-sm"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative bg-white rounded-2xl p-4 max-w-3xl max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
                        <button
                            className="absolute top-2 right-2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold hover:bg-red-600 transition-colors"
                            onClick={() => setPreviewImage(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}


            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">
                            {isEditingId ? "Edit Product" : "Add New Product"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Image</label>
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    style={{ fontFamily: 'monospace' }}
                                >
                                    <option value="">Select a category</option>
                                    {flattenedCategories.map((cat) => (
                                        <option key={cat.id || cat._id} value={cat.id || cat._id}>
                                            {cat.displayName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="w-full px-3 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors border border-slate-300 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {isSubmitting ? "Processing" : isEditingId ? "Update Product" : "Add Product"}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
