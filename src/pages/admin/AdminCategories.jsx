import React, { useState, useEffect } from "react";
import { useToast } from "../../components/ToastContext";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getMyProducts,
} from "../../services/api";
import "../../styles/adminCategories.css";

const AdminCategories = () => {
    const { showToast } = useToast();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState("");
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                getCategories(),
                getMyProducts(),
            ]);
            setCategories(catRes.data || []);
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
            if (editId) {
                await updateCategory(editId, { name: newCategory });
                showToast("Category updated successfully");
            } else {
                await createCategory({ name: newCategory });
                showToast("Category added successfully");
            }
            setNewCategory("");
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
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setNewCategory("");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await deleteCategory(id);
            showToast("Category deleted successfully");
            fetchCategories();
        } catch {
            showToast("Failed to delete category", "error");
        }
    };

    return (
        <div className="admin-categories">
            {/* HEADER */}
            <div className="categories-header">
                <h1>Product Categories</h1>
                <p>Manage your product groupings and classification.</p>
            </div>

            <div className="categories-grid">
                {/* FORM */}
                <div className="card category-form">
                    <h3>{editId ? "Edit Category" : "Add New Category"}</h3>

                    <form onSubmit={handleSubmit}>
                        <label>Category Name</label>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="e.g. Electronics"
                        />

                        <div className="form-actions">
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Processing..."
                                    : editId
                                        ? "Update Category"
                                        : "Add Category"}
                            </button>

                            {editId && (
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* TABLE */}
                <div className="card table-container">
                    {loading ? (
                        <div className="loader-wrapper">
                            <div className="spinner"></div>
                            <p>Loading categories...</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th className="left">Name</th>
                                    <th className="left">Products</th>
                                    <th className="left">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="empty">
                                            No categories found
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat.id || cat._id}>
                                            <td className="left">{cat.name}</td>

                                            <td className="left">
                                                <span className="pill">
                                                    {
                                                        products.filter(
                                                            (p) =>
                                                                (p.categoryId ||
                                                                    p.category?.id ||
                                                                    p.category?._id ||
                                                                    p.category) ===
                                                                (cat.id || cat._id)
                                                        ).length
                                                    }{" "}
                                                    Products
                                                </span>
                                            </td>

                                            <td>
                                                <div className="action-menu">
                                                    <button
                                                        className="action-trigger"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(openMenuId === cat.id ? null : cat.id);
                                                        }}
                                                    >
                                                        Details
                                                    </button>

                                                    {openMenuId === cat.id && (
                                                        <div className="action-dropdown">
                                                            <button
                                                                className="dropdown-item edit"
                                                                onClick={() => {
                                                                    handleEditClick(cat);
                                                                    setOpenMenuId(null);
                                                                }}
                                                            >
                                                                ✏️ Edit
                                                            </button>

                                                            <button
                                                                className="dropdown-item delete"
                                                                onClick={() => {
                                                                    handleDelete(cat.id || cat._id);
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

                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
