import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCart } from "../../services/api";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    loadCart();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCart = async () => {
    try {
      const res = await getCart();
      const items = res.data?.items || [];
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* LOGO */}
        <div
          onClick={() => navigate("/home")}
          className="cursor-pointer text-xl font-bold tracking-wide flex-shrink-0"
        >
          SASTA<span className="text-blue-600">STORE</span>
        </div>

        {/* SEARCH BAR */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md"
        >
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
            >
              🔍
            </button>
          </div>
        </form>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/home"
            className={`font-medium ${location.pathname === "/home"
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
              }`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`font-medium ${location.pathname === "/products"
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
              }`}
          >
            Products
          </Link>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-2xl">👤</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </Link>
                <Link
                  to="/my-orders"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  My Orders
                </Link>
                <Link
                  to="/my-payments"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  My Payments
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Favorites
                </Link>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* CART ICON WITH BADGE - CLICK TO OPEN CART PAGE */}
          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
          >
            🔍
          </button>
        </div>
      </form>
    </header>
  );
};

export default Header;
