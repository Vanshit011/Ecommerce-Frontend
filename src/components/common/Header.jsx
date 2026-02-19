import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../../services/api";
import { useCart } from "../../context/CartContext.jsx";

const Header = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const profileRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildCategoryTree = (cats) => {
    const tree = cats.filter((cat) => {
      const hasNoParent =
        !cat.parentId &&
        (!cat.parent || (typeof cat.parent === "object" && !cat.parent.id && !cat.parent._id));
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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories();
        const data =
          res?.data?.data || res?.data?.categories || (Array.isArray(res?.data) ? res.data : []);

        // Build category tree
        const tree = buildCategoryTree(data);

        // Flatten single root: If only 1 root exists, show its children as top-level
        if (tree.length === 1 && tree[0].children && tree[0].children.length > 0) {
          setCategories(tree[0].children);
        } else {
          setCategories(tree);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadCategories();
  }, []); // Only once on mount

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
  };

  return (
    <header className="relative z-50 bg-blue-600 shadow-md transition-all duration-300 border-b border-blue-700">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        {/* LOGO */}
        <div
          onClick={() => navigate("/home")}
          className="cursor-pointer group flex items-center gap-2"
        >
          <div className="flex flex-col">
            <span className="text-xl font-black italic tracking-tighter text-white leading-none">
              SASTA<span className="text-blue-100">STORE</span>
            </span>
            <span className="text-[10px] text-blue-100 font-bold italic tracking-wider leading-none mt-0.5">
              Explore <span className="text-yellow-400">Plus</span>
            </span>
          </div>
        </div>

        {/* SEARCH BAR */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xl shadow-sm rounded-sm overflow-hidden"
        >
          <div className="relative w-full group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands and more"
              className="w-full px-4 py-2.5 bg-white border-none focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 text-sm h-9"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* NAVIGATION & ACTIONS */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/home"
              className="text-white font-bold text-sm hover:underline underline-offset-4"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-white font-bold text-sm hover:underline underline-offset-4"
            >
              Shop
            </Link>
            {!token && (
              <Link
                to="/login"
                className="text-white font-bold text-sm hover:underline underline-offset-4"
              >
                Become a Seller
              </Link>
            )}
          </nav>

          {/* PROFILE DROPDOWN */}
          <div
            className="relative group"
            ref={profileRef}
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
          >
            <button
              onClick={() => navigate("/login")}
              className={`flex items-center gap-2 px-6 py-1.5 rounded-sm transition-all font-bold text-sm ${token ? "text-white" : "bg-white text-blue-600"}`}
            >
              {token ? "Account" : "Login"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showProfileMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-64 z-50 animate-fade-in pointer-events-auto">
                {/* Triangle Tip */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>

                <div className="bg-white shadow-2xl overflow-hidden rounded-sm border border-slate-100">
                  {!token ? (
                    <div className="px-5 py-4 flex justify-between items-center border-b border-slate-100">
                      <span className="text-sm font-medium text-slate-800">New customer?</span>
                      <Link
                        to="/register"
                        className="text-sm font-bold text-blue-600 hover:underline"
                      >
                        Sign Up
                      </Link>
                    </div>
                  ) : (
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Welcome Back
                      </p>
                    </div>
                  )}

                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      My Profile
                    </Link>

                    {token && (
                      <>
                        <Link
                          to="/favorites"
                          className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          Favorites
                        </Link>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CART ICON */}
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-white font-bold text-sm"
          >
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-600 text-[10px] font-black rounded-full min-w-[16px] h-[16px] flex items-center justify-center border-2 border-blue-600">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline">Cart</span>
          </button>
        </div>
      </div>

      {/* CATEGORY NAV */}
      {categories.length > 0 && (
        <div className="hidden md:block bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-10 py-3">
            {categories.map((category) => {
              const catId = category.id || category._id;
              const hasChildren = category.children && category.children.length > 0;

              return (
                <div key={catId} className="relative group">
                  <button
                    onClick={() => handleCategoryClick(catId)}
                    className="text-sm font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                  >
                    {category.name}
                    {hasChildren && (
                      <svg
                        className="h-3 w-3 opacity-50 group-hover:rotate-180 transition-transform"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  {/* DROPDOWN */}
                  {hasChildren && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] z-50">
                      <div className="bg-white shadow-xl border border-slate-100 rounded-sm py-2">
                        {category.children.map((child) => {
                          const childId = child.id || child._id;
                          return (
                            <button
                              key={childId}
                              onClick={() => handleCategoryClick(childId)}
                              className="block w-full text-left px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                            >
                              {child.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MOBILE SEARCH */}
      <form onSubmit={handleSearch} className="md:hidden px-4 pb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2.5 bg-white border border-transparent rounded-sm focus:outline-none transition-all text-sm font-medium shadow-sm"
          />
        </div>
      </form>
    </header>
  );
};

export default Header;
