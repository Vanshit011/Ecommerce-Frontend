import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { getMyProducts, createProduct, updateProduct, deleteProduct, getCategories } from "../../services/api";
import "../../styles/pages/admin/admin-products.css";

const AdminProducts = () => {
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditingId, setIsEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const initialForm = { name: "", description: "", price: "", image: null, category: "" };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);


    useEffect(() => {
        fetchProducts();
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

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await getMyProducts();
            setProducts(res.data);
        } catch (err) {
            console.error("Fetch Error:", err);
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
        <div className="admin-products-page">
            <div className="page-header">
                <div>
                    <h1>Products List</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage your store's inventory and product details.</p>
                </div>
                <button className="add-btn" onClick={() => { setIsEditingId(null); setFormData(initialForm); setShowModal(true); }}>
                    + Add Product
                </button>
            </div>

            <div className="table-container card">
                {loading ? (
                    <div className="loader-wrapper">
                        <div className="spinner"></div>
                        <p>Loading inventory...</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-msg">No products found.</td>
                                </tr>
                            ) : (
                                products.map(p => (
                                    <tr key={p.id || p._id}>
                                        <td>
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                className="table-img clickable"
                                                onClick={() => setPreviewImage(p.image)}
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/50";
                                                }}
                                            />

                                        </td>
                                        <td className="font-semibold">{p.name}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                backgroundColor: '#f1f5f9',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                color: 'var(--text-muted)'
                                            }}>
                                                {(() => {
                                                    const catId = p.categoryId;
                                                    return categories.find(c => String(c.id || c._id) === String(catId))?.name || "Uncategorized";
                                                })()}
                                            </span>
                                        </td>
                                        <td>₹{p.price}</td>
                                        <td className="text-muted">{p.description?.substring(0, 50)}...</td>
                                        <td>
                                            <div className="action-menu">
                                                <button
                                                    className="action-trigger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === p.id ? null : p.id);
                                                    }}
                                                >
                                                    Details
                                                </button>

                                                {openMenuId === p.id && (
                                                    <div className="action-dropdown">
                                                        <button
                                                            className="dropdown-item edit"
                                                            onClick={() => {
                                                                handleEditClick(p);
                                                                setOpenMenuId(null);
                                                            }}
                                                        >
                                                            ✏️ Edit
                                                        </button>

                                                        <button
                                                            className="dropdown-item delete"
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
                )}
            </div>

            {previewImage && (
                <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
                    <div
                        className="image-preview-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={previewImage} alt="Preview" />
                        <button
                            className="close-preview"
                            onClick={() => setPreviewImage(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}


            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <h2>{isEditingId ? "Edit Product" : "Add New Product"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Price (₹)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Image</label>
                                    <input type="file" name="image" onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        outline: 'none',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id || cat._id} value={cat.id || cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
                                <button
                                    type="submit"
                                    className={`primary-btn ${isSubmitting ? "loading" : ""}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="btn-spinner"></span>
                                            Processing
                                        </>
                                    ) : isEditingId ? (
                                        "Update Product"
                                    ) : (
                                        "Add Product"
                                    )}
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
