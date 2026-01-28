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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success/${order.id}`,
      },
    });

    if (error) {
      showToast(error.message, "error");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow"
    >
      <PaymentElement />

      <button
        disabled={!stripe || loading}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { id } = useParams();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const orderRes = await getOrderById(id);
      setOrder(orderRes.data);

      const payRes = await payOrder(id);
      setClientSecret(payRes.data.clientSecret);
    } catch {
      showToast("Failed to load payment", "error");
    }
  };

  if (!clientSecret || !order)
    return (
      <>
        <Header />
        <div className="p-10 text-center">
          Loading checkout...
        </div>
      </>
    );

  return (
    <>
      <Header />

      <div className="max-w-xl mx-auto py-10">
        <Elements
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <CheckoutForm order={order} />
        </Elements>
      </div>
    </>
  );
};

export default Checkout;
