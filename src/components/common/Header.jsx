import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCart, getCategories } from "../../services/api";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const profileRef = useRef(null);

  useEffect(() => {
    loadCart();
    loadCategories();
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

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      const data =
        res?.data?.data ||
        res?.data?.categories ||
        (Array.isArray(res?.data) ? res.data : []);

      // Build category tree
      const tree = buildCategoryTree(data);
      setCategories(tree);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const buildCategoryTree = (cats) => {
    const tree = cats.filter((cat) => {
      const hasNoParent =
        !cat.parentId &&
        (!cat.parent ||
          (typeof cat.parent === "object" &&
            !cat.parent.id &&
            !cat.parent._id));
      return hasNoParent;
    });

    const attachChildren = (parent) => {
      const children = cats.filter((cat) => {
        const parentIdMatch = cat.parentId === (parent.id || parent._id);
        const parentObjMatch =
          cat.parent &&
          typeof cat.parent === "object" &&
          (cat.parent.id === (parent.id || parent._id) ||
            cat.parent._id === (parent.id || parent._id));
        return parentIdMatch || parentObjMatch;
      });

      if (children.length > 0) {
        parent.children = children.map((child) => attachChildren({ ...child }));
      }
      return parent;
    };

    return tree.map((cat) => attachChildren({ ...cat }));
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

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
    setHoveredCategory(null);
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

      {/* CATEGORY MEGA MENU */}
      {categories.length > 0 && (
        <div className="hidden md:block bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1">
              {categories.map((category) => {
                const catId = category.id || category._id;
                const hasChildren = category.children && category.children.length > 0;

                return (
                  <div
                    key={catId}
                    className="relative"
                    onMouseEnter={() => hasChildren && setHoveredCategory(catId)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <button
                      onClick={() => handleCategoryClick(catId)}
                      className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-white transition-colors flex items-center gap-1"
                    >
                      {category.name}
                      {hasChildren && <span className="text-xs">▼</span>}
                    </button>

                    {/* DROPDOWN */}
                    {hasChildren && hoveredCategory === catId && (
                      <div className="absolute left-0 top-full mt-0 bg-white shadow-lg border border-gray-200 rounded-b-lg min-w-[200px] py-2 z-50">
                        {category.children.map((child) => {
                          const childId = child.id || child._id;
                          return (
                            <button
                              key={childId}
                              onClick={() => handleCategoryClick(childId)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              {child.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
