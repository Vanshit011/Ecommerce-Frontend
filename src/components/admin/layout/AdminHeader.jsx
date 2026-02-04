import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getProfile } from '../../../services/api';
import AdminProfileModal from '../profile/AdminProfileModal';

const AdminHeader = ({ onMenuClick }) => {
    const location = useLocation();
    const [adminName, setAdminName] = useState("Admin");
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        const fetchName = async () => {
            try {
                const res = await getProfile();
                const user = res.data.user || res.data;
                if (user?.name) setAdminName(user.name);
            } catch (err) {
                console.error("Header profile fetch error", err);
            }
        };
        fetchName();
    }, []);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard/products')) return 'Products';
        if (path.includes('/dashboard/orders')) return 'Orders';
        if (path.includes('/dashboard/categories')) return 'Categories';
        if (path.includes('/dashboard/customers')) return 'Customers';
        return 'Dashboard Overview';
    };

    return (
        <>
            <header className="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 shadow-sm/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h2 className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight">
                        {getPageTitle()}
                    </h2>
                </div>

                <div
                    className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-200 transition-all group"
                    onClick={() => setShowProfile(true)}
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white group-hover:scale-105 transition-transform">
                        {adminName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-700">{adminName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400 group-hover:text-blue-500 hidden sm:block">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </header>

            {showProfile && (
                <AdminProfileModal onClose={() => setShowProfile(false)} />
            )}
        </>
    );
};

export default AdminHeader;
