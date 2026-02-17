import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrderById } from "../../../services/api";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [displayDate] = useState(() => Date.now());

  // Fetch order
  useEffect(() => {
    if (id) {
      getOrderById(id).then((res) => {
        // Handle various response structures
        const data = res.data?.data || res.data;
        setOrder(data);
      });
    }
  }, [id]);

  if (!order)
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </div>
    );

  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 text-center border border-slate-100 relative overflow-hidden">
          {/* Confetti Background Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div
              className="absolute top-10 left-10 w-4 h-4 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="absolute top-20 right-20 w-3 h-3 bg-red-500 transform rotate-45 animate-bounce"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute bottom-10 left-1/4 w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "2s" }}
            />
          </div>

          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-emerald-50/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Order Confirmed!
          </h1>
          <p className="text-slate-500 font-medium text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Thank you for your purchase. We've received your order{" "}
            <span className="text-slate-900 font-bold">#{order.id?.slice(0, 8)}</span> and sent a
            confirmation email.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => navigate("/my-orders")}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
            >
              View My Order
            </button>
            <button
              onClick={() => navigate("/home")}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-600 border-2 border-slate-100 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95"
            >
              Continue Shopping
            </button>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-3xl p-6 md:p-8 text-left border border-slate-100">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">
              Receipt
            </h3>

            <dl className="space-y-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500 font-medium">Payment Method</dt>
                <dd className="font-bold text-slate-900 capitalize">
                  {order.paymentMethod || "Online Card"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 font-medium">Date</dt>
                <dd className="font-bold text-slate-900">
                  {new Date(
                    order.created_at || order.createdAt || displayDate,
                  ).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 font-medium">Email</dt>
                <dd className="font-bold text-slate-900">
                  {order.user?.email || "Sent to your email"}
                </dd>
              </div>

              <div className="border-t border-slate-200 my-4 pt-4 flex justify-between items-end">
                <dt className="font-black text-slate-900 text-lg">Total Paid</dt>
                <dd className="font-black text-indigo-600 text-2xl tracking-tighter">
                  ₹
                  {Number(
                    order.total_amount || order.totalAmount || order.totalPrice,
                  ).toLocaleString()}
                </dd>
              </div>
            </dl>

            {order.address && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Shipping to</p>
                <p className="font-bold text-slate-900">
                  {order.address.full_name || order.address.fullname}
                </p>
                <p className="text-slate-500">
                  {order.address.address_line_1 || order.address.addressline1}, {order.address.city}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
