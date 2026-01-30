import { useEffect, useState } from "react";
import { getMyOrders, cancelMyOrder } from "../../../services/api";
import Header from "../../../components/common/Header";
import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

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
    <>
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-12 gap-6">
        {/* SIDEBAR */}
        <aside className="col-span-12 md:col-span-3 bg-white rounded-lg shadow p-5 h-fit sticky top-24">
          <h3 className="font-semibold text-lg mb-4">My Account</h3>

          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => navigate("/profile")}
                className="text-gray-600 hover:text-blue-600"
              >
                Personal Details
              </button>
            </li>

            <li>
              <button className="text-blue-600 font-medium">My Orders</button>
            </li>

            <li>
              <button
                onClick={() => navigate("/my-payments")}
                className="text-gray-600 hover:text-blue-600"
              >
                My Payments
              </button>
            </li>
          </ul>
        </aside>

        {/* ORDER LIST */}
        <div className="col-span-12 md:col-span-9 space-y-4">
          {currentOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => openDetails(order)}
              className="w-full text-left bg-white border rounded-lg p-4 shadow-sm hover:shadow transition"
            >
              <p className="text-sm text-gray-500">
                Order #{order.id.slice(0, 8)}
              </p>

              <p className="text-sm">
                {new Date(order.created_at).toLocaleDateString()}
              </p>

              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">
                  ₹{Number(order.totalAmount).toLocaleString()}
                </span>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${order.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "shipped"
                          ? "bg-purple-100 text-purple-700"
                          : order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                              ? "bg-gray-200 text-gray-700"
                              : order.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-700"
                    }`}
                >
                  {order.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* PAGINATION */}
      {orders.length > ordersPerPage && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* ================= POPUP MODAL ================= */}

      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            {/* CLOSE */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <div className="p-6">
              {/* HEADER */}
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    Order #{selectedOrder.id.slice(0, 8)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${selectedOrder.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : selectedOrder.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : selectedOrder.status === "shipped"
                          ? "bg-purple-100 text-purple-700"
                          : selectedOrder.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : selectedOrder.status === "cancelled"
                              ? "bg-gray-200 text-gray-700"
                              : selectedOrder.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-700"
                    }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              {/* ADDRESS */}
              <div className="mb-5">
                <h3 className="font-semibold mb-1">Delivery Address</h3>
                <p className="text-sm text-gray-600">
                  {selectedOrder.address?.fullname}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.address?.addressline1},{" "}
                  {selectedOrder.address?.city}, {selectedOrder.address?.state}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.address?.postalcode},{" "}
                  {selectedOrder.address?.country}
                </p>
              </div>

              {/* ITEMS */}
              <div className="space-y-3">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-16 h-16 object-contain bg-gray-50 rounded"
                    />

                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-medium">
                      ₹{(Number(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="mt-6 border-t pt-4 flex justify-between items-center">
                <span className="font-semibold text-lg">
                  Total: ₹{Number(selectedOrder.totalAmount).toLocaleString()}
                </span>

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
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelLoading ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyOrders;
