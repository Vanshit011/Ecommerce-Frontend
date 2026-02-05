import React, { useState, useEffect, useCallback } from "react";
import { getMyPayments } from "../../../services/api";
import Header from "../../../components/common/Header";
import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const MyPayments = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;

  const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment);

  const totalPages = Math.ceil(payments.length / paymentsPerPage);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const loadPayments = useCallback(async () => {
    try {
      const res = await getMyPayments();
      setPayments(res.data || []);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load payments", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const openDetails = (payment) => {
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPayment(null);
  };

  const getStatusColor = (status) => {
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
        <Header />
        <div className="p-10 text-center text-gray-500">Loading your payments...</div>
      </>
    );

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[280px_1fr] gap-8">
        {/* SIDEBAR */}
        <aside className="h-fit sticky top-24 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-6 px-2">Account Menu</h3>

            <nav className="space-y-1">
              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all text-sm group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-400 group-hover:text-slate-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Personal Details
              </button>

              <button
                onClick={() => navigate("/my-orders")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all text-sm group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-400 group-hover:text-slate-600"
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
                My Orders
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold transition-all text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                My Payments
              </button>
            </nav>
          </div>
        </aside>

        {/* PAYMENT LIST */}
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Payment History</h2>
              <p className="text-slate-500 mt-1 text-sm">View all your transactions and invoices</p>
            </div>
            <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              Total Records: <span className="text-slate-900 font-bold">{payments.length}</span>
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
              {currentPayments.map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => openDetails(payment)}
                  className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 cursor-pointer flex items-center gap-5"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${
                      payment.status === "succeeded" || payment.status === "completed"
                        ? "bg-green-50 border-green-100 text-green-600"
                        : payment.status === "pending"
                          ? "bg-yellow-50 border-yellow-100 text-yellow-600"
                          : "bg-red-50 border-red-100 text-red-600"
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

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800 text-sm truncate">
                        ID: {payment.id?.slice(0, 16).toUpperCase()}...
                      </h4>
                      {payment.orderId && (
                        <span className="hidden sm:inline-block text-slate-300">•</span>
                      )}
                      {payment.orderId && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 truncate max-w-[150px]">
                          Order: #{payment.orderId.slice(0, 8).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {new Date(payment.created_at || payment.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-slate-900 text-lg">
                      ₹{Number(payment.amount || 0).toLocaleString()}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide inline-block mt-1 ${getStatusColor(
                        payment.status,
                      )}`}
                    >
                      {payment.status || "Unknown"}
                    </span>
                  </div>

                  <div className="hidden sm:block text-slate-300 group-hover:text-blue-500 transition-colors pl-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {payments.length > paymentsPerPage && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white hover:shadow-md disabled:opacity-30 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-600"
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

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
                    currentPage === i + 1
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white hover:shadow-md disabled:opacity-30 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-600"
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
                    selectedPayment.created_at || selectedPayment.createdAt,
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
                    {selectedPayment.id}
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
