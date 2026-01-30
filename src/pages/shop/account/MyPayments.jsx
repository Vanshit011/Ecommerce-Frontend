import { useEffect, useState } from "react";
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

    const currentPayments = payments.slice(
        indexOfFirstPayment,
        indexOfLastPayment
    );

    const totalPages = Math.ceil(payments.length / paymentsPerPage);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const res = await getMyPayments();
            setPayments(res.data || []);
        } catch (err) {
            showToast(
                err?.response?.data?.message || "Failed to load payments",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

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
                <div className="p-10 text-center text-gray-500">
                    Loading your payments...
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
                            <button
                                onClick={() => navigate("/my-orders")}
                                className="text-gray-600 hover:text-blue-600"
                            >
                                My Orders
                            </button>
                        </li>

                        <li>
                            <button className="text-blue-600 font-medium">
                                My Payments
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* PAYMENT LIST */}
                <div className="col-span-12 md:col-span-9">
                    <h2 className="text-2xl font-semibold mb-6">Payment History</h2>

                    {payments.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                            No payments found
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentPayments.map((payment) => (
                                <button
                                    key={payment.id}
                                    onClick={() => openDetails(payment)}
                                    className="w-full text-left bg-white border rounded-lg p-4 shadow-sm hover:shadow transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">
                                                Payment ID: {payment.id?.slice(0, 12)}...
                                            </p>
                                            {payment.orderId && (
                                                <p className="text-sm text-gray-500">
                                                    Order ID: {payment.orderId?.slice(0, 12)}...
                                                </p>
                                            )}
                                            <p className="text-sm mt-1">
                                                {new Date(
                                                    payment.created_at || payment.createdAt
                                                ).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-semibold text-lg">
                                                ₹{Number(payment.amount || 0).toLocaleString()}
                                            </p>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full font-semibold capitalize inline-block mt-2 ${getStatusColor(
                                                    payment.status
                                                )}`}
                                            >
                                                {payment.status || "Unknown"}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* PAGINATION */}
                    {payments.length > paymentsPerPage && (
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
                </div>
            </div>

            {/* ================= POPUP MODAL ================= */}

            {modalOpen && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        {/* CLOSE */}
                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
                        >
                            ✕
                        </button>

                        <div className="p-6">
                            {/* HEADER */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-2">Payment Details</h2>
                                <p className="text-sm text-gray-500">
                                    {new Date(
                                        selectedPayment.created_at || selectedPayment.createdAt
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
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Payment ID:</span>
                                    <span className="font-medium text-sm">
                                        {selectedPayment.id}
                                    </span>
                                </div>

                                {selectedPayment.orderId && (
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="font-medium text-sm">
                                            {selectedPayment.orderId}
                                        </span>
                                    </div>
                                )}

                                {selectedPayment.stripePaymentIntentId && (
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Stripe Payment ID:</span>
                                        <span className="font-medium text-sm break-all">
                                            {selectedPayment.stripePaymentIntentId}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-semibold text-lg">
                                        ₹{Number(selectedPayment.amount || 0).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Status:</span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${getStatusColor(
                                            selectedPayment.status
                                        )}`}
                                    >
                                        {selectedPayment.status || "Unknown"}
                                    </span>
                                </div>

                                {selectedPayment.paymentMethod && (
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="font-medium">
                                            {selectedPayment.paymentMethod}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-3">
                                {selectedPayment.orderId && (
                                    <button
                                        onClick={() => {
                                            closeModal();
                                            navigate(`/my-orders`);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        View Order
                                    </button>
                                )}
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyPayments;
