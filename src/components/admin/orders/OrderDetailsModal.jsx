import React, { useState } from "react";
import { updateOrderStatus } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import { getImageUrl } from "../../../utils/imageUtils";

const OrderDetailsModal = ({ viewOrder, setViewOrder, onOrderUpdated }) => {
    const { showToast } = useToast();
    const [updating, setUpdating] = useState(false);

    if (!viewOrder) return null;

    // Normalize fields for robust display
    const id = viewOrder.id || viewOrder._id;
    const rawStatus = viewOrder.status || viewOrder.orderStatus || viewOrder.order_status || 'PENDING';
    const status = String(rawStatus).toUpperCase();

    // Check for payment status in various locations, including the payments array
    let paymentStatusRaw = viewOrder.paymentStatus || viewOrder.payment_status || 'unpaid';

    if (viewOrder.payments && Array.isArray(viewOrder.payments) && viewOrder.payments.length > 0) {
        // Try to find a successful payment first
        const successfulPayment = viewOrder.payments.find(p => p.status === 'succeeded' || p.status === 'completed' || p.status === 'paid');
        paymentStatusRaw = successfulPayment ? successfulPayment.status : viewOrder.payments[0].status;
    } else if (viewOrder.payment?.status) {
        paymentStatusRaw = viewOrder.payment.status;
    }

    let paymentStatus = String(paymentStatusRaw).toUpperCase();

    if (viewOrder.isPaid) paymentStatus = 'PAID';

    const isPaid = paymentStatus === 'PAID' || paymentStatus === 'SUCCEEDED' || paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED';

    const handleStatusUpdate = async (newStatus) => {
        try {
            setUpdating(true);
            const res = await updateOrderStatus(id, newStatus);
            showToast("Order status updated successfully", "success");
            // Update local view by MERGING to preserve items, address, and user info
            const newOrderData = res.data?.order || res.data;
            if (newOrderData) {
                const mergedOrder = { ...viewOrder, ...newOrderData, status: (newOrderData.status || newOrderData.orderStatus || newStatus).toUpperCase() };
                setViewOrder(mergedOrder);
                if (onOrderUpdated) onOrderUpdated(mergedOrder);
            } else {
                const updatedObj = { ...viewOrder, status: newStatus.toUpperCase(), orderStatus: newStatus.toUpperCase() };
                setViewOrder(updatedObj);
                if (onOrderUpdated) onOrderUpdated(updatedObj);
            }
        } catch (error) {
            console.error("Failed to update status", error);
            showToast(error.response?.data?.message || "Failed to update status", "error");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (s) => {
        const statusKey = String(s || '').toUpperCase();
        switch (statusKey) {
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'CONFIRMED': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
            case 'SHIPPED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-slate-800">Order Details</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                                {status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-mono">#{id}</p>
                    </div>
                    <button
                        onClick={() => setViewOrder(null)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Status Control */}
                        <div className="md:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Update Order Status</h3>
                                <p className="text-xs text-slate-500">Change the current status of this order.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'failed'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusUpdate(s)}
                                        disabled={updating || status.toLowerCase() === s.toLowerCase()}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status.toLowerCase() === s.toLowerCase()
                                            ? 'bg-slate-800 text-white cursor-default'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                                            }`}
                                    >
                                        <span className="capitalize">{s}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="p-4 rounded-xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Customer</h3>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                    {(viewOrder.userId?.name || viewOrder.user?.name || "G").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{viewOrder.userId?.name || viewOrder.user?.name || "Guest"}</p>
                                    <p className="text-xs text-slate-500">{viewOrder.userId?.email || viewOrder.user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="p-4 rounded-xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Shipping Address</h3>
                            {viewOrder.address ? (
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p className="font-semibold text-slate-800">
                                        {viewOrder.address.fullName || viewOrder.address.fullname || viewOrder.address.name}
                                    </p>
                                    <p>
                                        {viewOrder.address.streetAddress || viewOrder.address.addressLine1 || viewOrder.address.addressline1}
                                    </p>
                                    {(viewOrder.address.addressLine2 || viewOrder.address.addressline2) && (
                                        <p>{viewOrder.address.addressLine2 || viewOrder.address.addressline2}</p>
                                    )}
                                    <p>
                                        {viewOrder.address.city}, {viewOrder.address.state} {viewOrder.address.zipCode || viewOrder.address.postalCode || viewOrder.address.postalcode}
                                    </p>
                                    <p>{viewOrder.address.country}</p>
                                    <p className="text-xs mt-2">
                                        📞 {viewOrder.address.phone || viewOrder.address.phoneNumber || viewOrder.user?.mobile || viewOrder.userId?.mobile || "N/A"}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No shipping address provided.</p>
                            )}
                        </div>

                        {/* Payment Info */}
                        <div className="p-4 rounded-xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Payment</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Method</span>
                                    <span className="text-sm font-semibold text-slate-800 uppercase">{viewOrder.paymentMethod || "Card"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Status</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {paymentStatus}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-2 mt-1">
                                    <span className="text-sm font-bold text-slate-800">Total</span>
                                    <span className="text-sm font-bold text-slate-800">₹{viewOrder.totalAmount?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-4 border-l-4 border-blue-500 pl-2">Order Items ({viewOrder.items?.length || 0})</h3>
                        <div className="space-y-3">
                            {viewOrder.items?.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                    <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                                        <img
                                            src={getImageUrl(item.product)}
                                            alt={item.product?.name || "Product"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.product?.name || "Unknown Product"}</h4>
                                        <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1 items-center">
                                            <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                Qty: {item.quantity}
                                            </span>
                                            {item.size && (
                                                <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                                                    Size: {item.size}
                                                </span>
                                            )}
                                            {item.color && (
                                                <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                                                    Color: {item.color}
                                                </span>
                                            )}
                                            <span>•</span>
                                            <span>Price: ₹{item.price}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
                    <button
                        onClick={() => setViewOrder(null)}
                        className="px-6 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
