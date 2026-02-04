import React from "react";
import { Link } from "react-router-dom";

const CustomerDetailsModal = ({ customer, onClose }) => {
    if (!customer) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            PENDING: "bg-amber-100 text-amber-700",
            CONFIRMED: "bg-blue-100 text-blue-700",
            PROCESSING: "bg-indigo-100 text-indigo-700",
            SHIPPED: "bg-purple-100 text-purple-700",
            DELIVERED: "bg-green-100 text-green-700",
            CANCELLED: "bg-red-100 text-red-700",
            FAILED: "bg-rose-100 text-rose-700",
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${styles[status] || "bg-slate-100 text-slate-600"}`}>
                {status}
            </span>
        );
    };

    const [orderPage, setOrderPage] = React.useState(1);
    const [statusFilter, setStatusFilter] = React.useState("ALL");
    const itemsPerPage = 5;

    // Filtered & Paginated Orders
    const filteredOrders = React.useMemo(() => {
        if (!customer.orders) return [];
        let result = customer.orders;
        if (statusFilter !== "ALL") {
            result = result.filter(o =>
                (o.orderStatus || o.status || "").toUpperCase() === statusFilter
            );
        }
        return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [customer.orders, statusFilter]);

    const paginatedOrders = React.useMemo(() => {
        const start = (orderPage - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    }, [filteredOrders, orderPage]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-fadeIn" onClick={e => e.stopPropagation()}>
                {/* HEADER */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-200">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{customer.name}</h2>
                            <p className="text-sm text-slate-500">Customer ID: {customer.id.slice(0, 8)}...</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* INFO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">📧</div>
                                    <span className="text-slate-700 font-medium">{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">📱</div>
                                    <span className="text-slate-700 font-medium">{customer.mobile}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">📍</div>
                                    <span className="text-slate-700 font-medium">{customer.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Lifetime Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl font-bold text-blue-700">{customer.totalOrders}</div>
                                    <div className="text-xs text-blue-600 font-medium opacity-80">Total Orders</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-700">{formatCurrency(customer.totalSpent)}</div>
                                    <div className="text-xs text-blue-600 font-medium opacity-80">Total Spent</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ORDER HISTORY */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span>📜</span> Order History
                            </h3>

                            {/* STATUS FILTER */}
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setOrderPage(1); }}
                                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">Order ID</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Items</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedOrders.length > 0 ? (
                                        paginatedOrders.map(order => (
                                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-xs font-mono text-slate-500">#{order.id.slice(0, 8)}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{formatDate(order.created_at)}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {order.items?.length || 0} Items
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-slate-700">{formatCurrency(order.totalAmount)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <StatusBadge status={order.orderStatus || order.status} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-4 text-center text-slate-400 text-sm">No orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <button
                                    onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                                    disabled={orderPage === 1}
                                    className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span>Page {orderPage} of {totalPages}</span>
                                <button
                                    onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}
                                    disabled={orderPage === totalPages}
                                    className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsModal;
