import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../../styles/components/admin-layout.css';

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <h2 className="page-title">Admin Dashboard</h2>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span>Admin</span>
                            <div className="avatar">A</div>
                        </div>
                    </div>
                </header>
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
