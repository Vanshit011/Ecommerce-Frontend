import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { payOrder, getOrderById } from "../../../services/api";

import { useToast } from "../../../context/ToastContext";
import { Order } from "../../../types";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

// =======================
// CHECKOUT FORM
// =======================
interface CheckoutFormProps {
  order: Order;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ order }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!stripe || !elements) {
      console.error("❌ Stripe or Elements not loaded");
      return;
    }

    setLoading(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success/${order.id || order._id}`,
        },
        redirect: "if_required",
      });

      const { error, paymentIntent } = result;

      if (error) {
        console.error("❌ Payment Error:", error.message);
        setErrorMsg(error.message || "An error occurred");
        showToast(error.message || "Payment failed", "error");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        console.log("✅ Payment Succeeded:", paymentIntent);
        navigate(`/order-success/${order.id || order._id}`);
      }
    } catch (err: any) {
      console.error("❌ Unexpected Error during payment:", err);
      setErrorMsg("Unexpected error occurred: " + err.message);
      showToast("Unexpected error occurred", "error");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[150px]">
        <PaymentElement />
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {errorMsg}
        </div>
      )}

      <button
        disabled={!stripe || loading}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 ${
          loading || !stripe
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
            Pay ₹
            {(order?.total_amount || order?.totalPrice || order?.totalAmount || 0).toLocaleString()}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-emerald-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>256-Bit SSL Encrypted Payment</span>
      </div>
    </form>
  );
};

// =======================
// CHECKOUT PAGE
// =======================
const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string>("");

  const initialized = useRef(false);

  const loadCheckout = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      console.log("Loading checkout for order ID:", id);

      const response = await getOrderById(id);
      const orderData = (response.data as any).data || (response.data as any) || response.data;

      const orderId = orderData?.id || orderData?._id;

      if (!orderData || !orderId) {
        setFatalError("Order not found");
        return;
      }

      const orderStatus = orderData.status?.toUpperCase();

      if (orderStatus === "CONFIRMED") {
        navigate(`/order-success/${orderId}`);
        return;
      }

      setOrder(orderData);

      if (orderStatus === "PENDING" && !clientSecret) {
        try {
          const payRes = await payOrder(id);
          const secret = payRes.data?.data?.clientSecret || (payRes.data as any).clientSecret;

          if (secret) {
            setClientSecret(secret);
          } else {
            setFatalError("Failed to initialize payment - no client secret received");
          }
        } catch (payError: any) {
          const errorMsg =
            payError?.response?.data?.message || payError?.message || "Failed to create payment";
          setFatalError(errorMsg);
          showToast(errorMsg, "error");
        }
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to load checkout";
      setFatalError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast, clientSecret]);

  const options = useMemo<StripeElementsOptions | null>(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              theme: "stripe" as const,
              variables: {
                colorPrimary: "#4f46e5",
                fontFamily: "system-ui, sans-serif",
                borderRadius: "12px",
              },
            },
          }
        : null,
    [clientSecret],
  );

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadCheckout();
    }
  }, [loadCheckout]);

  if (fatalError) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Checkout Error</h3>
            <p className="text-slate-500 mb-6">{fatalError}</p>
            <button
              onClick={() => navigate("/cart")}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !order || !clientSecret) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Secure Checkout
              </h1>
              <p className="text-slate-500 font-medium">Complete your purchase safely</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Order Total
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹
                  {(
                    order.total_amount ||
                    order.totalPrice ||
                    order.totalAmount ||
                    0
                  ).toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-slate-200 my-4" />
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {order.items?.length || 0} items in your cart
              </div>
            </div>

            {options && (
              <Elements stripe={stripePromise} options={options} key={clientSecret}>
                <CheckoutForm order={order} />
              </Elements>
            )}
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-slate-400 font-medium">
          Problems with checkout?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/cart")}
          >
            Return to Cart
          </span>
        </p>
      </div>
    </div>
  );
};

export default Checkout;
