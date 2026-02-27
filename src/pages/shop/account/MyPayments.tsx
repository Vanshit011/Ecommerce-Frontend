import React, { useState, useEffect, useCallback } from "react";
import { getMyPayments } from "../../../services/api";

import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { Payment } from "../../../types";

const MyPayments: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;

  const filteredPayments = payments.filter((payment) => {
    if (statusFilter === "all") return true;
    return payment.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;

  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);

  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const loadPayments = useCallback(async () => {
    try {
      const res = await getMyPayments();
      const paymentList = (res.data as any).data || (res.data as any) || [];
      setPayments(Array.isArray(paymentList) ? paymentList : []);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to load payments", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const openDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPayment(null);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "succeeded":
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "canceled":
      case "cancelled":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading)
    return (
      <>
        <div className="p-10 text-center text-gray-500">Loading your payments...</div>
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
                My Orders
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-blue-600 text-white font-bold transition-all text-sm shadow-xl shadow-blue-200">
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
                My Payments
              </button>
            </nav>
          </div>
        </aside>

        {/* PAYMENT LIST */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment History</h2>
              <p className="text-slate-500 mt-2 font-medium">
                View all your transactions and invoices
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
                  <option value="all">All Payments</option>
                  <option value="succeeded">Succeeded</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
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
                Total: <span className="text-slate-900">{filteredPayments.length} Records</span>
              </div>
            </div>
          </div>

          {payments.length === 0 ? (
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
                    d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                  />
                </svg>
              </div>
              <h3 className="text-slate-900 font-bold text-lg mb-1">No payment history</h3>
              <p className="text-slate-500 text-sm">You haven't made any transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentPayments.map((payment) => {
                const id = payment.id || payment._id || "";
                const status = String(payment.status || "UNKNOWN").toUpperCase();
                const amount = Number(payment.amount || 0);
                const date = new Date(
                  payment.created_at || payment.createdAt || "",
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const getPaymentStatusStyle = (s: string) => {
                  switch (s) {
                    case "SUCCEEDED":
                    case "COMPLETED":
                      return "bg-emerald-50 text-emerald-700 border-emerald-100";
                    case "PENDING":
                      return "bg-amber-50 text-amber-700 border-amber-100";
                    case "FAILED":
                      return "bg-rose-50 text-rose-700 border-rose-100";
                    case "CANCELED":
                    case "CANCELLED":
                      return "bg-slate-100 text-slate-600 border-slate-100";
                    default:
                      return "bg-slate-50 text-slate-600 border-slate-100";
                  }
                };

                return (
                  <div
                    key={id}
                    onClick={() => openDetails(payment)}
                    className="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[3rem] -z-0 opacity-40 group-hover:scale-125 transition-transform duration-700"></div>

                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 relative z-10 ${
                        status === "SUCCEEDED" || status === "COMPLETED"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                          : status === "PENDING"
                            ? "bg-amber-50 border-amber-100 text-amber-600"
                            : "bg-rose-50 border-rose-100 text-rose-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-7 w-7"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex flex-col mb-1.5">
                        <h4 className="font-black text-slate-900 text-base tracking-tight truncate">
                          ID: {id.slice(0, 16).toUpperCase()}...
                        </h4>
                        {payment.orderId && (
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Rel. Order: #{payment.orderId.slice(0, 8).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        {date}
                      </p>
                    </div>

                    <div className="sm:text-right relative z-10">
                      <p className="font-black text-slate-900 text-2xl tracking-tighter sm:mb-1">
                        ₹{amount.toLocaleString()}
                      </p>
                      <span
                        className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border transition-colors ${getPaymentStatusStyle(status)}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          {payments.length > paymentsPerPage && (
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
                  // Truncate logic
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        disabled={currentPage === pageNum}
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[48px] h-12 flex items-center justify-center rounded-2xl font-black text-xs transition-all ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110"
                            : "bg-white text-slate-500 border border-slate-100 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }

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

      {modalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-slide-up relative">
            {/* CLOSE */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors z-10"
            >
              ✕
            </button>

            <div className="p-8">
              {/* HEADER */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Transaction Details</h2>
                <p className="text-slate-500 text-sm font-medium">
                  {new Date(
                    selectedPayment.created_at || selectedPayment.createdAt || "",
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* PAYMENT INFO */}
              <div className="space-y-4 mb-8 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                  <span className="text-slate-500 text-sm font-medium">Payment ID</span>
                  <span className="font-bold text-slate-800 text-sm font-mono tracking-tight">
                    {selectedPayment.id || selectedPayment._id}
                  </span>
                </div>

                {selectedPayment.orderId && (
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                    <span className="text-slate-500 text-sm font-medium">Order ID</span>
                    <span className="font-bold text-slate-800 text-sm font-mono tracking-tight">
                      {selectedPayment.orderId}
                    </span>
                  </div>
                )}

                {selectedPayment.stripePaymentIntentId && (
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                    <span className="text-slate-500 text-sm font-medium">Stripe Payment ID</span>
                    <span className="font-bold text-slate-800 text-sm font-mono tracking-tight break-all max-w-[200px] text-right">
                      {selectedPayment.stripePaymentIntentId}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                  <span className="text-slate-500 text-sm font-medium">Amount</span>
                  <span className="font-black text-slate-900 text-lg">
                    ₹{Number(selectedPayment.amount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                  <span className="text-slate-500 text-sm font-medium">Status</span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusColor(
                      selectedPayment.status,
                    )}`}
                  >
                    {selectedPayment.status || "Unknown"}
                  </span>
                </div>

                {selectedPayment.paymentMethod && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-medium">Payment Method</span>
                    <span className="font-bold text-slate-800">
                      {selectedPayment.paymentMethod}
                    </span>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                  Close
                </button>
                {selectedPayment.orderId && (
                  <button
                    onClick={() => {
                      closeModal();
                      navigate(`/my-orders`);
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                  >
                    View Order
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

export default MyPayments;
