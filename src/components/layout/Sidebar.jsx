import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const [openProducts, setOpenProducts] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed top-0 left-0 z-[100]">
      {/* BRAND */}
      <div
        className="flex items-center gap-3 px-6 py-6 border-b border-slate-200 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl flex items-center justify-center font-black text-lg">
          S
        </div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          Sasta Store
        </h1>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1.5">
          {/* OVERVIEW */}
          <li>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-600 font-medium transition-all ${isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "hover:bg-slate-100 hover:text-blue-600"
                }`
              }
            >
              <span className="flex items-center justify-center text-base">
                📊
              </span>
              <span className="text-base">Overview</span>
            </NavLink>
          </li>

          {/* PRODUCTS DROPDOWN */}
          <li className="flex flex-col">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-none cursor-pointer font-medium text-slate-600 rounded-xl text-base hover:bg-slate-100 hover:text-blue-600 transition-all"
              onClick={() => setOpenProducts(!openProducts)}
            >
              <span className="flex items-center justify-center">📦</span>
              <span className="text-base">Products</span>
              <span className="ml-auto text-xl">
                {openProducts ? "▾" : "▸"}
              </span>
            </button>

            {openProducts && (
              <ul className="pl-9 mt-1 flex flex-col gap-1">
                <li>
                  <NavLink
                    to="/dashboard/products"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm text-slate-600 transition-all ${isActive
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-slate-50 hover:text-blue-600"
                      }`
                    }
                  >
                    All Products
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/categories"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm text-slate-600 transition-all ${isActive
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-slate-50 hover:text-blue-600"
                      }`
                    }
                  >
                    Categories
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="px-4 py-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-transparent border-none text-base font-semibold text-red-600 cursor-pointer transition-all hover:bg-red-50"
        >
          ➜ Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
