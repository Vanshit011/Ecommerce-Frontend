// @ts-nocheck
import React from "react";

const OrderTable = ({ orders, loading, setViewOrder, meta, page, setPage, limit, setLimit }) => {
  if (loading) {
    return (
      <div className="h-60 flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "CONFIRMED":
        return "bg-cyan-100 text-cyan-700";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      case "RETURNED":
        return "bg-slate-200 text-slate-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-x-auto scrollbar-hide">
        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No orders found.
            </div>
          ) : (
            orders.map((order) => {
              // Normalize fields
              const date = order.createdAt || order.created_at;

              // Check for payment status
              let paymentStatusRaw = order.paymentStatus || order.payment_status || "unpaid";
              if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
                const successfulPayment = order.payments.find(
                  (p) =>
                    p.status === "succeeded" || p.status === "completed" || p.status === "paid",
                );
                paymentStatusRaw = successfulPayment
                  ? successfulPayment.status
                  : order.payments[0].status;
              } else if (order.payment?.status) {
                paymentStatusRaw = order.payment.status;
              }

              let paymentStatus = String(paymentStatusRaw).toUpperCase();
              if (order.isPaid === true) paymentStatus = "PAID";

              const isPaid =
                paymentStatus === "PAID" ||
                paymentStatus === "SUCCEEDED" ||
                paymentStatus === "SUCCESS" ||
                paymentStatus === "COMPLETED";

              let statusRaw = order.status || order.orderStatus || order.order_status || "PENDING";
              const status = String(statusRaw).toUpperCase();
              const id = order.id || order._id;

              return (
                <div
                  key={id}
                  onClick={() => setViewOrder(order)}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-mono text-xs text-slate-500">
                        #{id.substring(0, 8).toUpperCase()}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm">
                        {order.userId?.name || order.user?.name || "Guest"}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm text-slate-500 mb-3">
                    <span>{date ? new Date(date).toLocaleDateString() : "N/A"}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${isPaid ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
                    >
                      {paymentStatus}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-800">
                      ₹{(order.total_amount || order.totalAmount || 0).toLocaleString()}
                    </span>
                    <button
                      className="text-xs font-bold text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewOrder(order);
                      }}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  // Normalize fields
                  const date = order.createdAt || order.created_at;

                  // Check for payment status in various locations, including the payments array
                  let paymentStatusRaw = order.paymentStatus || order.payment_status || "unpaid";

                  if (
                    order.payments &&
                    Array.isArray(order.payments) &&
                    order.payments.length > 0
                  ) {
                    // Try to find a successful payment first
                    const successfulPayment = order.payments.find(
                      (p) =>
                        p.status === "succeeded" || p.status === "completed" || p.status === "paid",
                    );
                    paymentStatusRaw = successfulPayment
                      ? successfulPayment.status
                      : order.payments[0].status;
                  } else if (order.payment?.status) {
                    paymentStatusRaw = order.payment.status;
                  }

                  let paymentStatus = String(paymentStatusRaw).toUpperCase();

                  // Check boolean flag
                  if (order.isPaid === true) paymentStatus = "PAID";

                  const isPaid =
                    paymentStatus === "PAID" ||
                    paymentStatus === "SUCCEEDED" ||
                    paymentStatus === "SUCCESS" ||
                    paymentStatus === "COMPLETED";

                  let statusRaw =
                    order.status || order.orderStatus || order.order_status || "PENDING";
                  const status = String(statusRaw).toUpperCase();
                  const id = order.id || order._id;

                  return (
                    <tr
                      key={id}
                      className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setViewOrder(order)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-slate-500">
                          #{id.substring(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm">
                            {order.userId?.name || order.user?.name || "Guest"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {order.userId?.email || order.user?.email || "No Email"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-600">
                          {date ? new Date(date).toLocaleDateString() : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">
                          ₹{(order.total_amount || order.totalAmount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${isPaid ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
                        >
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(status)}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewOrder(order);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Section */}
      {meta &&
        (() => {
          const totalItems = meta.total || meta.totalItems || meta.count || 0;
          const totalPages =
            meta.totalPages || meta.pageCount || Math.ceil(totalItems / (limit || 10)) || 1;

          if (totalItems === 0) return null;

          return (
            <div className="mt-auto px-10 py-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/20">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Rows:
                  </span>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all shadow-sm"
                  >
                    {[5, 10, 20, 50].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt} per page
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing <span className="text-slate-800">{(page - 1) * limit + 1}</span>-
                  <span className="text-slate-800">{Math.min(page * limit, totalItems)}</span> of{" "}
                  <span className="text-slate-800">{totalItems}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 font-black text-xs transition-all ${
                            page === pageNum
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                              : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600 hover:bg-slate-50"
                          }`}
                        >
                          {String(pageNum).padStart(2, "0")}
                        </button>
                      );
                    } else if (pageNum === 2 || pageNum === totalPages - 1) {
                      return (
                        <span key={pageNum} className="px-1 text-slate-400 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default OrderTable;
