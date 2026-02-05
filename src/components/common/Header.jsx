import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCategories } from "../../services/api";
import { useCart } from "../../context/CartContext";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const profileRef = useRef(null);

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
    <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-6">
        {/* LOGO */}
        <div
          onClick={() => navigate("/home")}
          className="cursor-pointer group flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-all duration-300 group-hover:scale-105">
            <span className="font-black text-xl">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
              SASTA<span className="text-blue-600">STORE</span>
            </span>
          </div>
        </div>

        {/* SEARCH BAR */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-lg transition-all duration-300 focus-within:max-w-xl focus-within:translate-x-2"
        >
          <div className="relative w-full group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="w-full px-5 py-3 pl-12 bg-slate-100/50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-200 transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* NAVIGATION & ACTIONS */}
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-1 mr-4">
            <Link
              to="/home"
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                location.pathname === "/home"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                location.pathname === "/products"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Shop
            </Link>
          </nav>

          <div className="h-8 w-[1px] bg-slate-200 hidden md:block mx-1"></div>

          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-3 px-2 py-1.5 pr-3 rounded-xl transition-all border ${showProfileMenu ? "bg-blue-50 border-blue-200 shadow-inner" : "bg-white border-transparent hover:bg-slate-50"}`}
            >
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="hidden lg:block text-left">
                <span className="block text-xs font-bold text-slate-400 leading-none mb-0.5">
                  Account
                </span>
                <span className="block text-sm font-bold text-slate-700 leading-none">Profile</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
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
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 animate-fade-in origin-top-right z-50">
                <div className="px-4 py-3 border-b border-slate-50 mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Welcome Back
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-slate-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 opacity-70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  My Profile
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-slate-600 font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 opacity-70"
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

                <div className="my-2 border-t border-slate-50"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl width-[calc(100%-1rem)] text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 opacity-70"
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
              </div>
            )}
          </div>

          {/* CART ICON */}
          <button
            onClick={() => navigate("/cart")}
            className="relative group flex items-center justify-center w-12 h-12 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
          >
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-600 group-hover:text-blue-600 transition-colors"
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
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-blue-600/20">
                  {cartCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* CATEGORY MEGA MENU */}
      {categories.length > 0 && (
        <div className="hidden md:block bg-white/50 backdrop-blur-sm border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 flex-wrap py-1">
              {categories.map((category) => {
                const catId = category.id || category._id;
                const hasChildren = category.children && category.children.length > 0;

                return (
                  <div key={catId} className="relative group h-full flex items-center">
                    <button
                      onClick={() => handleCategoryClick(catId)}
                      className="px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-lg text-slate-500 hover:text-blue-600 group-hover:text-blue-600"
                    >
                      {category.name}
                      {hasChildren && (
                        <span className="text-[10px] transition-transform duration-200 group-hover:rotate-180">
                          ▼
                        </span>
                      )}
                    </button>

                    {/* DROPDOWN - CSS Based Hover */}
                    {hasChildren && (
                      <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[240px] z-50">
                        <div className="bg-white/95 backdrop-blur-xl shadow-xl shadow-slate-200/50 border border-slate-100 rounded-2xl p-2">
                          <div className="mb-2 px-3 py-2 border-b border-slate-50">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {category.name}
                            </span>
                          </div>
                          {category.children.map((child) => {
                            const childId = child.id || child._id;
                            return (
                              <button
                                key={childId}
                                onClick={() => handleCategoryClick(childId)}
                                className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between group/item"
                              >
                                {child.name}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-blue-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
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
            className="w-full px-5 py-3 pl-11 bg-slate-100 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-sm font-medium shadow-inner"
          />
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>
    </header>
  );
};

export default Header;
