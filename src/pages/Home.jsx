import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import "../styles/home.css";

const Home = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);
                setProducts(prodRes.data || []);
                setCategories(catRes.data || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="home-page">
            <nav className="home-navbar">
                <div className="logo">SASTA <span>STORE</span></div>
                <div className="nav-links" style={{ display: 'flex', gap: '30px' }}>
                    <a href="#" className="active">Home</a>
                    <a href="#">Shop</a>
                    <a href="#">About</a>
                </div>
                <button className="logout-btn" style={{ background: '#f1f5f9', color: 'black', padding: '10px 20px', borderRadius: '8px', fontWeight: '600' }} onClick={handleLogout}>Logout</button>
            </nav>

            <main className="home-content">
                <header className="section-header">
                    <h1 className="section-title">New Arrivals</h1>
                    <p className="section-subtitle">Discover our latest premium products collection.</p>
                </header>

                <section className="products-section">
                    {loading ? (
                        <div className="loading" style={{ textAlign: 'center', padding: '100px' }}>
                            <div className="loader">Searching for best products...</div>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.length === 0 ? (
                                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>No products available at the moment.</p>
                            ) : (
                                products.map((product) => (
                                    <div key={product.id || product._id} className="product-card">
                                        <div className="product-image">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Premium+Product'; }}
                                            />
                                        </div>
                                        <div className="product-details">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h3>{product.name}</h3>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    backgroundColor: '#f1f5f9',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    color: '#64748b',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {(() => {
                                                        const catId = product.categoryId || product.category?.id || product.category?._id || product.category;
                                                        return categories.find(c => String(c.id || c._id) === String(catId))?.name || "Premium";
                                                    })()}
                                                </span>
                                            </div>
                                            <p className="product-desc">{product.description}</p>
                                            <div className="product-footer">
                                                <span className="product-price">₹{product.price}</span>
                                                <button className="add-to-cart-btn">Add to Bag</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Home;
