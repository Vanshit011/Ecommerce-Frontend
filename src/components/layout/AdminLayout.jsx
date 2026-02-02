import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col">
                <header className="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                            Admin Dashboard
                        </h2>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-600">Admin</span>
                            <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                A
                            </div>
                        </div>
                    </div>
                </header>
                <div className="p-10 flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
