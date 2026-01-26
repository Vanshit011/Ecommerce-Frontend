import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/components/sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [openProducts, setOpenProducts] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* BRAND */}
      <div className="sidebar-brand" onClick={() => navigate("/dashboard")}>
        <div className="brand-icon">S</div>
        <h1>Sasta Store</h1>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        <ul>
          {/* OVERVIEW */}
          <li>
            <NavLink to="/dashboard" end>
              <span className="icon-wrapper">📊</span>
              <span className="label">Overview</span>
            </NavLink>
          </li>

          {/* PRODUCTS DROPDOWN */}
          <li className={`dropdown ${openProducts ? "open" : ""}`}>
            <button
              className="dropdown-trigger"
              onClick={() => setOpenProducts(!openProducts)}
            >
              <span className="icon-wrapper">📦</span>
              <span className="label">Products</span>
              <span className="chevron">{openProducts ? "▾" : "▸"}</span>
            </button>

            {openProducts && (
              <ul className="dropdown-menu">
                <li>
                  <NavLink to="/dashboard/products">
                    All Products
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/categories">
                    Categories
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          [➜ Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
