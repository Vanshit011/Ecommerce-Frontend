import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProducts, createProduct, updateProduct, deleteProduct } from "../services/api";
import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditingId, setIsEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const initialForm = { name: "", description: "", price: "", image: null };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getMyProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
    finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleEditClick = (product) => {
    setFormData({ ...product, image: null });
    setIsEditingId(product.id || product._id);
    setShowModal(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      if (isEditingId) {
        await updateProduct(isEditingId, data);
        showToast("✓ Product Updated!");
      } else {
        await createProduct(data);
        showToast("✓ Product Added Successfully!");
      }
      setShowModal(false);
      setFormData(initialForm);
      setIsEditingId(null);
      fetchProducts();
    } catch (err) {
      alert("Error saving product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* SUCCESS TOAST MESSAGE */}
      {toast.show && <div className="toast-notification">{toast.message}</div>}

      <nav className="dashboard-nav">
        <div className="logo">SASTA STORE <span>ADMIN</span></div>
        <div className="nav-actions">
          <button className="shop-view-btn" onClick={() => navigate("/home")}>
            View Shop 🛒
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-main">
        <header className="content-header">
          <h1>Inventory Management</h1>
          <button className="add-btn" onClick={() => { setIsEditingId(null); setFormData(initialForm); setShowModal(true); }}>
            + Add New Product
          </button>
        </header>

        <main className="inventory-box">
          {loading ? (
            <div className="loader">Updating Inventory...</div>
          ) : (
            <div className="product-grid-container">
              {products.length === 0 && <p className="empty-msg">No products in store.</p>}

              {products.map(p => (
                <div key={p.id || p._id} className="product-card">
                  <div className="card-image-wrapper">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="card-img"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                  </div>

                  <div className="card-details">
                    <h4>{p.name}</h4>
                    <p className="card-price">₹{p.price}</p>
                    <p className="card-desc">{p.description?.substring(0, 30)}...</p>
                  </div>

                  <div className="card-actions">
                    <button onClick={() => handleEditClick(p)} className="edit-btn-small">Edit</button>
                    <button onClick={() => {
                      if (window.confirm("Delete this product?")) {
                        deleteProduct(p.id || p._id).then(() => { fetchProducts(); showToast("Product Removed"); });
                      }
                    }} className="del-btn-small">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MODAL POPUP */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditingId ? "Edit Product" : "Add New Product"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input type="file" name="image" onChange={handleChange} />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="save-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : (isEditingId ? "Update Product" : "Add Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;