import React, { useState, useEffect, useCallback } from "react";
import { getMyOrders, cancelMyOrder } from "../../../services/api";

import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUtils";
import { Order } from "../../../types";

const MyOrders: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      setCancelLoading(true);

      await cancelMyOrder(selectedOrder.id || selectedOrder._id);

      showToast("Order cancelled successfully", "success");

      closeModal();
      loadOrders();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to cancel order", "error");
    } finally {
      setCancelLoading(false);
    }
  };

  const loadOrders = useCallback(async () => {
    try {
      const res = await getMyOrders();
      // res.data is expected to be ApiResponse<Order[]>, where res.data.data is the Order[]
      const orderList = res.data?.data || (res.data as any) || [];
      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading)
    return (
      <>
        <div className="p-10 text-center text-gray-500">Loading your orders...</div>
      </>
    );

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[280px_1fr] gap-8">
        {/* SIDEBAR */}
        <aside className="h-fit sticky top-24 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
            <h3 className="font-black text-slate-900 text-lg mb-6 px-2 tracking-tight">Account</h3>

            <nav className="space-y-2">
              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all text-sm group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Personal Details
              </button>

              <button
                onClick={() => navigate("/my-orders")}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-blue-600 text-white font-bold transition-all text-sm shadow-xl shadow-blue-200"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                My Orders
              </button>

              <button
                onClick={() => navigate("/my-payments")}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all text-sm group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                My Payments
              </button>
            </nav>
          </div>
        </aside>

        {/* ORDER LIST */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Orders</h2>
              <p className="text-slate-500 mt-2 font-medium">
                Track and manage your recent purchases
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* STATUS FILTER */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-100 rounded-[1.25rem] text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all cursor-pointer"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-white px-6 py-3 rounded-[1.25rem] border border-slate-100 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Total: <span className="text-slate-900">{filteredOrders.length} Orders</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {currentOrders.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-slate-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-1">No orders yet</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Looks like you haven't placed any orders yet.
                </p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              currentOrders.map((order) => {
                const id = order.id || order._id || "";
                const date = new Date(order.created_at || order.createdAt || "").toLocaleDateString(
                  undefined,
                  { year: "numeric", month: "short", day: "numeric" },
                );
                const status = String(order.status || order.order_status || "").toUpperCase();
                const itemsCount = order.items?.length || 0;
                const total = Number(order.total_amount || order.totalAmount || 0);

                const getStatusStyle = (s: string) => {
                  switch (s) {
                    case "PENDING":
                      return "bg-amber-50 text-amber-700 border-amber-100";
                    case "CONFIRMED":
                      return "bg-blue-50 text-blue-700 border-blue-100";
                    case "SHIPPED":
                      return "bg-blue-50 text-blue-700 border-blue-100";
                    case "DELIVERED":
                      return "bg-emerald-50 text-emerald-700 border-emerald-100";
                    case "CANCELLED":
                    case "FAILED":
                      return "bg-rose-50 text-rose-700 border-rose-100";
                    default:
                      return "bg-slate-50 text-slate-600 border-slate-100";
                  }
                };

                return (
                  <div
                    key={id}
                    onClick={() => openDetails(order)}
                    className="group bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden"
                  >
                    {/* Card Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 opacity-40 group-hover:scale-125 transition-transform duration-700"></div>

                    <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                      <div className="flex items-start gap-5">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-500">
                          <svg
                            className="w-8 h-8 text-slate-300 group-hover:text-white transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h4 className="font-black text-slate-900 text-xl tracking-tight">
                              #{id.slice(0, 8).toUpperCase()}
                            </h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                              {date}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-sm text-slate-500 font-bold">
                              {itemsCount} {itemsCount === 1 ? "Item" : "Items"}
                            </p>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                            <p className="text-sm font-black text-slate-900">
                              ₹{total.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                        <span
                          className={`text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest border ${getStatusStyle(status)}`}
                        >
                          {status}
                        </span>
                        <div className="flex -space-x-3 overflow-hidden">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded-xl border-4 border-white bg-slate-50 overflow-hidden shadow-sm"
                            >
                              <img
                                src={getImageUrl(item.product)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {itemsCount > 3 && (
                            <div className="w-10 h-10 rounded-xl border-4 border-white bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                              +{itemsCount - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Secured Delivery
                      </div>
                      <span className="text-sm font-black text-blue-600 group-hover:translate-x-1 transition-all flex items-center gap-2">
                        Manage Order
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* PAGINATION */}
          {orders.length > ordersPerPage && (
            <div className="flex justify-center items-center gap-4 mt-12 bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-100 w-fit mx-auto shadow-sm">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="group w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Logic to show 1, last, and current +/- 1
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[48px] h-12 flex items-center justify-center rounded-2xl font-black text-xs transition-all ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110"
                            : "bg-white text-slate-500 border border-slate-100 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {String(pageNum).padStart(2, "0")}
                      </button>
                    );
                  }

                  // Show ellipsis
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span
                        key={i}
                        className="w-8 h-12 flex items-center justify-center text-slate-400 font-bold"
                      >
                        ...
                      </span>
                    );
                  }

                  return null;
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="group w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= POPUP MODAL ================= */}

      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-slide-up relative">
            {/* CLOSE */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors z-10"
            >
              ✕
            </button>

            {/* Modal Content */}
            <div className="p-8 md:p-12">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 pb-8 border-b border-slate-100">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                    Order Details
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      #
                      {String(selectedOrder.id || selectedOrder._id)
                        .slice(0, 8)
                        .toUpperCase()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-sm font-bold text-slate-500">
                      {new Date(
                        selectedOrder.created_at || selectedOrder.createdAt || "",
                      ).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-6 py-2.5 rounded-full font-black uppercase tracking-widest border ${
                    selectedOrder.status === "pending" || selectedOrder.status === "PENDING"
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : selectedOrder.status === "confirmed" || selectedOrder.status === "CONFIRMED"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : selectedOrder.status === "shipped" || selectedOrder.status === "SHIPPED"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : selectedOrder.status === "delivered" ||
                              selectedOrder.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}
                >
                  {String(selectedOrder.status || selectedOrder.order_status || "").toUpperCase()}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* ADDRESS */}
                <div className="md:col-span-2 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Delivery Address
                  </h3>
                  <p className="font-bold text-slate-700">
                    {selectedOrder.address?.full_name ||
                      selectedOrder.address?.fullname ||
                      (selectedOrder.shippingAddress as any)?.fullname}
                  </p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {selectedOrder.address?.address_line_1 ||
                      selectedOrder.address?.addressline1 ||
                      (selectedOrder.shippingAddress as any)?.addressLine1}
                    ,{selectedOrder.address?.city || (selectedOrder.shippingAddress as any)?.city}{" "}
                    <br />
                    {selectedOrder.address?.state ||
                      (selectedOrder.shippingAddress as any)?.state}{" "}
                    -{" "}
                    {selectedOrder.address?.postal_code ||
                      selectedOrder.address?.postalcode ||
                      (selectedOrder.shippingAddress as any)?.postalCode}{" "}
                    <br />
                    {selectedOrder.address?.country ||
                      (selectedOrder.shippingAddress as any)?.country}
                  </p>
                </div>

                {/* SUMMARY */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Order Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Items Total</span>
                      <span>
                        ₹
                        {Number(
                          selectedOrder.total_amount || selectedOrder.totalAmount,
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery</span>
                      <span className="text-green-600 font-bold">Free</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-base">
                      <span>Grand Total</span>
                      <span>
                        ₹
                        {Number(
                          selectedOrder.total_amount || selectedOrder.totalAmount,
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ITEMS */}
              <h3 className="font-bold text-slate-800 mb-4 px-1">Items in your order</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div
                    key={(item as any).id || (item as any)._id || idx}
                    className="flex gap-4 items-center p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 transition-colors"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex-shrink-0 p-1 border border-slate-100">
                      <img
                        src={getImageUrl(item.product)}
                        alt={item.product?.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{item.product?.name}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-black px-2 py-0.5 rounded-md border border-slate-200 uppercase tracking-wider">
                          Qty: {item.quantity}
                        </span>
                        {(item as any).size && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wider">
                            Size: {(item as any).size}
                          </span>
                        )}
                        {(item as any).color && (
                          <span className="text-[10px] bg-purple-50 text-purple-600 font-black px-2 py-0.5 rounded-md border border-purple-100 uppercase tracking-wider">
                            Color: {(item as any).color}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="font-bold text-slate-900">
                      ₹{(Number(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
                {(selectedOrder.status?.toUpperCase() === "CONFIRMED" ||
                  selectedOrder.status?.toUpperCase() === "PENDING") && (
                  <button
                    onClick={() => {
                      const isConfirmed = window.confirm(
                        "Are you sure you want to cancel this order?",
                      );

                      if (isConfirmed) {
                        handleCancelOrder();
                      }
                    }}
                    disabled={cancelLoading}
                    className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-100 hover:shadow-lg hover:shadow-red-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {cancelLoading ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
