import { useEffect, useState } from "react";
import { getMyOrders } from "../../../services/api";
import Header from "../../../components/common/Header";
import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* HEADER BAR */}
        <div className="flex items-center justify-between mb-6">

          <h1 className="text-2xl font-semibold">
            My Orders
          </h1>

          <button
            onClick={() => navigate("/profile")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Profile
          </button>

        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded shadow p-10 text-center">
            <p className="text-gray-600 mb-4">
              You haven’t placed any orders yet.
            </p>

            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-5">

            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow p-5"
              >

                {/* HEADER */}
                <div className="flex justify-between mb-4">

                  <div>
                    <p className="text-sm text-gray-500">
                      Order #{order.id.slice(0, 8)}
                    </p>

                    <p className="text-sm">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${order.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : order.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* ITEMS */}
                <div className="space-y-3">

                  {(order.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 items-center"
                    >

                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-contain bg-gray-50 rounded"
                      />

                      <div className="flex-1">
                        <p className="font-medium">
                          {item.product.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="font-medium">
                        ₹
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString()}
                      </p>

                    </div>
                  ))}
                </div>

                {/* FOOTER */}
                <div className="flex justify-between mt-4 pt-4 border-t">

                  <span className="font-semibold">
                    Total: ₹
                    {Number(
                      order.totalAmount
                    ).toLocaleString()}
                  </span>

                  {/* <button
                    onClick={() =>
                      navigate(`/orders/${order.id}`)
                    }
                    className="text-blue-600 text-sm"
                  >
                    View Details →
                  </button> */}

                </div>

              </div>
            ))}

          </div>
        )}
      </div>
    </>
  );
};

export default MyOrders;
