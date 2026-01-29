import { useEffect, useState } from "react";
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
const CheckoutForm = ({ order, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);

    console.log("CONFIRM PAYMENT START");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success/${order.id}`,
      },
      redirect: "if_required",
    });

    console.log("CONFIRM RESULT:", { error, paymentIntent });

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

  console.log("CHECKOUT COMPONENT RENDERED");

  useEffect(() => {
    console.log("USE EFFECT RUN");
    loadCheckout();
  }, []);

  const loadCheckout = async () => {
    try {
      console.log("LOAD CHECKOUT CALLED");
      console.log("ORDER ID PARAM:", id);

      setLoading(true);

      const orderRes = await getOrderById(id);
      console.log("ORDER API RESPONSE:", orderRes.data);

      const orderData = orderRes.data;

      if (!orderData) {
        setFatalError("Order not found");
        return;
      }

      if (orderData.status === "CONFIRMED") {
        console.log("ORDER ALREADY CONFIRMED");
        navigate(`/order-success/${orderData.id}`);
        return;
      }

      setOrder(orderData);

      if (orderData.status === "pending") {
        console.log("CREATING PAYMENT INTENT");

        const payRes = await payOrder(id);

        console.log("PAY ORDER RESPONSE:", payRes.data);

        setClientSecret(payRes.data.clientSecret);
      } else {
        setFatalError("Order cannot be paid");
      }
    } catch (err) {
      console.error("CHECKOUT LOAD ERROR:", err);
      setFatalError("Failed to load checkout");
      showToast("Failed to load checkout", "error");
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
          <CheckoutForm
            order={order}
            clientSecret={clientSecret}
          />
        </Elements>
      </div>
    </>
  );
};

export default Checkout;
