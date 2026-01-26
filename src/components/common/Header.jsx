import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../styles/components/header.css";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path ? "nav-link active" : "nav-link";

    return (
        <header className="home-header-nav">
            <div className="header-container">
                <div className="brand-logo" onClick={() => navigate("/home")}>
                    SASTA<span>STORE</span>
                </div>

                <nav className="header-nav-links">
                    <Link to="/home" className={isActive("/home")}>
                        Home
                    </Link>

                    <Link to="/products" className={isActive("/products")}>
                        Products
                    </Link>

                    <Link to="/cart" className={isActive("/cart")}>
                        Cart
                    </Link>

                    <Link to="/favorites" className={isActive("/favorites")}>
                        Favorites
                    </Link>
                    <Link to="/profile" className={isActive("/profile")}>
                        Profile
                    </Link>
                </nav>

                <button
                    className="logout-button"
                    onClick={() => {
                        localStorage.clear();
                        navigate("/login");
                    }}
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
