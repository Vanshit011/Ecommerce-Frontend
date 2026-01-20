import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import "../styles/home.css";

const Home = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts();
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="home-page">
            <nav className="dashboard-nav">
                <div className="logo">SASTA STORE <span>USER</span></div>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>

            <main className="home-content">
                <section className="products-section">
                    <h2 className="section-title">Featured Products</h2>
                    {loading ? (
                        <div className="loading">Loading products...</div>
                    ) : (
                        <div className="products-grid">
                            {products.map((product) => (
                                <div key={product.id} className="product-card">
                                    <div className="product-image">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                        />
                                    </div>
                                    <div className="product-details">
                                        <h3>{product.name}</h3>
                                        <p className="product-desc">{product.description}</p>
                                        <div className="product-footer">
                                            <span className="product-price">₹{product.price}</span>
                                            <button className="add-to-cart-btn">Add to Cart</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Home;
