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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
      <PaymentElement />

      <button
        disabled={!stripe || loading}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded disabled:opacity-60"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
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
      console.log("Order response received:", response);

      // Handle both nested and direct response structures
      const orderData = response.data || response;
      console.log("Order data extracted:", orderData);

      if (!orderData || !orderData.id) {
        setFatalError("Order not found");
        return;
      }

      // Check if order is already confirmed
      const orderStatus = orderData.status?.toUpperCase();

      if (orderStatus === "CONFIRMED") {
        console.log("Order already confirmed, redirecting to success page");
        navigate(`/order-success/${orderData.id}`);
        return;
      }

      setOrder(orderData);

      // Only create payment intent if order is pending and we don't have a client secret
      if (orderStatus === "PENDING" && !clientSecret) {
        console.log("Creating payment intent for order:", orderData.id);

        try {
          const payRes = await payOrder(id);
          console.log("Payment response:", payRes);

          // Handle both nested and direct clientSecret
          const secret = payRes.data?.clientSecret || payRes.clientSecret;

          if (secret) {
            setClientSecret(secret);
            console.log("Client secret set successfully");
          } else {
            console.error("No client secret in payment response:", payRes);
            setFatalError("Failed to initialize payment - no client secret received");
          }
        } catch (payError) {
          console.error("Payment creation error:", payError);
          const errorMsg = payError?.response?.data?.message ||
            payError?.message ||
            "Failed to create payment";
          setFatalError(errorMsg);
          showToast(errorMsg, "error");
        }
      }
    } catch (err) {
      console.error("CHECKOUT LOAD ERROR:", err);
      console.error("Error details:", {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status
      });

      const errorMsg = err?.response?.data?.message ||
        err?.message ||
        "Failed to load checkout";
      setFatalError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fatalError) {
    return (
      <>
        <Header />
        <div className="p-10 text-center text-red-600">
          {fatalError}
        </div>
      </>
    );
  }

  if (loading || !order || !clientSecret) {
    return (
      <>
        <Header />
        <div className="p-10 text-center">Loading checkout...</div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="max-w-xl mx-auto py-10">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: { theme: "stripe" },
          }}
        >
          <CheckoutForm order={order} />
        </Elements>
      </div>
    </>
  );
};

export default Checkout;
