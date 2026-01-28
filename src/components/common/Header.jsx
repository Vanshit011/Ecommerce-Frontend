import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "text-yellow-400 border-b-2 border-yellow-400"
      : "text-white hover:text-yellow-300";

  return (
    <header className="sticky top-0 z-50 bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* LOGO */}
        <div
          onClick={() => navigate("/home")}
          className="cursor-pointer text-2xl font-bold tracking-wide text-white"
        >
          SASTA<span className="text-yellow-400">STORE</span>
        </div>

        {/* NAV LINKS */}
        <nav className="hidden md:flex gap-6 font-medium">
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

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;
