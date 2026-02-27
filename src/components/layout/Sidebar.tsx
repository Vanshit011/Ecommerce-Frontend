import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [openProducts, setOpenProducts] = useState(true);

  return (
    <aside
      className={`w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed top-0 left-0 z-[100] transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* BRAND & CLOSE */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            navigate("/dashboard");
            setIsOpen(false);
          }}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl flex items-center justify-center font-bold text-lg">
            S
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Sasta Store</h1>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
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
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
        <ul className="flex flex-col gap-1.5">
          {/* OVERVIEW */}
          <li>
            <NavLink
              to="/dashboard"
              end
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-600 font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-slate-100 hover:text-blue-600"
                }`
              }
            >
              <span className="flex items-center justify-center text-base">📊</span>
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
              <span className="ml-auto text-xl">{openProducts ? "▾" : "▸"}</span>
            </button>

            {openProducts && (
              <ul className="pl-9 mt-1 flex flex-col gap-1">
                <li>
                  <NavLink
                    to="/dashboard/products"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm text-slate-600 transition-all ${
                        isActive
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
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm text-slate-600 transition-all ${
                        isActive
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

          {/* ORDERS */}
          <li>
            <NavLink
              to="/dashboard/orders"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-600 font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-slate-100 hover:text-blue-600"
                }`
              }
            >
              <span className="flex items-center justify-center text-base">🧾</span>
              <span className="text-base">Orders</span>
            </NavLink>
          </li>
          {/* CUSTOMERS */}
          <li>
            <NavLink
              to="/dashboard/customers"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-600 font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-slate-100 hover:text-blue-600"
                }`
              }
            >
              <span className="flex items-center justify-center text-base">👥</span>
              <span className="text-base">Customers</span>
            </NavLink>
          </li>
          {/* COUPONS */}
          <li>
            <NavLink
              to="/dashboard/coupons"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-600 font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-slate-100 hover:text-blue-600"
                }`
              }
            >
              <span className="flex items-center justify-center text-base">🏷️</span>
              <span className="text-base">Coupons</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* FOOTER - Removed Logout */}
    </aside>
  );
};

export default Sidebar;
