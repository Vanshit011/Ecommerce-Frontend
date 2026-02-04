import { useEffect, useState } from "react";
import { getMyOrders, cancelMyOrder } from "../../../services/api";
import Header from "../../../components/common/Header";
import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUtils";

const MyOrders = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      setCancelLoading(true);

      await cancelMyOrder(selectedOrder.id);

      showToast("Order cancelled successfully", "success");

      closeModal();
      loadOrders();
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to cancel order",
        "error",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data || []);
    } catch {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (order) => {
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
        <Header />
        <div className="p-10 text-center text-gray-500">
          Loading your orders...
        </div>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Personal Details
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold transition-all text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                My Orders
              </button>

              <button
                onClick={() => navigate("/my-payments")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all text-sm group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                My Payments
              </button>
            </nav>
          </div>
        </aside>

        {/* ORDER LIST */}
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">My Orders</h2>
              <p className="text-slate-500 mt-1 text-sm">Track and manage your recent purchases</p>
            </div>
            <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              Total Orders: <span className="text-slate-900 font-bold">{orders.length}</span>
            </div>
          </div>

          <div className="space-y-4">
            {currentOrders.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-1">No orders yet</h3>
                <p className="text-slate-500 text-sm mb-6">Looks like you haven't placed any orders yet.</p>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              currentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => openDetails(order)}
                  className="group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-white rounded-bl-full -z-0 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex flex-col sm:flex-row justify-between gap-6 relative z-10">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:border-blue-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-800 text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</h4>
                          <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                          {order.items?.length || 0} Items • Total: <span className="text-slate-900 font-bold">₹{Number(order.totalAmount).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-center gap-2">
                      <span
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider ${order.status === "pending"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          : order.status === "confirmed"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : order.status === "shipped"
                              ? "bg-purple-50 text-purple-700 border border-purple-100"
                              : order.status === "delivered"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden" title={item.product?.name}>
                          <img src={getImageUrl(item.product)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION */}
          {orders.length > ordersPerPage && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white hover:shadow-md disabled:opacity-30 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${currentPage === i + 1
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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

            <div className="p-8">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Order Details
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">
                    ID: #{selectedOrder.id.slice(0, 8).toUpperCase()} • {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider ${selectedOrder.status === "pending"
                    ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                    : selectedOrder.status === "confirmed"
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : selectedOrder.status === "shipped"
                        ? "bg-purple-50 text-purple-700 border border-purple-100"
                        : selectedOrder.status === "delivered"
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* ADDRESS */}
                <div className="md:col-span-2 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Delivery Address
                  </h3>
                  <p className="font-bold text-slate-700">{selectedOrder.address?.fullname}</p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {selectedOrder.address?.addressline1}, {selectedOrder.address?.city} <br />
                    {selectedOrder.address?.state} - {selectedOrder.address?.postalcode} <br />
                    {selectedOrder.address?.country}
                  </p>
                </div>

                {/* SUMMARY */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Order Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Items Total</span>
                      <span>₹{Number(selectedOrder.totalAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery</span>
                      <span className="text-green-600 font-bold">Free</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-base">
                      <span>Grand Total</span>
                      <span>₹{Number(selectedOrder.totalAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ITEMS */}
              <h3 className="font-bold text-slate-800 mb-4 px-1">Items in your order</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="flex gap-4 items-center p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 transition-colors">
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
                        {item.size && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wider">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[10px] bg-purple-50 text-purple-600 font-black px-2 py-0.5 rounded-md border border-purple-100 uppercase tracking-wider">
                            Color: {item.color}
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
                {selectedOrder.status === "confirmed" && (
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
