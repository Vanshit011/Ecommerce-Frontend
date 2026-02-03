import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { payOrder, getOrderById } from "../../../services/api";
import Header from "../../../components/common/Header";
import { useToast } from "../../../context/ToastContext";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

// =======================
// CHECKOUT FORM
// =======================
const CheckoutForm = ({ order }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success/${order.id}`,
      },
      redirect: "if_required",
    });

    if (error) {
      showToast(error.message, "error");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      navigate(`/order-success/${order.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <PaymentElement />
      </div>

      <button
        disabled={!stripe || loading}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 ${loading || !stripe
          ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
          }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Pay ₹{(order?.totalPrice || order?.totalAmount || 0).toLocaleString()}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>256-Bit SSL Encrypted Payment</span>
      </div>
    </form>
  );
};

// =======================
// CHECKOUT PAGE
// =======================
const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState("");

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadCheckout();
    }
  }, []);

  const loadCheckout = async () => {
    try {
      setLoading(true);
      console.log("Loading checkout for order ID:", id);

      const response = await getOrderById(id);
      const orderData = response.data || response;

      if (!orderData || !orderData.id) {
        setFatalError("Order not found");
        return;
      }

      const orderStatus = orderData.status?.toUpperCase();

      if (orderStatus === "CONFIRMED") {
        navigate(`/order-success/${orderData.id}`);
        return;
      }

      setOrder(orderData);

      if (orderStatus === "PENDING" && !clientSecret) {
        try {
          const payRes = await payOrder(id);
          const secret = payRes.data?.clientSecret || payRes.clientSecret;

          if (secret) {
            setClientSecret(secret);
          } else {
            setFatalError("Failed to initialize payment - no client secret received");
          }
        } catch (payError) {
          const errorMsg = payError?.response?.data?.message || payError?.message || "Failed to create payment";
          setFatalError(errorMsg);
          showToast(errorMsg, "error");
        }
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to load checkout";
      setFatalError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fatalError) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Checkout Error</h3>
            <p className="text-slate-500 mb-6">{fatalError}</p>
            <button onClick={() => navigate("/cart")} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold">Return to Cart</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !order || !clientSecret) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Secure Checkout</h1>
              <p className="text-slate-500 font-medium">Complete your purchase safely</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Order Total</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">₹{(order.totalPrice || order.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-200 my-4" />
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {order.items?.length || 0} items in your cart
              </div>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: '#2563eb',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '12px',
                  }
                },
              }}
            >
              <CheckoutForm order={order} />
            </Elements>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-slate-400 font-medium">
          Problems with checkout? <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate('/cart')}>Return to Cart</span>
        </p>
      </div>
    </div>
  );
};

export default Checkout;
