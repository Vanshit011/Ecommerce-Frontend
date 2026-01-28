import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrderById } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/common/Header";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrderById(id).then((res) => setOrder(res.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!order) return null;

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold text-green-600">
          Payment Successful 🎉
        </h1>

        <p className="mt-2">Order #{order.id} confirmed!</p>
      </div>
    </>
  );
};

export default OrderSuccess;
