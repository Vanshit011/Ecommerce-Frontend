import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import Sidebar from "./Sidebar";

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 lg:ml-64 flex flex-col w-full min-w-0">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="p-4 lg:p-10 flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
