import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrderById } from "../../../services/api";
import Header from "../../../components/common/Header";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(5);

  // Fetch order
  useEffect(() => {
    if (id) {
      getOrderById(id).then((res) => {
        console.log("ORDER RESPONSE 👉", res.data);
        setOrder(res.data);
      });
    }
  }, [id]);

  // Auto redirect after 5 sec
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    const timer = setTimeout(() => {
      navigate("/home");
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  if (!order)
    return (
      <>
        <Header />
        <div className="text-center py-16">Loading order details...</div>
      </>
    );

  return (
    <>
      <Header />

      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* SUCCESS HEADER */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-6">
          <h1 className="text-2xl font-semibold text-green-600">
            Payment Successful 🎉
          </h1>

          <p className="mt-2 text-gray-600">
            Order <b>#{order.id}</b> confirmed!
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Redirecting to home in {secondsLeft}s...
          </p>

          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => navigate("/my-orders")}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            >
              Go to My Orders
            </button>

            <button
              onClick={() => navigate("/home")}
              className="border px-5 py-2 rounded hover:bg-gray-100"
            >
             Continue Shopping
            </button>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">Order Summary</h2>

          <div className="flex justify-between text-sm mb-2">
            <span>Status</span>
            <span className="font-medium">{order.status}</span>
          </div>

          <div className="flex justify-between text-sm mb-2">
            <span>Payment Method</span>
            <span className="font-medium">
              {order.paymentMethod || "Online"}
            </span>
          </div>

          <div className="flex justify-between text-sm mb-2">
            <span>Total Paid</span>
            <span className="font-medium">
              ₹{Number(order.totalAmount).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Date</span>
            <span>{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* DELIVERY ADDRESS */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-3">Delivery Address</h2>

          <p className="text-sm text-gray-700">{order.address?.fullname}</p>

          <p className="text-sm text-gray-600">
            {order.address?.addressline1}, {order.address?.city},{" "}
            {order.address?.state}
          </p>

          <p className="text-sm text-gray-600">
            {order.address?.postalcode}, {order.address?.country}
          </p>
        </div>

      </div>
    </>
  );
};

export default OrderSuccess;
